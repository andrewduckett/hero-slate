## 1. Shared rules

- [ ] 1.1 Move the proficiency-bonus helper out of `limitedUses.ts` into a shared module, such as `src/lib/ingest/ddb/rules.ts`, beside a shared ability-modifier helper (design D1). Verify that the existing `limitedUses.test.ts` and `digest.test.ts` still pass unchanged.

## 2. Skills (test first)

- [ ] 2.1 Write failing tests in `skills.test.ts` with hand-written inputs. Cover all 18 skills with their standard abilities; none, proficient, and expertise; half proficiency on all ability checks, rounding down at level 1; expertise beating proficiency; and a flat `bonus` on one skill and on `ability-checks`. Verify that the tests fail.
- [ ] 2.2 Add failing tests to `skills.test.ts` for manual values. A `characterValues` entry with `valueTypeId` 1958004211 and Stealth's id makes only Stealth `null`, with a reason. An entry with an unknown skill id makes every skill `null`. Entries of other types, such as Urven's `typeId` 8 notes, change nothing. Verify that the tests fail.
- [ ] 2.3 Implement `src/lib/ingest/ddb/skills.ts`, with the table of 18 skill slugs, abilities, and D&D Beyond ids (design D2 to D4). Verify that the tests from 2.1 and 2.2 pass.

## 3. Actions (test first)

- [ ] 3.1 Write failing tests in `actions.test.ts` for feature actions with hand-written records. Cover activation codes 1, 3, and 4, and another code giving `null`. Cover a to-hit from a named ability, a martial-arts to-hit using the better of Strength and Dexterity, and an attack with no ability giving unknown. Cover dice copied without spaces, and an attack with no dice giving unknown damage. Cover a save DC from a named ability, a fixed DC winning, and a save with neither giving unknown while `saveAbility` stays set. Cover an action with no numbers, where every number and reason is `null`. Verify that the tests fail.
- [ ] 3.2 Write failing weapon tests in `actions.test.ts`. Cover Finesse picking the better ability, a ranged weapon using Dexterity, and a melee weapon using Strength. Cover proficiency from `simple-weapons`, `martial-weapons`, and the weapon's own hyphenated name, and no proficiency. Cover a magic bonus from `grantedModifiers`, and a modifier of 0 giving the dice alone. Cover the unknown cases: any `monk-weapon` modifier, a `magic` weapon with a bonus of 0, and each of the six weapon bonus sub-types. Cover duplicate names listed once, and unequipped weapons left out. Verify that the tests fail.
- [ ] 3.3 Implement `src/lib/ingest/ddb/actions.ts` (design D5 to D9). Verify that the tests from 3.1 and 3.2 pass.

## 4. Digest wiring and acceptance

- [ ] 4.1 Write failing tests in `digest.test.ts`. A missing or `null` `characterValues` field means none, and `characterValues` as an object exits 5 with a message naming it. Verify that the tests fail.
- [ ] 4.2 Update `digest.ts` to read `characterValues` as optional, pass plain values to `skills.ts` and `actions.ts`, and add `skills` and `actions` to the `Digest` type. Verify that the tests from 4.1 pass.
- [ ] 4.3 Extend `digest.acceptance.test.ts` for Urven. Assert the five proficient skills and bonuses from the spec, including Insight +5. Assert Unarmed Strike with bonus action, to-hit 8, and unknown damage; Stunning Strike with DC 13 and a Constitution save; Shadow Step with no numbers; and Handaxe and Ice Pick listed once each with unknown numbers. Verify that the test passes.
- [ ] 4.4 Extend the Zip acceptance test. Assert Investigation as expertise with bonus 7, and Nature, Stealth, and Sleight of Hand at 5. Assert Dagger and Sling each with to-hit 5 and damage `1d4+3`. Verify that the test passes.

## 5. Draft validation (test first)

- [ ] 5.1 Write failing tests in `validate.test.ts`: a row with no body gives the "would drop a row" warning, a section with no rows gives the "would drop a `sections` entry" warning, and an unknown section or row color gives a palette warning. Verify that the tests fail and that the exit code stays 0.
- [ ] 5.2 Update `validate.ts` to count dropped sections and rows with `resolveSections`, and to check section and row colors against `PALETTE_NAMES` (design D14). Verify that the tests from 5.1 pass.

## 6. Preview (test first)

- [ ] 6.1 Write failing tests in `preview.test.ts`. A `Strengths` section with color `forest` draws its title, `forest`, and a row whose body keeps its `[[+8]]` pill. A row with no body is not drawn. A draft with `pools`, `sections`, and `notes` lists only `notes` under "Not previewed". Verify that the tests fail.
- [ ] 6.2 Update `preview.ts` to draw sections through `resolveSections`, and add `sections` to the drawn blocks (design D13). Verify that the tests from 6.1 pass.
- [ ] 6.3 Add a test in `crosscheck.test.ts`: a Strengths row with `[[+6]]` for Insight, against a digest with Insight +5, gives no cross-check warning (design D15). Verify that it passes, and that the existing Urven cross-check acceptance test still reports no warnings.

## 7. Skill

- [ ] 7.1 Update `.claude/skills/dndbeyond-to-slate/SKILL.md` to match the spec's guided skill flow. Remove the "no sections" limit. Add the Your Turn recommendation (3 to 5 rows, each with a reason), the Strengths recommendation with grouping by equal ability and bonus, and the section color step. Add the pill rules: copy or format digest values only, and write no pill for an unknown number. Tell the Author which number is missing and why. Verify by checking each of the twelve spec steps and the pill rules against the skill text.
- [ ] 7.2 Walk through the skill with Urven (`https://www.dndbeyond.com/characters/154922980`) under the test id `urven-test`. Confirm by observation that the skill recommends at most 5 Your Turn rows with reasons, and does not list every action. Confirm that Unarmed Strike gets `[[d20+8]]` and no damage pill, with a note on why. Confirm that Strengths groups Acrobatics and Stealth at `[[+8]]` and keeps Athletics apart from Insight and Survival. Confirm that the preview draws both sections with no errors. Stop before the write step, and delete the draft from `.workspace/`.

## 8. Documentation and full verification

- [ ] 8.1 Update `openspec/discovery.md` so the "Write YAML" journey note says story 18 has shipped the Your Turn and Strengths sections. Verify that the note names the stories that are still gaps.
- [ ] 8.2 Run `npm test` and confirm that the whole suite passes.
- [ ] 8.3 Run `npm run build`. Confirm that the build succeeds, and that `grep -r character-service build/` finds nothing.
