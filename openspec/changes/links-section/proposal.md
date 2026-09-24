## Why

A fuller character sheet still sends its player to other sites during play, such as the D&D Beyond sheet or the spell compendium. Today the player must find the right browser tab, because nothing on the sheet can hold a link. Many sheets need no links at all — a child's sheet usually has none — so links must stay optional and invisible when absent.

Origin: discovery story 21 (`links-section`) in `openspec/discovery.md`.

## What Changes

- A character file can list links under an optional `links` key. Each link has a `url`, an optional `label`, and an optional `color`.
- The sheet shows the links as a wrapping row of chips in a "Links" group. The group renders last, after the authored sections.
- The sheet accepts only `https:` URLs. It silently drops any other link, such as `javascript:`, `http:`, or a URL that carries a username or password.
- A label is plain text, and emoji work in it. A missing or blank label falls back to the URL's hostname.
- A link without its own `color` uses the character's palette.
- Each link opens in a new tab and sends no referrer to the other site.
- A character with no valid links shows no "Links" group and no heading. Sunny's sheet does not change.

## Capabilities

### New Capabilities

- `character-links`: how the sheet reads the `links` key, which links it keeps, how it labels and colours them, and how the chips render and open.

### Modified Capabilities

- `character-sheet`: the `Sheet block order` requirement adds the links group after the custom sections. The `Group headings` requirement adds the "Links" heading.

## Impact

- **Code:** `src/lib/types.ts` gains a loosely typed `links` field. A new `src/lib/character/links.ts` resolver and `src/lib/character/LinksBlock.svelte` component follow the pattern in `sections.ts` and `SectionsBlock.svelte`. `src/lib/CharacterView.svelte` renders the new group last.
- **Theme:** the chips reuse existing tokens (`--deep` text on `--tint`). The contrast tests already cover that pairing, so `palette.ts` should not change.
- **Data:** `static/characters/urven.yaml` gains example links. `sunny.yaml` does not change.
- **Security:** this is the first place the app links to another site. The resolver is the only place that checks a URL.
- **Not touched:** the data provider. It already passes unknown keys through unchanged, so a new key needs no provider change.
