## 1. Theme-preference module (test first)

- [x] 1.1 Write failing tests for a new `src/lib/theme/preference.ts`: `THEME_STORAGE_KEY` equals `hero-slate:theme`; a read returns `light`/`dark` only for those exact stored values and `null` for anything else (empty string, `system`, JSON, whitespace); a read whose `localStorage` access throws returns `null`; a write persists the value; a write that throws is swallowed and does not raise. Verify the tests fail.
- [x] 1.2 Implement `preference.ts` to pass 1.1: the exported key, an allowlisted read, a write, and a clear helper, each wrapping `localStorage` access in `try/catch`. Verify `npm test` passes for this file.
- [x] 1.3 Add and pass a test for an effective-mode resolver that returns the stored choice when present, else the device preference read from `matchMedia('(prefers-color-scheme: dark)')`. Verify the resolver test passes.

## 2. Generator and emitted CSS (test first)

- [x] 2.1 Rework `src/lib/theme/emitted-css.test.ts` to the four-context model from design.md — dark-device (base `:root`), light-device (`@media (prefers-color-scheme: light)`), dark-choice (`:root[data-theme="dark"]`), light-choice (`:root[data-theme="light"]`). Assert per mode that device and choice contexts carry identical token maps, that every existing contrast pairing passes from each mode's values, and that each context sets `color-scheme`. Verify the tests fail against the current generator.
- [x] 2.2 Update `src/lib/theme/generate.ts` to emit: a dark base `:root` and dark base `[data-palette]` rules; a `@media (prefers-color-scheme: light)` block with the light values; and `:root[data-theme="dark"]` / `:root[data-theme="light"]` blocks (with their `[data-palette]` descendants) for both modes. Set `color-scheme` in each context. Verify 2.1 passes.
- [x] 2.3 Regenerate the stylesheet with `npm run generate:palette` and verify the committed `src/lib/theme/palette.css` matches (the generate match-test is green).
- [x] 2.4 Rework `src/lib/theme/generate.test.ts` and `src/lib/theme/tightest-ratios.test.ts`, which both assume a dark `@media` block: point them at the base `:root` for dark values instead. Verify both pass.

## 3. No-flash inline script (test first)

- [x] 3.1 Write a failing test that extracts the inline `<head>` script from `src/app.html` and runs it against mocked storage: a valid `light`/`dark` value sets `document.documentElement.dataset.theme`; a malformed value leaves it unset; a throwing storage read is caught and leaves it unset. Assert the script sits inside `<head>` and that its key literal equals `THEME_STORAGE_KEY`. Verify it fails.
- [x] 3.2 Add the inline pre-paint script to `src/app.html`: read the stored mode, apply the `light`/`dark` allowlist, set `data-theme` before the body, all in `try/catch`. Verify 3.1 passes.

## 4. Toggle control (test first)

- [x] 4.1 Write failing component tests for a mode toggle: it renders a `<button>` with an accessible name, is operable by keyboard, and exposes the active mode via `aria-pressed`; activating it switches `data-theme`, persists through `preference.ts`, and updates its label/state. Verify the tests fail.
- [x] 4.2 Implement the toggle component and mount it in `src/routes/+layout.svelte` so it shows on every route, including `/`. Initialize its displayed state from the effective-mode resolver, and add a `matchMedia` listener that updates only the displayed state when no choice is stored. Verify 4.1 passes.
- [x] 4.3 Add and pass a test that the toggle is present and functional on a route that renders no character (e.g. `/`).

## 5. Documentation amendments

- [x] 5.1 Amend `AGENTS.md`: replace the "pure `prefers-color-scheme` media query with no toggle" wording with the new rule (a manual toggle exists, a persisted per-device choice overrides the device, dark is the resting default). Verify the file no longer asserts "no toggle".
- [x] 5.2 Amend discovery stories 2 and 7 in `openspec/discovery.md` where they state light/dark is toggle-free, noting story 9 introduced the toggle. Verify neither story still claims there is no toggle.

## 6. Full verification

- [x] 6.1 Run `npm test` and confirm the whole suite passes, including the reworked emitted-CSS, generator, tightest-ratios, inline-script, preference, and toggle tests.
- [x] 6.2 Run `npm run build` and confirm the static build succeeds with the regenerated `palette.css`.
- [ ] 6.3 Load a sheet in the dev preview and confirm by observation (manual verification required): the sheet opens per the device (dark when the device prefers dark or states nothing); the toggle switches modes with no reload and no flash on refresh; the choice survives a reload and carries across characters.
