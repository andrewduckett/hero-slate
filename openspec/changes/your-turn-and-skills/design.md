## Context

Stories 16 and 17 built the ingest as pure modules under `src/lib/ingest/ddb/`, with one command-line entry, `cli.ts`. The digest (`digest.ts`) reads and type-checks the raw D&D Beyond response. It passes typed values to a focused module for each hard rule, such as `armorClass.ts`, `limitedUses.ts`, and `spellSlots.ts`. The preview, validation, and cross-check reuse the app's own resolvers.

The app already reads sections through `resolveSections` in `src/lib/character/sections.ts`. That resolver drops a section with no title or no rows, and a row with no body. The rich-text parser shows `[[...]]` as a pill. It styles `+N` as a bonus pill and any other text as a dice pill.

The two recorded responses already hold the data this change needs:
- **Urven**, a level 6 Monk: 5 proficient skills, Unarmed Strike (a martial-arts attack), Stunning Strike (a save with a named ability), and two equipped weapons under Monk weapon rules.
- **Zip**, a level 2 Wizard: expertise in Investigation, and a Dagger and a Sling.

See `proposal.md` for the motivation, and `specs/dndbeyond-ingest/spec.md` for the required behavior.

## Goals / Non-Goals

**Goals:**
- Keep the split from ADR 0009. The digest computes every pill number, and the agent chooses, groups, and words the rows.
- Put each new rule in a small pure module that tests can drive with hand-written inputs.
- Report "unknown, with a reason" wherever the digest cannot prove a number. Never guess.

**Non-Goals:**
- No change to the app. The section renderer, the pill parser, and the palette stay as they are.
- No full attack engine. Fighting styles, Monk weapon rules, magic weapon bonuses the digest cannot read, and class-feature damage dice all stay unknown.
- No suggested rows, groups, or wording from the digest. Selection and phrasing are editorial.

## Decisions

### D1. Two new pure modules, fed by the digest

The digest adds two modules beside `limitedUses.ts`:
- `skills.ts` computes the `skills` list.
- `actions.ts` computes the `actions` list.

`digest.ts` keeps the job of reading and type-checking the source fields. It passes each module plain values: final ability scores, the total level, the modifier list, the action records, and the equipped weapons. The modules never see the raw response.

The proficiency bonus comes from the total level, as in story 17. The helper that computes it moves out of `limitedUses.ts` into a shared module, so all three modules use one rule.

- *Alternative: grow `digest.ts`.* Rejected. Each rule needs its own focused tests, as in story 17.

### D2. The digest emits all 18 skills, not only the proficient ones

The digest is the supply, not the sheet. It reports every skill with its ability, proficiency level, and final bonus. The skill recommends proficient ones. The full list lets the Author ask for any skill by name and still get a proven number.

The ability for each skill comes from a fixed table of the 18 standard skills. D&D Beyond's character response does not name each skill's ability.

- *Alternative: emit only proficient skills.* Rejected. The Author could not add a non-proficient skill without the agent computing it.

### D3. A skill bonus is the modifier, a proficiency share, and flat bonuses

`skills.ts` computes each skill's final bonus as the sum of three parts:
1. the ability modifier
2. the proficiency bonus times the proficiency level: 0 for none, half (rounded down) for half proficiency, 1 for proficient, 2 for expertise
3. every `bonus` modifier whose sub-type is the skill's slug or `ability-checks`

The proficiency level is the highest that applies. A skill-slug `expertise` modifier beats `proficiency`, which beats `half-proficiency`. A `half-proficiency` modifier on `ability-checks` (Jack of All Trades) applies half proficiency to every skill that has none.

The digest reads proficiency and expertise from the `modifiers` list, by skill slug, such as `stealth` or `sleight-of-hand`. Both fixtures show the pattern. Zip carries both `proficiency:investigation` and `expertise:investigation`.

### D4. A manual skill override gives an unknown bonus

D&D Beyond lets a player override a skill on the website. The override lands in `characterValues`. We have no fixture that shows its type codes.

