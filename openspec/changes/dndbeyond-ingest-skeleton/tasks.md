## 1. Setup

- [x] 1.1 Add `vite-node` to `devDependencies` at the version in `package-lock.json` (3.2.4). Verify that `npm ci` succeeds and `npx --silent vite-node --version` prints that version.
- [x] 1.2 Copy Urven's recorded D&D Beyond response to `src/lib/ingest/ddb/fixtures/urven.json`. Verify the file parses as JSON and `data.name` is `🐻‍❄️ Urven, the Silent Maw`.
- [x] 1.3 Export `ID_GRAMMAR` from `src/lib/data/yaml.ts`, and extract its identity checks into an exported named function that `toFoundOrInvalid` calls. Verify that the existing `yaml` provider tests pass unchanged.

## 2. Character reference (test first)

- [x] 2.1 Write failing tests for `src/lib/ingest/ddb/reference.ts`. Cover: a character URL, the URL with a trailing slash, the URL with a trailing path segment, the URL with a query string, a bare id, an unrelated host, a non-numeric id, and empty input. The result is the digits-only id or "unreadable". Verify that the tests fail.
- [x] 2.2 Implement `reference.ts` to pass 2.1. Verify that `npm test` passes for this file.

## 3. Fetch and exit codes (test first)

- [x] 3.1 Add `src/lib/ingest/ddb/exitCodes.ts` with the spec's exit-code table: 0, 1, 2, 3, 4, and 5. Verify that the module type-checks.
- [x] 3.2 Write failing tests for `src/lib/ingest/ddb/fetch.ts`, using an injectable fetch. Cover: 200 with JSON returns the body; 403 maps to exit 2 with a "set it to Public and retry" message; 404 maps to exit 4; a rejected fetch maps to exit 5; 200 with a non-JSON body maps to exit 5. Verify that the tests fail.
- [x] 3.3 Implement `fetch.ts` to pass 3.2. It requests `https://character-service.dndbeyond.com/character/v5/character/<id>`. Verify that the tests pass.

## 4. Digest (test first)

- [x] 4.1 Write failing tests for required and optional fields in `src/lib/ingest/ddb/digest.ts`. A missing or wrong-typed required field is unreadable, and the message names it (for example, `inventory` as an object). A missing or `null` optional field means none (for example, `bonusHitPoints: null`). A wrong-typed optional field that is not `null` is unreadable. Verify that the tests fail.
- [x] 4.2 Write failing tests for identity facts. `name` is returned verbatim, emoji included. `classes` lists each class with its subclass and level. `level` is the sum of class levels, including a Monk 3 / Rogue 2 multiclass. Verify that the tests fail.
- [x] 4.3 Write failing tests for final ability scores with handmade fragments. Cover: base plus bonus score; `<ability>-score` `bonus` modifiers matched by `subType` while `statId` is `null`; an override replacing the result; and a `set` modifier applying only when higher. Verify that the tests fail.
- [x] 4.4 Write failing tests for derived facts. Cover: hit points from base, bonus, Constitution modifier times level, and `hit-points-per-level`, and the override; speed from walking speed, flat bonuses, and Unarmored Movement with and without armor or shield; initiative from the Dexterity modifier plus flat bonuses. Verify that the tests fail.
- [x] 4.5 Implement `digest.ts` to pass 4.1–4.4, with the modifier rule `floor((score - 10) / 2)` and the `subType` mapping from design D8. Verify that the tests pass.

## 5. Armor Class (test first)

- [x] 5.1 Write failing tests for `src/lib/ingest/ddb/armorClass.ts` with handmade fragments. Cover each allowlisted source: no armor; armor with a Dexterity cap; a shield; monk Unarmored Defense; barbarian Unarmored Defense; both Unarmored Defense rules, where the higher wins; a flat item bonus; and the override. Also cover an unrecognized source, which returns `null` with a reason that names it. Verify that the tests fail.
- [x] 5.2 Implement `armorClass.ts` to pass 5.1, as the allowlist from design D7, and use it from `digest.ts`. Verify that the tests pass.
- [x] 5.3 Add an acceptance test that digests `fixtures/urven.json`. Verify: level 6; Strength 14, Dexterity 20, Constitution 16, Intelligence 10, Wisdom 14, Charisma 11; Armor Class 17; speed 45; initiative 5; maximum hit points 54.

## 6. Draft validation (test first)

