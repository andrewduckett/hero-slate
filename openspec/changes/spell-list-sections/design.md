## Context

Stories 16 to 18 built the ingest as pure modules under `src/lib/ingest/ddb/`, with one command-line entry, `cli.ts`. `digest.ts` reads and type-checks the raw D&D Beyond response. It passes plain values to one focused module for each hard rule, such as `actions.ts`, `skills.ts`, and `limitedUses.ts`. Shared formulas live in `rules.ts`.

The digest already reads the `class`, `race`, `background`, and `feat` groups of `spells`, but only for their limited uses. It does not read `classSpells`, the class spell lists. It does not read each class's `id` or spellcasting ability.

The preview, validation, and section renderer already handle any section, so a Magic section needs no change there.

Three recorded responses shape this design:
- **Sunny**, a level 6 Circle of the Land Druid, is new in this change. She has 13 class spells, 7 subclass spells, and 5 species spells. She is the only fixture with a spell attack, cantrip scaling, and healing.
- **Zip**, a level 2 Wizard, has prepared and unprepared spells, rituals, feat spells cast with Wisdom, and two item spells.
- **Urven**, a level 6 Monk, has granted spells but no spellcasting class.

See `proposal.md` for the motivation, and `specs/dndbeyond-ingest/spec.md` for the required behavior.

## Goals / Non-Goals

**Goals:**
- Keep the split from ADR 0009. The digest computes every spell number, and the agent chooses and words the rows.
- Put the spell rules in one small pure module that tests can drive with hand-written inputs.
- Report the facts D&D Beyond gives, and never decide for a class what "castable" means.

**Non-Goals:**
- No change to the app, the preview, or the draft validation.
- No full spell engine. Upcast damage, spell attack items, and spell descriptions stay out.
- No suggested spells, groups, or wording from the digest.

## Decisions

### D1. One new pure module, `spells.ts`, fed by the digest

`spells.ts` computes both `spells` and `spellcasting`. `digest.ts` keeps the job of reading and type-checking the source fields. It passes `spells.ts` plain values:
- the spell records, each tagged with its source and, for a class list, its class id
- the spellcasting classes, each with its id, name, and ability
- the final ability scores, the total level, and the modifier list

The module never sees the raw response. It reads each spell record's loosely typed fields itself and fails safe to "unknown" for one number, as `actions.ts` does.

- *Alternative: extend `actions.ts`.* Rejected. Spells have their own shape: ways, statuses, scaling, and casting abilities. Mixing them would blur both modules' tests.

### D2. The digest reads three new optional fields

`digest.ts` reads these as optional fields, under the existing rule:
- `classSpells`: a list of `{ characterClassId, spells }`
- each class's `id`
- each class's and subclass's `spellCastingAbilityId`

A misshapen `classSpells` exits 5, naming the field. Inside one spell record, a field of an unexpected type affects only that record's numbers, as with limited-use rules.

### D3. Spells are grouped by name, and each record becomes a cast way

D&D Beyond lists the same spell once for each way the character gets it. Sunny's Pass without Trace appears as a prepared Druid spell, a once-per-long-rest Elf spell, and an Elf spell that uses a slot.

The digest lists each spell name once. Each record becomes one *cast way*. Spell-wide facts sit on the entry: `level`, `concentration`, `ritual`, and `saveAbility`. Facts that depend on the record sit on the way: source, status, slot use, limited use, casting ability, and every number.

Numbers sit on the way because the casting ability can differ between ways. Zip casts her Wizard spells with Intelligence and her feat spells with Wisdom.

- *Alternative: one entry per record.* Rejected. The Author would see Pass without Trace three times, and the agent would have to merge them by name.
- *Alternative: merge the ways into one.* Rejected. Merging drops real differences, such as one free cast per long rest.

### D4. Status is a fact, not a filter

Each way gets the first status that applies: `cantrip`, `always`, `granted`, `prepared`, or `not-prepared`.

