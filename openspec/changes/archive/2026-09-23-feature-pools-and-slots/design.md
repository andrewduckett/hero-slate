## Context

Story 16 built the ingest as pure modules under `src/lib/ingest/ddb/`, plus one command-line entry, `cli.ts`. The digest (`digest.ts`) reads and type-checks the raw D&D Beyond response. It hands typed values to a focused module for one hard sum; `armorClass.ts` is the example. The preview (`preview.ts`), validation (`validate.ts`), and cross-check (`crosscheck.ts`) reuse the app's own resolvers.

The app already reads pools through `resolvePools` in `src/lib/character/pools.ts`. That resolver drops any pool whose `max` is not an integer from 1 through 12, and any pool that repeats an earlier id.

Two recorded responses shape the design:
- **Urven**, a level 6 Monk, in `fixtures/urven.json`. The Monk cannot cast spells, but its class data still carries a one-third-caster slot table.
- **Zip**, a level 2 Wizard, in the new `fixtures/zip.json`. Zip has 3 first-level slots, but D&D Beyond's `spellSlots[].available` field is 0 at every level. That field does not hold the slot count.

See `proposal.md` for the motivation, and `specs/dndbeyond-ingest/spec.md` for the required behavior.

## Goals / Non-Goals

**Goals:**
- Keep the story-16 split. The digest tool computes every pool maximum, and the agent only chooses, names, and colors pools.
- Keep each new rule in a small pure module that tests can drive with hand-written inputs.
- Report "unknown, with a reason" wherever the digest cannot be sure, and never guess.

**Non-Goals:**
- No change to the app: its pool resolver, the 12-dot limit, and the pool renderer stay as they are.
- No slot tables inside Hero Slate. The digest reads D&D Beyond's own per-class tables.
- No pool ids or labels from the digest. Naming stays editorial.

## Decisions

### D1. Two new pure modules, fed by the digest

The digest adds two modules beside `armorClass.ts`:
- `limitedUses.ts` computes the `limitedUses` list.
- `spellSlots.ts` computes `spellSlots` and `pactMagic`.

`digest.ts` keeps the job of reading and type-checking the optional source fields. It passes each module plain arrays and the final ability scores. The modules never see the raw response.

- *Alternative: grow `digest.ts`.* Rejected. It is already 265 lines. The slot and use rules each need their own focused tests.

### D2. A misshapen limited-use rule gives an unknown maximum, not a failed digest

A wrong type on an action *group*, such as `actions.class` being an object, still fails the digest (exit 5), as story 16 does for any optional field. A wrong type *inside* one rule, such as a string `maxUses`, gives that one entry a `null` maximum with a reason.

- *Why:* one odd feature should not block the whole sheet. The Author can still type that one number.
- *Alternative: fail the digest.* Rejected. The Author would lose every other fact over one unimportant field.

### D3. The maximum is a fixed number plus two optional parts

`limitedUses.ts` computes a maximum from D&D Beyond's `limitedUse` fields:
- `maxUses`: the fixed number of uses.
- `statModifierUsesId`: when set, the digest adds that ability's modifier. The id uses the same 1-to-6 order as `stats`, where 5 is Wisdom.
- `useProficiencyBonus` with `proficiencyBonusOperator` 1: the digest adds the proficiency bonus. Any other operator gives an unknown maximum.

Both fixtures show each rule. Urven's Focus Points has a fixed 6, because D&D Beyond has already applied the level scaling. Urven's Stillness of Kaurth has 0 fixed uses plus Wisdom. Zip's Fury of the Small has 0 fixed uses plus the proficiency bonus.

The proficiency bonus uses the total character level, not a class level. That matches the D&D rule for multiclass characters.

The module ignores D&D Beyond's `numberUsed` field. It describes one table session, and the app keeps pool counts as per-device state.

### D4. Only class, species, background, and feat sources

The digest reads the `class`, `race`, `background`, and `feat` groups of both `actions` and `spells`. It skips the `item` groups. Zip's item spells show the reason: they have `maxUses` 0 and no reset, because they draw on the item's charges.

- *Alternative: read item groups and drop zero maximums.* Rejected. An item could still carry a real-looking limited use that actually spends shared charges. Charges are a separate resource, and they are out of scope.

### D5. Reset codes map to three words

`resetType` 1 means short rest and 2 means long rest. Urven's Focus Points and Uncanny Metabolism confirm both. `resetType` 3 means dawn, following D&D Beyond's usual codes; no fixture confirms it yet. Any other code, or none, gives `null`. The reset is context for the agent only.

### D6. A spellcasting class is one that D&D Beyond says can cast

`spellSlots.ts` counts a class as a spellcaster when D&D Beyond sets `canCastSpells` on its class definition or its subclass definition. It reads the slot table from whichever definition can cast.

Urven shows why the check matters. The Monk definition has `canCastSpells: false`, but its `levelSpellSlots` table shows 3 first-level slots at level 6. A lookup without the check would give a Monk slots it does not have.

The module reads the slot row at index *class level*. Both fixtures confirm this index. Zip's Wizard row at index 2 is `[3, 0, …]`. The Monk's third-caster rows at indexes 3, 4, and 7 match the one-third-caster table.