The digest treats any `characterValues` entry that points at a skill as a sign of an override. Such an entry has the skill entity type as its `valueTypeId`. That skill's bonus becomes `null`, with a reason. Other skills keep their bonuses.

- *Why:* a wrong skill bonus looks exactly like a right one on the sheet. "Unknown" asks the Author to type it.
- *Alternative: apply known override codes.* Rejected until a fixture confirms the codes.

### D5. Actions come from four action groups and equipped weapons

`actions.ts` reads the `class`, `race`, `background`, and `feat` groups of `actions`, the same groups story 17 reads. It skips the `item` group. It also reads each equipped inventory item whose definition is a weapon. It lists each weapon name once, so Urven's two Handaxes give one entry.

Every action carries the same fields: `name`, `source`, `activation`, `toHit`, `damage`, `saveDc`, and `saveAbility`. Each number has its own reason field.

A number field has three states:

| State | Value | Reason | Meaning |
|---|---|---|---|
| Known | a number or dice string | `null` | The digest proved it. |
| Unknown | `null` | text | The action has this number, but the digest cannot prove it. |
| Not applicable | `null` | `null` | The action has no such number, such as Shadow Step's to-hit. |

`activation` maps D&D Beyond's activation codes: 1 is an action, 3 a bonus action, and 4 a reaction. Urven's fixture shows all three: Stunning Strike, Flurry of Blows, and Deflect Attack. Any other code gives `null`, because the digest does not know its meaning. A weapon's activation is `action`.

An action with no numbers at all still appears. The agent can offer it as a prose row, as Urven's Shadow Step row shows.

### D6. Feature to-hit uses the named ability, or martial arts

For a class, species, background, or feat action that D&D Beyond marks as an attack (`attackTypeRange` set), `actions.ts` computes the to-hit as:
- the modifier of the ability in `abilityModifierStatId`, when D&D Beyond names one
- otherwise, when `isMartialArts` is true, the higher of the Strength and Dexterity modifiers
- plus the proficiency bonus, when `isProficient` is true

When D&D Beyond names no ability and the attack is not martial arts, the to-hit is unknown.

Urven's Unarmed Strike checks out: the Dexterity modifier 5 plus the proficiency bonus 3 gives +8.

### D7. Feature damage copies D&D Beyond's dice, or is unknown

When an action carries a `dice` value, the digest copies its dice string with the spaces removed. For example, `1d8 + 6` becomes `1d8+6`. D&D Beyond has already added the fixed part, so the digest adds nothing.

When an attack action has no `dice`, its damage is unknown with a reason. Urven's Unarmed Strike is this case. Its martial-arts die lives in the Monk's class-feature level scale. Reading that scale is deferred (see Open Questions).

### D8. A save DC needs a named ability

When an action has a `saveStatId`, the digest computes its DC:
- `fixedSaveDc`, when D&D Beyond sets one
- otherwise 8, plus the proficiency bonus, plus the modifier of the ability in `abilityModifierStatId`

When neither is present, the DC is unknown. `saveAbility` names the target's saving throw, from `saveStatId`, whether or not the DC is known.

Urven's Stunning Strike checks out: 8, plus 3, plus the Wisdom modifier 2, gives DC 13, with a Constitution save.

### D9. Weapon math covers the simple cases and fails safe

For an equipped weapon, `actions.ts` computes:
- **ability**: the higher of Strength and Dexterity for a Finesse weapon, Dexterity for a ranged weapon, and Strength otherwise
- **to-hit**: that ability's modifier, plus the proficiency bonus when the character is proficient, plus a readable magic bonus
- **damage**: the weapon's damage dice, plus the same modifier, such as `1d4+3`

The character is proficient when its modifiers grant the weapon's category (`simple-weapons` or `martial-weapons`) or the weapon's own slug.

The digest reports the to-hit and damage as unknown, with a reason, in these cases:
- The character has any `monk-weapon` modifier. Monk weapon rules let Dexterity replace Strength for weapons the digest cannot list reliably. Urven's modifiers name only a Scimitar and a Greatclub, yet his Handaxe also counts.
- The weapon is magic, but the digest finds no `bonus` modifier of sub-type `magic` on it.
- The character has a `bonus` modifier on weapon attack or damage rolls, such as a fighting style.