The `granted` status covers every source except a class list. D&D Beyond's own flags are unreliable there. Sunny's Circle of the Land spells, such as Misty Step, show `prepared: false` and `alwaysPrepared: false`, yet the rules always prepare them.

The digest never leaves a spell out because of its status. The skill recommends from ready spells, and the Author may ask for any spell by name. This follows story 18, where the digest emits all 18 skills and the skill recommends the proficient ones.

- *Alternative: the digest filters to castable spells.* Rejected. It needs a rule for each class: prepared casters, known casters, Wizard rituals. A class we have no fixture for would likely get the rule wrong, and a hidden spell cannot be asked for.

### D5. The casting ability follows three rules, then fails safe

The digest picks a way's casting ability from the first rule that gives one:
1. the record's own `spellCastingAbilityId`, which D&D Beyond sets on feat and species spells
2. for a class list, the ability of the class whose `id` matches `characterClassId`
3. for the `class` group of `spells`, the ability of the only spellcasting class

Rule 3 covers subclass spells, which name no ability. Sunny's Lightning Bolt has none, and Sunny has one spellcasting class. With two spellcasting classes, the digest cannot tell which class grants the spell, so the ability is unknown.

A spellcasting class takes its ability from its definition, or from its subclass definition when the class names none. That covers a subclass caster, such as an Eldritch Knight.

### D6. Spell numbers follow the story-18 pattern

Each number has three states: known, unknown with a reason, and not applicable.

- **To-hit** applies when `requiresAttackRoll` is true. It is the casting modifier plus the proficiency bonus.
- **Save DC** applies when `saveDcAbilityId` is set. It is the record's `overrideSaveDc` when set, and otherwise 8, plus proficiency, plus the casting modifier.
- **Damage** reads the definition's modifiers of type `damage`. **Healing** reads its modifiers of type `bonus` and sub-type `hit-points`.

Damage and healing share one rule. No modifier means not applicable. Two or more means unknown. Sunny's Call Lightning carries `3d10` and `1d10`, and the digest cannot tell which is the base. When the modifier's `usePrimaryStat` is true, the digest appends the casting modifier to the dice string. Cure Wounds becomes `2d8+4`.

`saveAbility` names the target's save whether or not the DC is known.

### D7. Cantrip scaling picks a step; leveled spells never scale

A cantrip's damage modifier lists its scaling steps in `atHigherLevels.higherLevelDefinitions`. Each step carries a character level and a dice string. Sunny's Thorn Whip lists `2d6` at level 5, `3d6` at 11, and `4d6` at 17.

The digest picks the step with the highest level at or below the character's total level. It picks no step when none applies, and keeps the base dice. This is a lookup, not a formula.

For a leveled spell, the digest keeps the modifier's own dice. Its steps describe casting with a higher slot, and the sheet shows the spell at its own level. Lightning Bolt stays `8d6`.

### D8. Spell attack and DC bonuses fail safe to unknown

Items such as a Wand of the War Mage add to spell attacks or spell save DCs. No fixture has one, so we cannot confirm their modifier sub-types.

The digest treats any `bonus` modifier whose sub-type contains `spell-attack` as a sign of such a bonus. Every spell to-hit and every summary spell attack becomes unknown. A sub-type containing `spell-save-dc` does the same for save DCs. A fixed DC on the record is not affected.

- *Alternative: add the bonus.* Rejected until a fixture confirms the sub-types. A wrong pill looks exactly like a right one.

### D9. The spellcasting summary is one entry per spellcasting class

`spellcasting` lists each spellcasting class with its ability, spell attack, and save DC, in the order of `classes`. The "Cast a Spell" row copies one entry's numbers. It uses the entry for the highest-level class, or the first listed on a tie.

Feat and species spells get no summary entry. Their numbers sit on their own ways, and the Magic rows carry them.

### D10. Limited uses on a way reuse the limited-use rule

