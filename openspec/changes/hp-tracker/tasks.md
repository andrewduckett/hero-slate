## 1. State store interface and JSON value type

- [ ] 1.1 Define the `StateStore` interface and a recursive `JsonValue` type in `src/lib/state/store.ts`, with `read(id, key)` and `write(id, key, value)` returning promises; verify `npm run check` type-checks the file.
- [ ] 1.2 Write failing tests in `src/lib/state/store.test.ts` (or the localStorage test file) that pin the interface contract: a written value reads back, an unwritten id/key reads `undefined`, and distinct ids and keys never collide; verify the tests fail before the implementation exists.

## 2. localStorage implementation

- [ ] 2.1 Write failing tests in `src/lib/state/localStorage.test.ts` for the localStorage store: value survives a simulated reload, an injective app-scoped key layout, and delimiter-bearing id/key pairs that do not collide; verify the tests fail first.
- [ ] 2.2 Write failing tests for resilience: unavailable or blocked storage reads `undefined`, corrupt (non-JSON) stored value reads as absent, a failed write fails quietly, and a syntactically-JSON but non-finite stored string such as `1e400` reads as absent (round-4 suggestion); verify they fail first.
- [ ] 2.3 Write failing tests for runtime JSON rejection: writing `NaN` after storing 30 leaves 30 in place, and writing a `Date` persists nothing; verify they fail first.
- [ ] 2.4 Write a failing test that imports and constructs the store with no `window` (or a throwing localStorage getter), then asserts construction does not raise, a read resolves `undefined`, and a write resolves quietly; verify it fails first.
- [ ] 2.5 Implement `createLocalStorageStore()` in `src/lib/state/localStorage.ts` — deferred, guarded localStorage access; an injective key layout; runtime JSON-value validation before writing; quiet failure that leaves existing values intact; verify all of tasks 1.2 and 2.1–2.4 pass.

## 3. Hit points resolver

- [ ] 3.1 Write failing tests in `src/lib/character/hitPoints.test.ts` covering resolution: full health on first load, authored `current` in the file ignored, stored current used, stored value above max clamps down, stored `-1` clamps to 0, raised max does not heal, non-integer max means no hit points, and non-integer stored current starts at max; verify they fail first.
- [ ] 3.2 Implement the pure resolver in `src/lib/character/hitPoints.ts` — read integer `max` > 0, accept any finite integer stored current then clamp to `0..max`, else start at `max`, never throw; verify task 3.1 passes.

## 4. HP tracker component

- [ ] 4.1 Write failing tests in `src/lib/character/HitPointsBlock.test.ts`: the readout shows "current / max", the bar exposes current, min 0, and max through an accessible progress role, the -5/-1/+1/+5 controls render, no reset control renders, and no tracker renders when there are no hit points; verify they fail first.
- [ ] 4.2 Write failing tests for adjustment, persistence, and the down state: taps adjust and clamp to `0..max`, taps persist through the state store under key "hp", a failed write does not block the on-screen change, and reaching 0 sets `data-hp-state="down"` with reduced opacity that clears above 0; verify they fail first.
- [ ] 4.3 Implement `HitPointsBlock.svelte` — readout, progress-role bar, adjustment controls, persistence via the store, and the down state; write from the tap handler, not a render effect; verify tasks 4.1 and 4.2 pass.

## 5. Wire the tracker into the sheet and load lifecycle

- [ ] 5.1 Write failing tests for the load lifecycle: controls stay inert until the stored current resolves, a late state read for a previous id is discarded after the route id changes, and a tap after a reduced-max load is not overwritten by the write-back; verify they fail first.
- [ ] 5.2 Write a failing route test where Sunny's provider read resolves after navigation to Ash, asserting the sheet shows Ash, not Sunny (round-4 suggestion — guard the combined result, not only the state read); verify it fails first.
- [ ] 5.3 Load the "hp" state in the route beside the provider read, render `HitPointsBlock` in `CharacterView.svelte` only after both resolve, bind results only for the current id, and issue the reduced-max write-back before controls accept taps; verify tasks 5.1 and 5.2 pass.

## 6. Sample data and full verification

- [ ] 6.1 Remove the now-unused `current` from `static/characters/sunny.yaml`, leaving only `max` under `hitPoints`; verify the sunny integration test still renders the tracker at full health.
- [ ] 6.2 Run `npm test` and `npm run build` and confirm both are green.