- [x] 6.1 Write failing tests for `src/lib/ingest/ddb/validate.ts`. Errors: unparseable YAML; a non-mapping top level; a missing or empty `name`; a non-numeric `level`; a non-string `class` or `color`; an id outside `ID_GRAMMAR`; and a file `id` that differs from the target id. Warnings: a character `color` outside `PALETTE_NAMES`; `abilities` or `combat` entries that `validEntries` would drop; and a `hitPoints.max` that is present but not a positive integer. Verify that the tests fail.
- [x] 6.2 Implement `validate.ts` to pass 6.1, reusing the exported identity check, `ID_GRAMMAR`, `PALETTE_NAMES`, and `validEntries`. Verify that the tests pass.

## 7. Cross-check (test first)

- [x] 7.1 Write failing tests for `src/lib/ingest/ddb/crosscheck.ts`. Cover: a level mismatch; an ability mismatch matched by full name and by abbreviation (`Str`, `STR`); Armor Class matched as `AC`; initiative written as `"+5"`, which equals 5; a mismatch in maximum hit points; a renamed label that is skipped; a `null` digest fact that is skipped; and a name difference that is never compared. Verify that the tests fail.
- [x] 7.2 Implement `crosscheck.ts` to pass 7.1, with the alias table from design D6. Verify that the tests pass.

## 8. Preview (test first)

- [x] 8.1 Write failing tests for `src/lib/ingest/ddb/preview.ts`. The preview draws identity, abilities with computed modifiers (Dexterity 20 shows +5), combat, and hit points. It leaves out entries the app would drop. It lists `pools` and `sections` under "Not previewed" without drawing their contents. It uses ASCII borders with no right-hand border. Verify that the tests fail.
- [x] 8.2 Implement `preview.ts` to pass 8.1, using `resolveAbilities`, `resolveCombat`, and the `resolveHitPoints` rule. Verify that the tests pass.

## 9. Command-line entry

- [x] 9.1 Write failing tests for the pure part of `src/lib/ingest/ddb/cli.ts`, with injected file-system and fetch dependencies. Cover these cases:
  - `digest` prints JSON on success, and prints nothing on stdout on failure.
  - `preview` exits 1 on errors, exits 3 when the target exists, and draws only when neither applies.
  - `preview --digest` adds cross-check warnings.
  - `write` exits 1 on errors and 3 when the target exists.
  - `write` takes the id from the draft's base name, ignores the draft's directory, refuses `Urven.yaml`, and creates `static/characters/<id>.yaml` byte for byte with the `wx` flag.

  Verify that the tests fail.
- [x] 9.2 Implement `cli.ts` to pass 9.1, with a thin `main` that wires real `fs`, `fetch`, `process.argv`, and `process.exit`. Verify that the tests pass.
- [x] 9.3 Acceptance check: copy `static/characters/urven.yaml` to `.workspace/urven-check.yaml`. Run `digest` on the saved Urven fixture, then run `preview .workspace/urven-check.yaml --digest <file>`. Verify that it reports no errors and no cross-check warnings.
- [x] 9.4 Live check: run `npx --silent vite-node src/lib/ingest/ddb/cli.ts digest https://www.dndbeyond.com/characters/154922980`. Verify that it exits 0 and prints the same facts as 5.3.

## 10. Skill

- [ ] 10.1 Write `.claude/skills/dndbeyond-to-slate/SKILL.md`, with frontmatter (`name`, `description`) and the eight-step guided flow from the spec. Cover these points:
  - the exact commands, and what the skill says for each exit code
  - asking the Author for any `null` fact
  - proposing the id, the color, and whether to keep the name's emoji
  - drafting in `.workspace/<id>.yaml`
  - re-running the preview after every change
  - saving only through the write tool
  - a note on the editorial intent: a simplified sheet, not a copy

  Verify that the skill appears in the agent's skill list.
- [ ] 10.2 Scripted manual walkthrough, which validates the skill-flow scenarios. Run the skill on Urven's URL, targeting a new id such as `urven-test`. Change the proposed color once, and approve. Confirm by observation:
  - the preview runs again after the color change
  - nothing is written before approval
  - the write tool creates `static/characters/urven-test.yaml`, and it matches the approved draft

  Then delete the test file.
- [ ] 10.3 Walkthrough of a private character: run the skill on a private character. Confirm by observation that it relays the "set it to Public and retry" message and drafts nothing.

## 11. Documentation and full verification

- [ ] 11.1 Update `openspec/discovery.md`. Set story 16's `Change` field to `dndbeyond-ingest-skeleton`. Resolve the two ingest-epic open questions: the skill's location, and the D&D Beyond JSON shape, including the `subType` mapping. Verify that the open questions are marked resolved.
- [ ] 11.2 Run `npm test` and confirm that the whole suite passes.
- [ ] 11.3 Run `npm run build`. Confirm that the build succeeds, and that no file under `build/` contains ingest code (for example, `grep -r character-service build/` finds nothing).
