## Context

See `proposal.md` for why this change exists. The requirements are in the two delta
specs under `specs/`.

The sheet today has these parts:

| Part | Where | State today |
|---|---|---|
| Block order | `src/lib/CharacterView.svelte` | Header, hit points, pools, abilities, combat, sections |
| Block styles | `src/lib/character/*Block.svelte` | Scoped `<style>` per block; minimal spacing |
| Colors | `src/lib/theme/palette.ts` → generated `palette.css` | `surface`, `foreground`, and per-palette `accent` / `on-accent` |
| Global CSS | `src/routes/+layout.svelte` | Imports `palette.css` only; browser default fonts |
| Contrast tests | `src/lib/theme/palette.test.ts`, `emitted-css.test.ts` | Read the emitted CSS and assert WCAG AA ratios |

Two constraints shape the approach:

- `palette.ts` is the only place color values live. A script generates
  `palette.css` from it, and nobody edits that file by hand (see `AGENTS.md`).
- The site is static-first on Cloudflare Workers static assets (ADR 0001). Files in
  `static/` ship to `./build` unchanged, with no Worker code.

## Goals / Non-Goals

**Goals:**

- Give the sheet a single, consistent visual language with a small set of
  reusable CSS variables, so later stories (picker cards, avatars) can reuse it.
- Keep every color pair testable from the emitted stylesheet, as today.
- Keep all existing behavior tests green without editing their assertions.

**Non-Goals:**

- A design-token system beyond what this sheet needs.
- Motion design. There are no animations beyond the existing calm fade at 0 hit points.
- Print styles.

## Decisions

### D1. Visual direction: "Field Journal"

The look is warm and chunky: a paper-toned page, white rounded cards with a soft
shadow, and large numbers. Each character's palette accent drives the colored
parts.

```
+------------------------------------------+
| [ accent header card: name, descriptor ] |
|                                          |
|  STATS                                   |
|  [STR][DEX][CON][INT][WIS][CHA]  raised  |  modifier large, score small (muted)
|  [  AC  ][ SPEED ][ INIT ]       accent  |  solid tiles, on-accent text
|                                          |
|  HEALTH                                  |
|  [ card: 38 / 45, thick bar, (-5)(-1)  (+1)(+5) ]
|                                          |
|  POOLS                                   |
|  [ card: label + row of chunky dots ]    |
|                                          |
|  [ section card: accent title strip ]    |
|  [   rows: accent title, body text  ]    |
+------------------------------------------+
```

- **Page:** content is centered with a maximum width of about 44rem. The page has
  a 16px side gutter on phones.
- **Header:** a rounded card in the accent color with on-accent text. The name uses
  the display font at a large size.
- **Group headings:** "Stats", "Health", and "Pools" are small uppercase labels in
  muted text. They are fixed words, not character data. "Health" is the heading
  text for the hit points tracker; the artifacts call the block itself the hit
  points tracker. A heading renders only when at least one block in its group
  renders (see the character-sheet delta spec).
- **Ability tiles:** a grid of raised cards with an accent top border. The label and
  score are muted, and the modifier is large in the display font. The grid uses
  `repeat(auto-fit, minmax(6.5rem, 1fr))`. It gives six tiles on one row at
  desktop widths and 3 by 2 at 360px.
- **Combat tiles:** solid accent tiles with on-accent text. This is the "distinct
  visual treatment" the existing spec requires.
- **Section cards:** raised cards. The existing accent title strip becomes the
  card's top. Rows stack their title above the body on narrow screens and sit side
  by side from about 30rem up.

Alternative considered: copy the bespoke page's style (dashed tracker borders,
per-stat nicknames). Rejected, because the user asked for a fresh look, and the
nicknames would need new data fields.

### D2. Hit points tracker

- The readout keeps the exact text `current / max` that the tests assert. The
  current value renders large in the display font, and the max renders smaller.
- The bar grows to about 1rem tall with fully rounded ends. It keeps its progress
  role and values.
- The controls stay four buttons in the order -5, -1, +1, +5. They are round,
  at least 3rem across, and split into two groups with a flexible gap between
  them. The damage buttons use an outlined style. The heal buttons use a filled
  accent style with on-accent text.
- The down state keeps the existing opacity dim and `data-hp-state` attribute.

Alternative considered: a heart per hit point, as on the bespoke page. Rejected,
because it changes tracker behavior, which is out of scope.

### D3. Two new base colors: `raised` and `muted`