- *Alternative: read D&D Beyond's `spellSlots` field.* Rejected. Zip proves that field does not hold the count.
- *Alternative: ship our own slot tables.* Rejected. It copies rules that D&D Beyond already publishes per class, and adds a second place for them to drift.

### D7. More than one spellcasting class gives unknown slots

With two or more spellcasting classes, not counting Warlock, the digest reports `spellSlots` as `null` with a reason. The skill asks the Author for the counts. This repeats story 16's unknown Armor Class pattern.

Multiclass slots need each class's caster level, rounding that differs between the 2014 and 2024 rules, and a shared table. We have no fixture for any of it.

A spellcaster beside a class that cannot cast is still a single-class lookup. D&D uses the one spellcasting class's own table in that case.

### D8. Pact Magic reads the Warlock's own row and fails safe

The module finds a Warlock by its class definition name, `Warlock`, together with `canCastSpells`. D&D Beyond has no separate Pact Magic flag that we know of.

The module assumes that a Warlock's `levelSpellSlots` row holds its pact slots at a single spell level, such as `[0, 0, 2, 0, 0, …]` for a level 5 Warlock. When exactly one level in the row has slots, the module reports that level and count. Any other shape gives `null` with a reason.

No fixture confirms this shape. The fail-safe means a wrong guess shows up as "unknown" and the Author types the number. It never becomes a wrong number on the sheet.

### D9. The preview draws pools through `resolvePools`

`preview.ts` calls `resolvePools(draft.pools, null)` and draws each resolved pool as its label and one `o` per use. With no stored state, every pool is full, so the dot count equals the maximum. `pools` moves into the set of drawn blocks, so "Not previewed" stops listing it.

### D10. Validation counts dropped pools with the app's resolver

`validate.ts` compares `resolvePools(pools, null).length` with the length of the `pools` list. A shorter result gives the "would drop an entry" warning. Two extra checks give the Author a specific cause:
- an integer `max` above 12, naming the pool's label
- a pool `color` that is not in `PALETTE_NAMES`

Neither check copies the resolver's rules. The first only explains one of its drops.

### D11. The cross-check matches pools in three steps

`crosscheck.ts` compares only pools that `resolvePools` keeps. For each one, it tries three matches in order and uses the first that fits:
1. The label, trimmed and lowercased, equals a limited use's name, also trimmed and lowercased.
2. The label is a slot label, as the spec defines its five forms. A known `spellSlots` list gives that level's count, or 0 when the level is absent.
3. The label is a pact label, `Pact Slots` or `Pact Magic`. A known `pactMagic` gives its slot count.

`crosscheck.ts` tests the slot forms with one anchored regular expression. It checks each ordinal suffix against its digit, so `1th` does not match.

A `null` digest fact skips the comparison. A digest file written before this change has no pool facts, so the cross-check treats missing fields as `null`. Old digest files keep working.

- *Alternative: match by pool id.* Rejected. Ids are the Author's choice and carry no fixed meaning.
- *Alternative: an alias table, such as Ki for Focus Points.* The Author deferred this to story 20.

### D12. The skill proposes pool ids from labels

The skill follows the id forms in the spec's guided flow, for example `focus-points`, `slots-1`, and `pact-slots`. Fixed forms for slots keep ids stable when the Author relabels a slot pool. Ids must be unique, because the app keys each pool's per-device count by id. The validation warning (D10) catches a repeated id.

### D13. Digest text is data at every step

D&D Beyond names are free text that any user can type. They reach the agent through the digest file, and they reach the sheet through the agent's draft. Three guards cover this path:
- The skill tells the agent to treat digest strings as data, and to tell the Author about a name that reads like an instruction.
- The preview tool parses the draft before it draws anything. A name that breaks the YAML is an error, and the write tool refuses the draft.
- The Author approves the preview before the write tool saves anything.

The app renders pool labels as text, not HTML, so a label cannot inject markup into the sheet.

- *Alternative: strip or escape names in the digest.* Rejected. The spec keeps names exactly as D&D Beyond stores them, and the Author chooses the final label anyway. Escaping would hide what D&D Beyond actually says.

## Risks / Trade-offs

- [The Warlock data shape is unconfirmed] → D8 fails safe to "unknown, with a reason". A later Warlock fixture can confirm or fix the lookup without a spec change.
- [`resetType` 3 as dawn is unconfirmed] → The reset is only context for the agent. A wrong word never reaches the sheet.
- [High-level pools exceed 12 dots, such as Sorcery Points up to 20] → The skill and the validation both tell the Author. Raising the app's limit is a separate app change.
- [D&D Beyond marks some minor features as limited use] → The skill offers each pool as opt-in, so the Author declines the noise.
- [A renamed pool escapes the cross-check] → The Author accepted this gap. Story 20 adds real diffing.
- [The Zip fixture is a real character's data] → The character is public on D&D Beyond, and the Author approved committing it.

## Migration Plan

No migration. Existing character files and digest files keep working. The deploy is unchanged, because no route imports the ingest code.

## Open Questions

- Does a real Warlock response match the D8 row shape? A recorded Warlock fixture would answer this. The fail-safe makes it safe to defer.
