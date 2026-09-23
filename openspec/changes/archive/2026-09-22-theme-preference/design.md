## Context

See `proposal.md` for motivation. Today the theming layer is pure CSS. `generate.ts` emits a light `:root` and a `@media (prefers-color-scheme: dark)` override, and `palette.css` carries both. No script reads or sets the mode. The app shell is prerendered with `ssr = false`, so a client script runs after the static HTML is served. The state store (`src/lib/state/`) keys every value by a character's logical id, so it does not fit a global, character-independent preference. `emitted-css.test.ts` reads `palette.css` and splits it into a light scope and a dark `@media` scope; that split assumes the current light-first layout.

## Goals / Non-Goals

**Goals:**

- Emit a stylesheet where each mode is reachable two ways: the device media query, and a `data-theme` selector a stored choice sets.
- Set the mode before first paint from a static inline script, so no wrong-mode flash occurs.
- Keep one source of truth for the storage key, shared between the inline script and the module.
- Keep every existing contrast guarantee, and extend it to the `data-theme` path.

**Non-Goals:**

- A system/light/dark tri-state or a "back to device" reset control. A binary toggle serves; clearing storage restores device-following.
- Reading the mode from character config, or a per-character mode.
- New palette color values. Story 8 already set the tokens.

## Decisions

### Emitted CSS: dark base, light media override, `data-theme` paths

The generator inverts the current layout and adds the choice paths. It emits four contexts:

1. `:root` and each `[data-palette="<name>"]` — the **dark** values. This is the no-preference default.
2. `@media (prefers-color-scheme: light)` — the same selectors with the **light** values, for a device that prefers light.
3. `:root[data-theme="dark"]` and `:root[data-theme="dark"] [data-palette="<name>"]` — the dark values again, for an explicit dark choice.
4. `:root[data-theme="light"]` and `:root[data-theme="light"] [data-palette="<name>"]` — the light values again, for an explicit light choice.

The choice must beat the device. A base or media `[data-palette]` rule has specificity (0,1,0). The choice's `:root[data-theme="<mode>"] [data-palette]` rule has specificity (0,3,0): `[data-theme]` and `[data-palette]` are attribute selectors and `:root` is a pseudo-class, and all three count in the same middle column as a class. So the choice wins whatever the device prefers, whatever the source order. Each context also sets `color-scheme` (base `dark light`; media-light `light`; each `data-theme` block its own mode), so native controls and scrollbars match.

**Alternative considered:** a single set of `--x-light`/`--x-dark` custom properties resolved by a mode-switch variable (the `initial`/empty-value trick). Rejected — it is hard to read and hard to assert against in a test. Duplicating the values across contexts is verbose, but the generator writes it and the test checks the duplicates agree.

### Test rework: extract by context, compare by mode

Three tests read the emitted stylesheet and assume the old light-first, dark-in-`@media` layout, so all three change. `emitted-css.test.ts` splits on the dark `@media` marker. `generate.test.ts` asserts a `@media (prefers-color-scheme: dark)` block exists and splits on it. `tightest-ratios.test.ts` derives its dark scope from the same marker. The new layout has no dark `@media` block — dark is the base — so each of these reworks to the context model below.

The reworked helper SHALL extract token maps from four named contexts:

- **dark device** — the base `:root` and base `[data-palette="<name>"]` rules, outside any `@media` and any `data-theme` selector.
- **light device** — the `:root` and `[data-palette="<name>"]` rules inside `@media (prefers-color-scheme: light)`.
- **dark choice** — the `:root[data-theme="dark"]` and `:root[data-theme="dark"] [data-palette="<name>"]` rules.
- **light choice** — the `:root[data-theme="light"]` and `:root[data-theme="light"] [data-palette="<name>"]` rules.

The tests then assert two things per mode. The device context and the choice context carry identical token maps. And every contrast pairing the spec requires passes when computed from each mode's values. The helper SHALL also confirm each context sets `color-scheme`, so a context can never omit it.

### No-flash: a static inline script in `app.html`

A small script in the `<head>` of `app.html` runs before the body paints. It reads the stored mode and, when the value is exactly `light` or `dark`, sets `document.documentElement.dataset.theme` to it. It sets nothing for any other value, or when storage is empty or blocked, so the sheet falls to the device path. The script is wrapped in `try/catch`, because storage can throw when a browser blocks it.

The plan tests this behavior, not just its text. A test extracts the script body from `app.html`, then runs it against mocked storage in three cases: a valid `light`/`dark` value sets `data-theme`; a malformed value leaves `data-theme` unset; a throwing storage read is caught and leaves `data-theme` unset. The test also asserts the script sits inside `<head>`, and that the key literal in `app.html` equals the module's `THEME_STORAGE_KEY`, so the two cannot drift.

**Alternative considered:** set the mode in the layout's `onMount`. Rejected — the shell paints before hydration, so the wrong mode would show first.

### Storage: one global key, one shared constant

The mode is global, not per-character, so it does not go through the character-state store. A new module (`src/lib/theme/preference.ts`) owns:

- `THEME_STORAGE_KEY = 'hero-slate:theme'` — the one constant.
- read, write, and clear helpers over `localStorage`, each in `try/catch`.
- the effective-mode resolver (stored choice, else device preference), for the toggle's display.

The read helper accepts a stored value only when it is exactly `light` or `dark`. Any other value reads as no choice, so a stale or hand-edited value never forces a bad mode. The inline script uses the same allowlist. A read or write that throws is caught: a failed read reads as no choice, and a failed write still lets the toggle switch the current view.

The inline script cannot import the module, so it repeats the literal key string and the same allowlist. The inline-script test above ties the two together: it asserts the key literal in `app.html` equals the module's `THEME_STORAGE_KEY`, so they never drift.

**Alternative considered:** store the mode in the character-state store. Rejected — that store keys by character id, and the mode is one value for the whole device, read on routes with no character.

### The toggle lives in `+layout.svelte`

The layout wraps every route, so a control there shows on `/` and on a sheet alike. The control is a native `<button>` with an accessible name and an `aria-pressed` state, so keyboard and screen-reader users can operate it and read the active mode. The control reads the effective mode for its icon and state. On activation it writes the new mode, sets `data-theme`, and updates its display. A `matchMedia` listener updates only the control's displayed state when no choice is stored; the CSS media query already switches the colors, so no script drives them.

## Risks / Trade-offs

- **Modern browsers resolve "no preference" to `light`.** The `no-preference` media value is gone. A device that never set a preference usually reports `light`, matches the light media block, and renders light — not the dark base. → We accept this. The chosen rule is to follow a stated device preference and use dark only when the device states none. The dark base is asserted at the stylesheet level (the base `:root` carries the dark values) and applies in the prerendered shell and in any browser that reports no preference. A player who wants dark on a light-set device toggles once, and the choice persists.
- **The emitted stylesheet roughly doubles in size** (four contexts, not two). → It is small, static, and compresses well; the clarity is worth it.
- **Key duplication between the inline script and the module.** → A test ties them together, so a change to one fails until the other matches.

## Migration Plan

No data or config migration. Ship the regenerated `palette.css`, the inline script, the preference module, and the toggle together. To roll back, revert the change; a stored `hero-slate:theme` value then sits unused and harmless. Amend the no-toggle wording in `AGENTS.md` and in discovery stories 2 and 7 in the same change.
