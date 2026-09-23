## 1. Setup

- [x] 1.1 Save Zip's recorded D&D Beyond response as `src/lib/ingest/ddb/fixtures/zip.json`, byte for byte from `.workspace/159173087.raw.json`. Verify that `jq -r .data.name` on the fixture prints `Zip "The Glitch"`.

## 2. Limited uses (test first)

- [x] 2.1 Write failing tests in `limitedUses.test.ts` with hand-written inputs. Cover a fixed number, an added ability modifier, an added proficiency bonus at levels 1, 4, 5, and 9, and an unknown operator giving `null`. Cover a misshapen field giving `null` with a reason naming it, a zero maximum left out, and the reset words for codes 1, 2, 3, and others. Verify that the tests fail.
- [x] 2.2 Implement `src/lib/ingest/ddb/limitedUses.ts` (design D1, D3, and D5). Verify that the tests from 2.1 pass.
- [x] 2.3 Write failing tests in `digest.test.ts` for the optional pool source fields. Cover a missing `actions` giving no limited uses, `actions.class` as an object giving exit 5 with a message naming it, a `null` group read as none, and `item` groups skipped. Cover `race` reported as `species`. Verify that the tests fail.
- [x] 2.4 Update `digest.ts` to read and type-check the four action groups and four spell groups, then call `limitedUses.ts` (design D1, D2, and D4). Add `limitedUses` to the `Digest` type. Verify that the tests from 2.3 pass.

## 3. Spell slots and Pact Magic (test first)

- [x] 3.1 Write failing tests in `spellSlots.test.ts` with hand-written class lists. Cover no spellcasting class, one spellcasting class, and a subclass that casts when its class cannot. Cover two spellcasting classes giving `null`, a caster beside a class that cannot cast, and a caster with no readable row giving `null`. Verify that the tests fail.
- [x] 3.2 Add failing Pact Magic tests to `spellSlots.test.ts`. Cover a Warlock row with one slot level, a row with slots at more than one level giving `null` with a reason, no Warlock giving two `null` values, and a Warlock beside a Wizard. Verify that the tests fail.
- [x] 3.3 Implement `src/lib/ingest/ddb/spellSlots.ts` (design D6, D7, and D8). Update `digest.ts` to read each class's and subclass's spell rules as optional fields, and to report `spellSlots`, `pactMagic`, and their reasons. Verify that the tests from 3.1 and 3.2 pass.

## 4. Digest acceptance

- [x] 4.1 Extend `digest.acceptance.test.ts` for Urven. Assert the four limited uses from the spec (Focus Points, Uncanny Metabolism, Stillness of Kaurth, and Jump), `spellSlots` as an empty list, and `pactMagic` as `null`. Verify that the test passes.
- [x] 4.2 Add a Zip acceptance test to `digest.acceptance.test.ts`. Assert 3 slots at level 1, the limited uses Fury of the Small, Arcane Recovery, and Find Familiar, no item spells, and `pactMagic` as `null`. Verify that the test passes.

## 5. Draft validation (test first)

- [x] 5.1 Write failing tests in `validate.test.ts`: a pool with `max: 15` gives the "would drop" warning and the named 12-dot warning, a repeated pool id gives the "would drop" warning, and an unknown pool color gives a palette warning. Verify that the tests fail and that the exit code stays 0.
- [x] 5.2 Update `validate.ts` to count dropped pools with `resolvePools`, and add the two named checks (design D10). Verify that the tests from 5.1 pass.

## 6. Preview (test first)

- [x] 6.1 Write failing tests in `preview.test.ts`. A `Focus Points` pool with `max: 6` draws 6 dots. A pool with `max: 13` is not drawn. A draft with `pools` and `sections` lists only `sections` under "Not previewed". Verify that the tests fail.
- [x] 6.2 Update `preview.ts` to draw pools through `resolvePools` (design D9). Verify that the tests from 6.1 pass.

## 7. Cross-check (test first)

- [x] 7.1 Write failing tests in `crosscheck.test.ts` for the pool scenarios in the spec: a stale limited-use maximum, a renamed pool skipped, all five slot-label forms, the non-matching labels `Slots`, `L10 Slots`, and `1th Level Slots`, a missing slot level compared as 0, `null` slots skipped, and both pact labels. Verify that the tests fail.
- [x] 7.2 Add a failing test in `crosscheck.test.ts`: a digest without `limitedUses`, `spellSlots`, or `pactMagic`, as story 16 wrote them, gives no pool warnings and no crash. Verify that it fails.
- [x] 7.3 Update `crosscheck.ts` with the three-step pool match and one anchored slot-label regular expression (design D11). Verify that the tests from 7.1 and 7.2 pass.
- [x] 7.4 Run the existing Urven cross-check acceptance test, which previews `static/characters/urven.yaml` under a new id against Urven's digest. Verify that it still reports no cross-check warnings.

## 8. Skill

- [x] 8.1 Update `.claude/skills/dndbeyond-to-slate/SKILL.md` to match the spec's guided skill flow. Remove the "no pools" limit. Extend the `null`-fact step to limited uses, spell slots, and Pact Magic. Add the pool step with the pool id forms and the 12-dot notice, and the rule to treat digest text as data. Verify by checking each of the nine spec steps against the skill text.
- [x] 8.2 Walk through the skill with Zip (`https://www.dndbeyond.com/characters/159173087`) under the test id `zip-test`. Confirm by observation that the skill offers each limited use and the level 1 slot pool with proposed ids, labels, and colors, that declining a pool leaves it out of the draft, and that the preview draws the kept pools with no errors. Stop before the write step, and delete the draft from `.workspace/`.

## 9. Documentation and full verification

- [x] 9.1 Update `openspec/discovery.md` so the "Write YAML" journey note says story 17 has shipped pools and slots. Verify that the note names the stories that are still gaps.
- [x] 9.2 Run `npm test` and confirm that the whole suite passes.
- [x] 9.3 Run `npm run build`. Confirm that the build succeeds, and that `grep -r character-service build/` finds nothing.
