## Context

- `src/routes/+layout.svelte` wraps every route in `<main class="page">`. `.page` in `src/lib/theme/base.css` caps the content at 44rem with a 16px gutter. The home page (`/`) and the sheet (`/[id]`) share this cap.
- `CharacterView.svelte` renders the sheet as one `article` grid (gap `--space-5`). Its direct children are the `AppHeader`, then one `.group` div per group (Stats, Health, Pools, Links). The `SectionsBlock` root (`div.sections`) sits between Pools and Links. `CharacterView` already computes `hasStats`, `hasHealth`, `hasPools` and `hasLinks` with the same resolvers its blocks use.
- `AbilitiesBlock` and `CombatBlock` lay out their tiles with `repeat(auto-fit, minmax(6rem, 1fr))`. At 360 that gives 3 per row and at 800 it gives 6. Between about 430 and 670 CSS pixels it gives 4 or 5, which leaves a short row.
- The sheet's components use no container queries yet. The only width media query is `SectionsBlock`'s 30rem row breakpoint.
- jsdom computes no layout. Tests can check DOM structure and attributes, not where things land on screen.
- The prototype (brainstorm D7) injected this design into the dev server and confirmed it at 1280×800 for `/sunny`, `/urven` and `/gimdak`.

## Goals / Non-Goals

**Goals:**

- Put the two-column structure in markup that a jsdom test can check: which group sits in which column, the order, and when one column spans.
- Keep each block's layout knowledge inside the block, so `AbilitiesBlock` does not need to know the page's breakpoint.
- Change nothing below 1024 CSS pixels except the ability tile count at widths where `auto-fit` gave 4 or 5.

**Non-Goals:**

- Balancing column heights (D7).
- Reworking `ResourcePoolsBlock`, `SectionsBlock` or `LinksBlock`. They already wrap to the width they get.
- Adding automated visual or layout tests. Layout acceptance stays a reviewer check in a browser.

## Test Seams

- **Primary test seam:** `src/lib/CharacterView.test.ts`, the existing component harness. It renders the view with a character object and asserts on the DOM. New tests assert that:
  - each group sits in the right column wrapper;
  - document order is unchanged;
  - the lone-column marker is set exactly when one side is empty.
- **Existing seams reused:** `src/lib/character/AbilitiesBlock.test.ts` and `CombatBlock.test.ts`, to confirm the tile markup change keeps their queries (`.ability`, `.combat-entry`) passing. The reviewer scenarios in the spec cover layout in a browser.

## Scrutiny Tier & Blast Radius

- **Tier:** low
- **Blast radius:** presentation only, in one package. Files: `CharacterView.svelte`, `AbilitiesBlock.svelte`, `CombatBlock.svelte`, `+layout.svelte` and `base.css`. No data, provider, state or theme-token change. Two shared files (`+layout.svelte` and `base.css`) also wrap the home page, so check `/` too.

## Decisions

### 1. Two column wrappers in `CharacterView`, not grid placement of each group

`CharacterView` wraps the left groups in `<div class="column" data-column="left">` and the right blocks in `<div class="column" data-column="right">`. It renders a wrapper only when at least one of its blocks renders:

- left: `hasStats || hasHealth || hasPools`;
- right: `hasSections || hasLinks`, where a new `hasSections` uses `resolveSections`, as `SectionsBlock` does.

Each wrapper is a grid with the same `--space-5` gap the article uses today. In one column the stacked wrappers therefore give exactly today's spacing.

From `64rem` (1024px) up, the `article` becomes `grid-template-columns: minmax(0, 1fr) minmax(0, 1fr)`, with `align-items: start` and a `--space-6` column gap. The header spans `1 / -1`.

- *Alternative: place each group with `grid-row` and `grid-column` on one article grid.* Rejected. Groups in the same row share its height, so a tall section block opens gaps between the left groups. The prototype showed this.
- *Alternative: CSS multi-column (`column-count: 2`).* Rejected. The browser decides where to break, so a group can land in either column. That contradicts D1 and D7.
- The wrappers change no reading order. They group adjacent siblings and keep the DOM order the spec requires.

### 2. The lone column is marked in markup

When exactly one wrapper renders, it gets `data-span="full"`, and CSS gives it `grid-column: 1 / -1` (D8). `CharacterView` already knows both flags, so the test can assert the attribute.

- *Alternative: `:only-of-type` or `:has()` in CSS.* Rejected. It depends on the header's element type, and jsdom cannot check it.

### 3. Ability tiles follow their own width, with a container query

`AbilitiesBlock` makes its `section` an inline-size container and moves the tile grid onto an inner `div.tiles`. The grid is `repeat(3, 1fr)` by default and `repeat(6, 1fr)` under `@container (min-width: 40rem)`. With 640px of room, six tiles at least 96px wide fit, which matches where `auto-fit` switched to 6 before.

| Situation | Block width | Tiles per row |
|---|---|---|
| Phone, 360 wide | 328px | 3 |
| Viewport 600 wide | 568px | 3 |
| Portrait tablet, 800 wide | 672px | 6 |
| Two columns at 1024 | 480px | 3 |
| Two columns at 1280 | 608px | 3 |
| Lone left column spanning at 1280 (D8) | 1248px | 6 |

- *Alternative: viewport media queries in `AbilitiesBlock`.* Rejected. They would duplicate the page's 64rem breakpoint in a second file and tie the block to the page layout.
- The new wrapper keeps the `.ability` class on each tile, so the existing tests' queries still match.

### 4. Combat tiles are always 3 per row

`CombatBlock` uses `repeat(3, minmax(0, 1fr))` at every width. No query is needed.

### 5. The wider cap applies only on the sheet route

`+layout.svelte` reads `page.route.id` from `$app/state` and adds `page--sheet` to `<main>` when the route is `/[id]`. `base.css` widens `.page--sheet` to `max-width: 80rem` inside `@media (min-width: 64rem)`. At 1280 that leaves the content 1248px wide with the 16px gutters (D9), and wider screens center it. `/` keeps 44rem (D10).

- *Alternative: `.page:has(article[data-palette])`.* Rejected. It ties `base.css` to `CharacterView`'s markup.
- *Alternative: move the cap into each route.* Rejected. It changes the home page's markup, which is #31's work.

### 6. Breakpoint value

The spec defines a wide viewport as at least `64rem`: 1024 CSS pixels at the browser's default 16px font size. The page uses `64rem` in two places: `CharacterView`'s column rule and `base.css`'s cap rule. CSS custom properties cannot appear in media queries, so a comment in each place names the other.

## Risks / Trade-offs

- [A character with 1 or 2 combat entries now leaves an empty third of the row, where `auto-fit` used to stretch them] → Accepted by D6, which promises only the standard counts. No shipped character is affected.
- [Phones held sideways at 430–670 wide now show 3 ability tiles per row instead of 4 or 5] → This is intended: the old count left a short row. The reviewer can check it at 600 wide.
- [A user who sets a larger browser font size changes where `rem` breakpoints fall] → `rem` breakpoints are deliberate here: a larger font gets one column sooner, which keeps text from cramping.
- [The two breakpoint copies drift apart] → The cross-reference comments, plus the reviewer check at 1024 and 1280.
- [`container-type: inline-size` on the abilities section stops the section sizing to its content] → It is a block-level grid item that already fills its column, so its width does not change.

## Migration & Rollback

N/A. There is no data or state change, so a revert of the change's commits restores today's layout.
