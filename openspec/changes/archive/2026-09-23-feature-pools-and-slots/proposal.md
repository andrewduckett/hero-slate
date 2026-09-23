## Why

A player taps pools in almost every fight: Focus Points, a once-a-day feat, spell slots. Today the Author types each pool's maximum by hand, and those numbers go stale. Urven's hand-written sheet shows Ki 5, but D&D Beyond says 6. This change extends the D&D Beyond ingest (discovery story 17) so the digest tool reports each pool's maximum. The Author then picks which pools the sheet tracks.

## What Changes

- The digest tool reports three new kinds of fact:
  - **Limited uses**: each class, species, background, or feat feature that D&D Beyond marks as limited use. Examples are Focus Points, Arcane Recovery, and a feat's once-per-long-rest spell.
  - **Spell slots**: the number of slots at each spell level for a character with one spellcasting class.
  - **Pact Magic**: a Warlock's pact slot count and slot level.
- The digest tool computes each limited use's maximum. It starts from D&D Beyond's fixed number, then adds an ability modifier or the proficiency bonus when D&D Beyond asks for one.
- The digest tool looks up spell slots in the class's own slot table, by class level. D&D Beyond does not report the slot count directly.
- The digest tool gives no slots to a class that cannot cast spells, even when its class data carries a slot table. Urven's Monk data carries one.
- The digest tool reports spell slots as unknown, with a reason, for a character with more than one spellcasting class, not counting Warlock. The skill then asks the Author for the numbers. This matches how story 16 handles an unknown Armor Class.
- The digest tool leaves out spells that an item grants, because they use the item's charges.
- The digest tool reports each limited use's reset (short rest, long rest, or dawn) as context for the agent. The sheet does not show it, because rest mechanics are out of scope.
- The skill offers each digest pool to the Author as an opt-in `pools` entry. It suggests a label and a palette color for each pool, and the Author confirms or changes them. It offers one pool per spell-slot level, such as "L1 Slots".
- The preview tool draws pools as rows of dots, using the app's own pool rules, and stops listing `pools` under "Not previewed".
- The preview tool warns when the app would drop a pool entry. It names the cause when a maximum is above the app's limit of 12 dots.
- The cross-check compares each drafted pool's maximum with the digest. It matches by label, ignoring case, and matches slot pools by spell level. It skips a renamed pool. Urven's `Ki` pool does not match `Focus Points`, so story 20 will handle that mismatch.
- A second fixture records Zip, a public level 2 Wizard, so the tests cover a spellcaster.
- Out of scope: slot counts for multiclass spellcasters, rest and reset controls, non-pool resources, and the Your Turn, skills, and spells sections (stories 18 and 19).

## Capabilities

### New Capabilities

<!-- None. Pools extend the existing ingest capability. -->

### Modified Capabilities

- `dndbeyond-ingest`: the digest adds limited uses, spell slots, and Pact Magic. The draft validation, preview, and cross-check cover `pools`. The guided skill flow adds a step that offers pools.

## Impact

- **Changed code** in `src/lib/ingest/ddb/`:
  - the digest, for limited uses, spell slots, and Pact Magic
  - the draft validation, preview, and cross-check, for pools
- **Changed skill:** `.claude/skills/dndbeyond-to-slate/SKILL.md` adds the pool step and drops the "no pools" limit.
- **Unchanged app:** the app's pool rules and the dot limit stay as they are. The preview reuses the app's pool resolver and copies none of its rules.
- **Tests:** a new fixture, `src/lib/ingest/ddb/fixtures/zip.json`, records Zip's full D&D Beyond response. Zip is a public character. Acceptance tests check the pool facts for both Urven and Zip.
- **Known gap:** no fixture covers a Warlock. The Pact Magic lookup follows the best-known data shape. When the data does not match that shape, the digest reports Pact Magic as unknown and does not guess.
- **Build:** no route imports `src/lib/ingest/`, so the deployed app is unchanged.
- **Docs:** the story-17 entry in `discovery.md` gets its change link.
