## 1. Palette source module

- [x] 1.1 Create `src/lib/theme/palette.ts` with a typed definition holding the six names (`forest`, `fire`, `ocean`, `berry`, `sun`, `neutral`), each with accent and on-accent values for light and dark, plus a shared base surface and foreground pair for light and dark. Every value is an opaque sRGB hex string `#rrggbb`. Verify with a unit test that the exported name list equals exactly those six names and that each name and the base pair define all their values.
- [x] 1.2 Add a WCAG contrast helper and a unit test that computes the ratio for every accent/on-accent pair and for foreground-on-surface, in both modes, and asserts each is at least 4.5:1. Verify the test passes for the chosen values (adjust values until it does).

## 2. Generated stylesheet and build wiring

- [x] 2.1 Add a generator that emits `src/lib/theme/palette.css` from `palette.ts`: `:root` light tokens, a `@media (prefers-color-scheme: dark)` block for dark tokens, and one `[data-palette="<name>"]` rule per name mapping `--accent` and `--on-accent`. Verify by running the generator and confirming the file contains a rule for every name.
- [x] 2.2 Wire the generator into the build so `npm run build` regenerates `palette.css` first. Add a test that regenerates the stylesheet in memory and asserts the committed file matches. Verify `npm run build` succeeds and the match test passes.
- [x] 2.3 Add a test that parses the emitted `palette.css` tokens and re-runs the contrast checks against those emitted values (not only the module). Verify the test passes.
- [x] 2.4 Add a test that asserts each emitted `[data-palette="<name>"]` selector sets `--accent` and `--on-accent` to that name's tokens, in both light and dark. Verify the test fails if a name is mapped to the wrong palette's tokens.

## 3. Character color validation

- [x] 3.1 Add optional `color?: string` to the `Character` type in `src/lib/types.ts`. Verify the project type-checks.
- [x] 3.2 Extend the data provider's definition validation: accept `color` only when it is a string, else return `invalid`; carry a string `color` through unresolved. Verify unit tests cover a valid `color` string carried through, an unknown-name string carried through, an absent `color` reported as absent, and a non-string `color` returning `invalid`.

## 4. Theming resolver

- [x] 4.1 Add `resolvePalette(name: string | undefined)` in the theme layer that returns the matching name for an exact palette name and `neutral` otherwise. Import the name set from `palette.ts`. Verify a table-driven unit test covers each known name, an unknown name, an empty string, a whitespace string, an uppercase name, a `#ff0000` hex string, an `rgb(...)` string, and `undefined` — all non-matches resolving to `neutral`.

## 5. Sheet rendering and layout

- [x] 5.1 Add `src/routes/+layout.svelte` that imports the generated `palette.css` once. Verify the surface applies to the page background and the foreground to body text in the running app, and that the index route `/` renders in the neutral default (no `data-palette`).
- [x] 5.2 Update `src/lib/CharacterView.svelte` to set `data-palette` from `resolvePalette(character.color)` on the sheet root, render the identity header background in `--accent`, and render the name and descriptor text in `--on-accent`. Verify a component test asserts the rendered header reads `--accent` and `--on-accent` and that `data-palette` is the resolved name.
- [x] 5.3 Verify by manual check (or a mode-aware test) that switching the device between light and dark updates the surface, body text, header accent, and header text with no reload and no toggle control present.

## 6. Sample config

- [x] 6.1 Add `color: forest` to `static/characters/sunny.yaml`. Verify `/sunny` renders its header in the forest palette and that removing `color` falls back to neutral without error.

## 7. Integration verification

- [x] 7.1 Run the full test suite and `npm run build`. Verify all theming, resolver, contrast, generation, and provider tests pass and the build regenerates `palette.css` cleanly.