A way's `limitedUse` uses the same computation as the digest's `limitedUses` list. `limitedUses.ts` exports its single-rule computation, so both callers share one rule. A computed maximum of 0 or less counts as no limited use, matching the existing rule that leaves such entries out.

### D11. The skill builds two tiers

The skill adds a "Cast a Spell" row to Your Turn for a character with a spellcasting class. It then recommends a Magic section of one save spell, one attack spell, and 2 or 3 flavor spells.

The flavor spells carry no pills, so the player fills in the details. The skill recommends from ways whose status is not `not-prepared`.

A known caster, such as a Sorcerer, may show every leveled class spell as `not-prepared`. No fixture confirms how D&D Beyond flags them. A class may have leveled spells in its class spell list, but none marked `prepared` or `always`. For that class, the skill tells the Author and recommends from its whole class spell list. The spec's guided skill flow states this fallback.

A spell may appear in both sections. Thorn Whip can be the Your Turn attack and a Magic row. That is the Author's choice.

### D12. Recorded fixtures are blanked by a checked-in tool, and a test guards them

A recorded response holds the owner's username and user id, and their avatar choices. It holds the whole campaign roster, which names other players. It can also hold the player's free-text backstory and a physical description. The repository is public. See ADR 0010.

This change adds:
- a pure function in `src/lib/ingest/ddb/fixturePrivacy.ts` that blanks the personal fields, and another that lists any it finds still set
- a script, `scripts/blank-ddb-fixture.ts`, that rewrites a recorded response in place with the first function
- a test that runs the second function over every JSON file in `fixtures/`

The script blanks these fields:
- `username`, `userId`, and `campaign`
- every `decorations` field except `themeColor`
- every field of `notes` and `traits`, the player's free-text backstory, allies, ideals, bonds, flaws, and appearance
- the physical description: `gender`, `faith`, `age`, `hair`, `eyes`, `skin`, `height`, and `weight`

These are empty in all three responses today, except for the account and campaign fields. A future fixture could fill them.

The script keeps the rest. The character's name and custom items are fictional game content that the digest reads or the tests need. Catalog art on races, classes, items, and creatures identifies no one.

The digest reads none of these fields, so blanking them changes no digest value.

### D13. Digest text stays data

Spell names are free text from D&D Beyond, like action names. This change adds no new trust boundary, and the story-17 and story-18 guards still apply:
- The skill treats digest strings as data, and tells the Author about a name that reads like an instruction.
- The preview parses the draft and draws it for the Author.
- The write tool runs only after the Author approves. It runs every draft check again before it saves a file.
- The app renders section text as text nodes, so a name cannot inject markup.

The last three are mechanical. They hold even if an agent follows an injected name.

## Risks / Trade-offs

- [Known-caster flags are unconfirmed] → D4 keeps every spell in the digest, and D11 makes the skill fall back to the whole class list.
- [Spell attack and DC bonus sub-types are unconfirmed] → D8 fails safe to unknown. A later fixture can confirm them and turn the unknowns into values.
- [Rule 3 of D5 picks a subclass spell's ability by elimination] → It applies only with exactly one spellcasting class. Otherwise the ability is unknown.
- [A spell with two damage modifiers loses its damage pill] → The row still carries its DC or to-hit, and the skill tells the Author why the damage is missing.
- [Sunny's D&D Beyond sheet is loose with prepared spells] → Its flags are real D&D Beyond data, so they test the shape. Scenarios assert the fixture's flags, not the rules of play.
- [The history rewrite cannot reach pull request refs on GitHub] → The Author asks GitHub Support to purge them. The new test stops a raw fixture from landing again.

## Migration Plan

No migration. Existing character files and digest files keep working. A digest file written before this change has no `spells` or `spellcasting`. The skill then has nothing to recommend for Magic, and it tells the Author to run the digest again. The deploy is unchanged, because no route imports the ingest code.

## Open Questions

- Should the digest read D&D Beyond's known-caster flags? A Sorcerer, Bard, or Warlock fixture would answer this without changing this design's shape. It would only change which status some ways get.
