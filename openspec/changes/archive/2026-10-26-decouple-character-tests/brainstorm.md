**Why:** Editing a shipped character, such as levelling Sunny up, fails `npm test` because a test pins her real values, so the tests should own their data and check only that each shipped file loads.

## Story

#90 decouple-character-tests — editing a shipped character never fails the test suite. https://github.com/andrewduckett/hero-slate/issues/90

## Decisions

| # | Question | Answer | Source |
|---|---|---|---|
| D1 | Does any app behavior change? | No. Only tests change, so the change has no spec delta (`skip_specs: true`). | Evidence: issue #90 scope |
| D2 | What does the smoke test do when `static/characters/` has no YAML files? | It fails, so a wrong path or a moved folder can't pass silently. | User |
| D3 | Where does the fixture live, and what is it called? | `src/lib/data/test-hero.yaml`, beside the test that reads it. Id `test-hero`, name `Test Hero`. | User |
| D4 | Which id do tests use when they need a second character? | `other-hero`. | Assumption |
| D5 | Should the smoke test also run the ability, combat and hit-point resolvers? | No. It checks `found` only. The resolvers never throw, so running them would catch nothing. | Evidence: `src/lib/character/abilities.ts`, `combat.ts`, `hitPoints.ts` |
| D6 | Does `digest.acceptance.test.ts` change? | No. Its `sunny` and `urven` names are imports of the D&D Beyond fixtures, which stay. | Evidence: issue #90, `src/lib/ingest/ddb/digest.acceptance.test.ts` |
| D7 | What replaces `sunny.integration.test.ts`? | Two files in `src/lib/data/`: `yaml.integration.test.ts` checks exact values from the fixture, and `characters.smoke.test.ts` loads every shipped file. | Assumption |
| D8 | Do real character names in test data, not only ids, change too? | Yes. For example, `Sunny Thornwood` becomes `Test Hero`, and paths such as `.workspace/sunny.yaml` become `.workspace/test-hero.yaml`. | Assumption |
| D9 | Do spec examples that use `sunny` change? | No. Specs are out of scope. Their examples describe the shipped id. | Assumption |

## Changes from the story

None.

Confirmed by user: yes
