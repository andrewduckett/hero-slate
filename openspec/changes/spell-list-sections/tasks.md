## 1. Fixture privacy (test first)

- [ ] 1.1 Write failing tests in `src/lib/ingest/ddb/fixturePrivacy.test.ts` with a hand-written response. Blanking sets `username` to `""`, `userId` to 0, and `campaign` to `null`. It sets every `decorations` field to `null` except `themeColor`, including `defaultBackdrop`'s fields. It sets every `notes` and `traits` field and the eight description fields to `null`. It leaves a spell list and every other field unchanged. The finder names the field for a `username` of `someone` and for a set `notes.backstory`, and finds nothing in a blanked response. Verify that the tests fail.
- [ ] 1.2 Implement `src/lib/ingest/ddb/fixturePrivacy.ts` with the blanking function and the finder (design D12). Verify that the tests from 1.1 pass.
- [ ] 1.3 Add a test that runs the finder over every `.json` file in `src/lib/ingest/ddb/fixtures/` and fails, naming the fixture and field, on any finding. Verify that it passes for `urven.json` and `zip.json`.
- [ ] 1.4 Add `scripts/blank-ddb-fixture.ts`, which rewrites a recorded response in place with the blanking function. Verify by running it on a copy of `zip.json` in `.workspace/` and confirming that the digest output is unchanged.
- [ ] 1.5 Record Sunny's response (character 164521812) into `.workspace/`, blank it with the script, and save it as `src/lib/ingest/ddb/fixtures/sunny.json`. Verify that the test from 1.3 passes for all three fixtures, and that the file holds no D&D Beyond username or campaign name.

## 2. Shared limited-use rule

- [ ] 2.1 Export the single-rule maximum computation from `limitedUses.ts`, so `spells.ts` can reuse it (design D10). Verify that `limitedUses.test.ts` and `digest.test.ts` still pass unchanged.

## 3. Spells module (test first)

- [ ] 3.1 Write failing tests in `src/lib/ingest/ddb/spells.test.ts` for spell facts, with hand-written records. Cover:
  - grouping records by name into cast ways, and ordering by level, then name
  - each source mapping: `class`, `class feature`, `species`, `background`, and `feat`
  - status order, with `cantrip` beating `always`, `always` beating `granted`, and `prepared` versus `not-prepared` on a class list
  - `className` set from the class `id`, `null` for an unmatched `id`, and `null` for other sources
  - `usesSlot`, a limited use with its reset, and a limited use with a maximum of 0 becoming `null`
  - `concentration`, `ritual`, and `saveAbility`

  Verify that the tests fail.
- [ ] 3.2 Write failing tests in `spells.test.ts` for casting ability. Cover each of the three rules in design D5. Cover a `class feature` spell with two spellcasting classes, and one with none, each giving `null` with a reason. Cover a class that takes its ability from its subclass. Verify that the tests fail.
- [ ] 3.3 Write failing tests in `spells.test.ts` for spell numbers. Cover:
  - a to-hit, and a save DC with and without a fixed DC on the record
  - damage and healing with no modifier, one modifier, and two modifiers
  - a cantrip at levels 4, 5, and 17 picking its scaling step
  - a leveled spell ignoring its steps
  - `usePrimaryStat` appending the modifier, such as `2d8+4`
  - a modifier with no dice string giving unknown
  - an unknown casting ability giving unknown numbers
  - a `spell-attacks` bonus modifier making the to-hit unknown, and a `spell-save-dc` bonus modifier making the DC unknown, while a fixed DC stays

  Verify that the tests fail.
- [ ] 3.4 Write failing tests in `spells.test.ts` for the spellcasting summary. Cover one entry per spellcasting class in class order, a subclass ability, an empty list with no spellcasting class, and unknown values under each bonus modifier. Verify that the tests fail.
- [ ] 3.5 Implement `src/lib/ingest/ddb/spells.ts` (design D1 and D3 to D10). Verify that the tests from 3.1 to 3.4 pass.

## 4. Digest wiring and acceptance

- [ ] 4.1 Write failing tests in `digest.test.ts`. A missing or `null` `classSpells` means none, and `classSpells` as an object exits 5 with a message naming `classSpells`. A class with no `id` or no spellcasting ability still digests. Verify that the tests fail.
- [ ] 4.2 Update `digest.ts` to read `classSpells`, each class's `id`, and each class's and subclass's spellcasting ability as optional fields. Pass plain values to `spells.ts`, and add `spells` and `spellcasting` to the `Digest` type (design D2). Verify that the tests from 4.1 pass.
- [ ] 4.3 Add a Sunny acceptance test in `digest.acceptance.test.ts` that asserts every Sunny scenario in the delta spec, from Thorn Whip to the spellcasting summary. Verify that the test passes.
- [ ] 4.4 Extend the Zip acceptance test with every Zip scenario in the delta spec, including `className` Wizard, Find Familiar, Identify, Mind Sliver, and the item spells left out. Verify that the test passes.
- [ ] 4.5 Extend the Urven acceptance test. Assert Darkness with a `null` casting ability and a reason, and an empty `spellcasting` list. Verify that the test passes, and that Urven's existing assertions still pass.

## 5. Skill

- [ ] 5.1 Update `.claude/skills/dndbeyond-to-slate/SKILL.md` to match the spec's guided skill flow. Remove the "does not draft spells" limit. Add the "Cast a Spell" row, the Magic step with its mix and its known-caster fallback, the rule for a character with no spellcasting class, the choice of cast way, the healing pill, and the section order. Add spell names to the data-not-instructions rule. Verify by checking each of the thirteen spec steps and the pill rules against the skill text.
- [ ] 5.2 Walk through the skill with Sunny (`https://www.dndbeyond.com/characters/164521812`) under the test id `sunny-test`. Confirm by observation that:
  - Your Turn has a "Cast a Spell" row with `[[d20+7]]` and `[[DC 15]]`
  - Magic recommends one save spell, one attack spell, and 2 or 3 flavor spells, each with a reason
  - a kept Call Lightning row has no damage pill, with a note on why
  - a kept Cure Wounds row has `[[2d8+4]]`
  - the preview draws all three sections with no errors

  Stop before the write step, and delete the draft from `.workspace/`.
- [ ] 5.3 Walk through the skill with Urven as far as the section recommendations. Confirm by observation that it recommends no "Cast a Spell" row and no Magic section, and that it names Darkness to the Author. Stop before drafting.

## 6. Documentation and full verification

- [ ] 6.1 Update `openspec/discovery.md` so the "Write YAML" journey note says story 19 has shipped spells. Verify that the note names update-in-place (story 20) as the remaining gap.
- [ ] 6.2 Run `npm test` and confirm that the whole suite passes.
- [ ] 6.3 Run `npm run build`. Confirm that the build succeeds, and that `grep -r character-service build/` finds nothing.