Zip's Dagger checks out: Finesse picks Dexterity 3, plus proficiency 2, gives +5 and `1d4+3`. Urven's Handaxe and Ice Pick both become unknown under the Monk weapon rule.

- *Alternative: model Monk weapons and fighting styles.* Rejected for this story. Each needs its own rules and fixtures, and the skill's recommendations favor feature attacks anyway.

### D10. The skill groups skills by equal ability and equal bonus

The agent groups Strengths rows. Two skills share a row only when their ability and their final bonus are both equal. This is comparison, not arithmetic, so it does not break the rule against the agent computing numbers.

Equal numbers from different abilities never merge. Zip's Nature (Intelligence, +5) and Stealth (Dexterity, +5) stay apart. A merged row would teach a false pattern.

The Author may split a group back into single rows.

### D11. The skill recommends; the Author decides

The skill does not offer every action and skill as a checklist, unlike story 17's pool offer. Pools are few, and actions are many. The skill recommends a short list with a reason for each row. The spec's guided flow gives the limits: 3 to 5 Your Turn rows, proficient skills for Strengths, and one color per section.

### D12. Pills are copied, formatted, or left out

The agent writes each pill from a digest value:
- a skill bonus or to-hit as `[[+N]]`, or a to-hit as `[[d20+N]]`, following Urven's sheet
- damage as the digest's dice string, such as `[[1d4+3]]`
- a DC as `[[DC N]]`

Formatting a number into a pill is not arithmetic. The agent never adds, merges, or estimates a number. An unknown number gives no pill.

### D13. The preview draws sections through `resolveSections`

`preview.ts` calls `resolveSections(draft.sections)`. It draws each section's title and palette name, then each row's title and body. It shows the body text as written, with its `[[...]]` pills. The Author reads the pills in context before approving. `sections` moves into the set of drawn blocks.

### D14. Validation counts dropped sections and rows with the app's resolver

`validate.ts` compares the resolved sections and rows with the draft's lists. It warns when the app would drop a section or a row. It also warns when a section or row `color` is not in `PALETTE_NAMES`. These checks reuse the resolver and copy none of its rules.

### D15. No cross-check for pills

The cross-check stays as it is. Pills sit inside free prose under renamed titles, such as "Sneaking" for Stealth. A title match would miss most rows. An agent-written mapping would let the agent check its own work. The preview shows every pill instead, and story 20 owns real drift detection.

### D16. Digest text is data at every step

Action and weapon names are free text from D&D Beyond, like limited-use names. The story-17 guards still apply. The skill treats digest strings as data. The preview parses the draft before drawing it. The Author approves before any write. The app's rich-text parser renders section text as text nodes, not HTML, so a name cannot inject markup.

## Risks / Trade-offs

- [The skill-override shape in `characterValues` is unconfirmed] → D4 fails safe to unknown for that skill.
- [Bonus sub-types beyond `ability-checks` and skill slugs may exist, such as a bonus to all Dexterity checks] → The digest ignores unrecognized sub-types. A later fixture can add them. The Author sees every pill in the preview.
- [Weapon math misses common builds, such as a Fighter with a fighting style] → D9 reports these as unknown. The row still appears as prose, and the Author may type the numbers.
- [Many D&D Beyond actions are noise, such as the Circle Spell variants] → The skill recommends a few rows and never lists everything.
- [Urven's hand-written sheet disagrees with the digest] → Intended. The digest's Insight +5 corrects a human error.

## Migration Plan

No migration. Existing character files and digest files keep working. A digest file written before this change has no `skills` or `actions`. The skill then has nothing to recommend for these sections, and it tells the Author to run the digest again. The deploy is unchanged, because no route imports the ingest code.

## Open Questions

- Should the digest read the Monk's martial-arts die from its class-feature level scale? The data is present in Urven's fixture. A later change can add it without changing this design's shape, because it only turns one unknown damage into a known one.