`Base` in `palette.ts` gains `raised` (card background) and `muted` (secondary
text). The generator emits them as `--raised` and `--muted` in both modes. Cards and
tiles use `--raised`. Labels and raw scores use `--muted` instead of `opacity`.
Opacity blends text with whatever sits behind it, so the contrast test could not
check the painted color. A token keeps the tested value equal to the painted value.

Starting values, all checked with the WCAG formula:

| Token | Light | Dark |
|---|---|---|
| `surface` (changed) | `#f7f2e8` warm paper | `#14171a` (unchanged) |
| `raised` (new) | `#ffffff` | `#1e2327` |
| `muted` (new) | `#5c5a55` | `#a9b0b8` |

With these values, the foreground and muted pairs all exceed 6:1. Every accent
must reach at least 4.8:1 on the surface, to leave a margin above 4.5:1. The
light-mode `forest` accent (4.52:1 on the new surface) misses that target, so the
implementer darkens it and keeps its hue. The contrast tests gate the final values.

**No blended colors behind text or controls.** Text colors and the backgrounds
directly behind text or a control must come from palette tokens only. The
restyled blocks drop `color-mix(... transparent)` and `opacity` for those cases,
such as today's hit points button fill and label opacity. Only decorative lines
and shadows, which carry no text, may blend. The one exception is the existing
opacity dim on the hit points tracker at 0, which the spec requires.

Alternative considered: a per-palette tint token for tile backgrounds. Rejected for
now, because it adds six more pairs to check and the design does not need it.

Alternative considered: keep the light surface white and make cards off-white.
Rejected, because cards that are lighter than the page read as "raised" in both
modes. That is the effect the design wants.

### D4. Self-hosted fonts

- **Typefaces:** Baloo 2 for the display text (name, big numbers, headings) and
  Nunito for body text. Both are licensed under the SIL Open Font License 1.1.
- **Files:** latin-subset variable `.woff2` files, vendored into `static/fonts/`
  with each font's `OFL.txt`. The files come from the Fontsource distribution of
  each family, fetched once at development time. The site gains no runtime
  dependency.
- **Declarations:** a hand-written `src/lib/theme/fonts.css` holds the
  `@font-face` rules with root-relative `/fonts/...` URLs and
  `font-display: swap`. `+layout.svelte` imports it next to `palette.css`. It is not
  generated, because it holds no color values.
- **Fallback:** `--font-display` and `--font-body` custom properties name the family
  plus a system fallback stack (`system-ui, sans-serif`).

Alternative considered: add the Fontsource npm packages and import their CSS. Vite
would then emit hashed font files. Rejected, because the licence would not reach
the build output, and a vendored file is easier to audit.

Alternative considered: Google Fonts over its CDN. Rejected. It adds a third-party
request on a child's page and breaks offline use (story 10).

### D5. Block order and test hooks

`CharacterView.svelte` renders the blocks in the order the spec fixes. It wraps
the stat blocks and the trackers in labeled groups. Each block's root element
carries a `data-block` attribute (`header`, `abilities`, `combat`, `hit-points`,
`pools`, `sections`). The order test compares document positions of those
attributes. Tests then do not depend on class names or visual layout.

### D6. Styles stay scoped per component

Each block keeps its scoped `<style>`. A small global stylesheet, `src/lib/theme/base.css`,
holds only page-level rules and shared variables: the fonts, a spacing scale,
corner radii, shadow, and the centered container. It holds no colors, which still
come only from `palette.css`. The theming layer stays the one place for color
values.

## Risks / Trade-offs

- [Existing tests break on markup changes] → Keep the text, roles, and attributes
  that tests query. Change only wrappers and classes. Run the suite after each block.
- [Accent contrast margin is thin on the warm surface] → D3 darkens light-mode
  `forest` and relies on the existing contrast tests as the gate.
- [jsdom cannot check layout, tap sizes, or font loading] → A reviewer checks the
  phone-width and tap-target rules in a browser at 360px, as the spec states. A
  test checks the font rule by reading `fonts.css` and the `static/fonts/` folder.
- [Fonts add page weight] → Two latin-subset variable fonts total roughly 100 KB.
  They are cached after the first visit, and `font-display: swap` shows text at once.
- [Changing `surface` affects every route] → Intended. The home route shares the
  same page background.

## Migration Plan

No data or storage migration. Stored hit points and pool state keep their keys.
Deploy as usual with `npm run deploy`. To roll back, revert the change and redeploy.
