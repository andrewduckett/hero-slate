## Context

See proposal.md — Why. This section states only the current code state that shapes the approach.

The app is a static SvelteKit site built with `adapter-static`, rendered client-side (`ssr = false`). There is no global stylesheet, no root layout component, and no dark-mode handling yet. `CharacterView.svelte` renders a bare identity header. `sunny.yaml` has no `color` field. The PRD requires a named palette only, no raw hex, with accessible contrast in both light and dark (PRD §6.3).

## Goals / Non-Goals

**Goals:**

- Hold palette color values in one place, so names and values cannot drift.
- Follow the device's light/dark preference with no JavaScript and no toggle.
- Apply a character's `color` to the header with a safe fallback for any bad name.
- Guarantee only a known palette name ever reaches the rendered page.
- Keep the mechanism ready for per-row and per-section colors in story 6.

**Non-Goals:**

- Per-row and per-section colors (story 6). This change themes the sheet header only.
- A user-facing theme toggle. The device decides.
- Raw hex colors in config. Names only this release.

## Decisions

### One typed palette module is the source of values; the CSS is generated from it

We define all theme colors in one typed module, `src/lib/theme/palette.ts`. It holds every palette name with its four accent values: accent and on-accent, each in light and dark. It also holds one shared base pair: a surface color and a foreground color, each in light and dark. Every value is an opaque sRGB hex string, `#rrggbb`. One canonical format keeps the contrast math equal to what the browser paints.

A build step generates the stylesheet `src/lib/theme/palette.css` from that module. The generated CSS defines custom-property tokens. Light values sit on `:root`. Dark values sit under `@media (prefers-color-scheme: dark)`. The surface applies to the page background, and the foreground to the default body text. The per-name accent tokens apply through the attribute below.

This removes the drift risk. The resolver, the contrast test, and the CSS all trace back to the same module. CSS cannot import a TypeScript module, so a hand-written stylesheet plus a separate name list would let values and names diverge. Generating the CSS closes that gap.

Alternative considered: make the CSS the authoritative source and derive the name list from it. We rejected it because the contrast test needs the numeric color values, which are awkward to read back out of CSS. The typed module gives the test the values directly.

Mode switching stays pure CSS. The generated stylesheet carries the `@media (prefers-color-scheme: dark)` block, so the browser switches values with no script and no flash, including when the device preference changes while the sheet is open.

### Character color applied by a `data-palette` attribute, normalized first

The sheet root sets `data-palette="<name>"`. The generated CSS maps that attribute per name to the right accent and on-accent tokens, so a single `--accent` and `--on-accent` resolve to the character's color for the active mode. The header uses the accent as its background and on-accent as its text color.

A small pure function `resolvePalette(name)` takes a `string | undefined`. It returns the name when it exactly matches a known palette. It returns `neutral` for anything else: an unknown name, an empty string, a hex or `rgb(...)` string, or `undefined`. The provider has already rejected a non-string `color` as `invalid`, so the resolver never sees one. `CharacterView` sets `data-palette` from the result. So an unknown or missing `color` always maps to `neutral`, and no unmatched attribute value reaches the DOM. The resolver imports the name set from `palette.ts`, so it accepts exactly the names the CSS defines.

Alternative considered: inline `style="--accent: ..."` computed in Svelte. We rejected it because it would move light/dark logic into JavaScript, which the media query already handles for free.

### Contrast is verified by a test

The palette module records each accent/on-accent pair and the base surface/foreground pair. A unit test parses the tokens emitted to `palette.css` and computes the WCAG 2.1 relative-contrast ratio from them. It checks every accent name against its on-accent in both modes at 4.5:1. It checks the foreground against the surface in both modes at 4.5:1. The test reads the emitted CSS values, not only the module, so a bad generator step cannot pass. Because the header always draws on-accent text on the accent background, and body text draws foreground on the surface, the test covers the exact pairings the player sees. Any value that fails contrast fails the build.

A separate test checks the selector mapping. For each name, it asserts the emitted `data-palette="<name>"` selector sets `--accent` and `--on-accent` to that name's tokens, in both light and dark. This catches a generator that maps a name to the wrong palette's tokens, which the contrast test alone would miss. A component test then asserts the rendered header reads `--accent` and `--on-accent`, so the selected palette reaches the player.

### The generated stylesheet is a verified build step, not a hand-edited file

`palette.css` is build output, so it must regenerate and never drift. We add a generator script and run it before the build, so `npm run build` always produces the stylesheet from `palette.ts`. A test regenerates the stylesheet and asserts the checked-in file matches the fresh output, so a stale committed copy fails CI. The emitted-token test above then reads that same generated file. Together they prove the shipped CSS matches the typed source and passes contrast.

### `color` validated as a string at the provider boundary, resolved in the theme layer

The provider adds one rule: `color`, when present, must be a string, else `invalid`. It does not check the name against the palette. This keeps the provider free of palette knowledge, so adding a palette name later never touches data validation. The theming layer owns name resolution and the neutral fallback. This modifies the character-data `Definition validation` and `Character schema shape` requirements; see the character-data delta.

### Global tokens via a root layout; per-character accent scoped to the sheet

We add `src/routes/+layout.svelte` and import the generated `palette.css` there once. The layout wraps every route, so surface and text tokens apply site-wide, and the picker (story 7) inherits them. The per-character accent is not global. Only the character sheet sets `data-palette`. So a route without a character, such as the index at `/`, renders in the neutral default. It never picks up a character's color.

## Risks / Trade-offs

- **A generated file can go stale if edited by hand or not regenerated** → Regenerate `palette.css` before every build and treat it as build output. A test regenerates it and asserts the committed file matches, and the emitted-token test reads that same file, so both a stale copy and a wrong emitted value fail CI.
- **A `data-palette` value with no matching CSS rule would render unstyled** → The resolver guarantees the attribute is always a known name or `neutral`, so no unmatched value reaches the DOM.
- **Hand-picked colors could still miss contrast** → The contrast test fails the build for any name whose pair drops below the WCAG AA minimum, in either mode.

## Migration Plan

Additive only. No existing behavior changes: a character without `color` renders in `neutral`, which is the styled baseline. `sunny.yaml` gains `color: forest` as the worked example. Rollback is reverting the change; the identity header returns to unstyled.
