## 1. Pool limits

- [x] 1.1 [easy] `pools.ts` exports `POOL_DOT_LIMIT = 12` and renames `MAX_POOL_DOTS` to `MAX_POOL_USES` (still 100); a pool with `max` 100 resolves and one with `max` 101 does not; update the importer in `validate.ts` (verify: `npm test -- src/lib/character/pools.test.ts`) (✓ npm test -- src/lib/character/pools.test.ts passed)

## 2. Pools block: dots and counter [depends-on: 1]

- [x] 2.1 [medium] A pool with `max` 12 renders 12 dot controls and no counter, and a pool with `max` 13 renders a counter reading `13 / 13` and no dots; each card carries `data-pool-form="dots"` or `"counter"`, and `data-pool-size` with its two 28 px CSS rules is gone (verify: `npm test -- src/lib/character/ResourcePoolsBlock.test.ts`) (✓ npm test -- src/lib/character/ResourcePoolsBlock.test.ts passed)
- [x] 2.2 [medium] A counter for `Lay On Hands` with `max` 35 is a group named "Lay On Hands: 35 remaining", has a progress bar named "Lay On Hands" with value 35 of 35, and has controls named "Lay On Hands: -5", "-1", "+1", "+5" in that order with `data-pool-adjust` (verify: `npm test -- src/lib/character/ResourcePoolsBlock.test.ts`) (✓ npm test -- src/lib/character/ResourcePoolsBlock.test.ts passed)
- [x] 2.3 [medium] A counter control adds its step, clamps to 0..max, and saves the full `pools` map: 35 then -5 shows `30 / 35` and saves 30; 3 then -5 saves 0; 33 then +5 saves 35 (verify: `npm test -- src/lib/character/ResourcePoolsBlock.test.ts`) (✓ npm test -- src/lib/character/ResourcePoolsBlock.test.ts passed)
- [x] 2.4 [easy] A counter at 0 is not marked down and keeps full opacity, and the counter has no reset or rest control (verify: `npm test -- src/lib/character/ResourcePoolsBlock.test.ts`) (✓ npm test -- src/lib/character/ResourcePoolsBlock.test.ts passed)
- [x] 2.5 [medium] A counter change and a dot change made before either save finishes both land in the saved map, and a stored count of 8 for a pool whose `max` is now 20 shows a counter reading `8 / 20` (verify: `npm test -- src/lib/character/ResourcePoolsBlock.test.ts`) (✓ npm test -- src/lib/character/ResourcePoolsBlock.test.ts passed)
- [x] 2.6 [medium] Style the counter as design D-d to D-f describe: 2.75rem round buttons (spend outlined in `--structural` with `--deep` text, restore filled in `--tint` with `--deep` border and text), a 2rem current value, a 0.75rem bar, and a counter card of `flex: 1 1 16rem`; every dot is 2.75rem with the `--space-2` gap (verify: `npm run build`) (✓ npm run build passed)

## 3. Ingest wording [depends-on: 1]

- [ ] 3.1 [parallel] [easy] The preview warning for a pool above 100 names the pool and says "the app tracks at most 100 uses", and no warning mentions dots (verify: `npm test -- src/lib/ingest/ddb/validate.test.ts`)
- [ ] 3.2 [parallel] [easy] The `dndbeyond-to-slate` skill tells the Author about a pool above 100 uses, and no longer mentions a 12-dot limit (verify: `! grep -nE "12-dot|at most 12|above 12" .claude/skills/dndbeyond-to-slate/SKILL.md`)

## 4. Integration [depends-on: 2, 3]

- [ ] 4.1 [medium] The full suite and the static build pass; in a browser at 360 px, `/urven` Focus Points dots, `/gimdak` Lay On Hands counter buttons, and a temporary, uncommitted character with a `max: 12` pool each measure at least 44 by 44 px with no sideways scroll (verify: `npm test && npm run build`)

## Deviations Ledger

<!-- Dated notes on small departures from the plan, written during apply. Stop and ask the user about a large one. -->
