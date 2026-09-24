## Context

See `proposal.md` for motivation, and the specs for the required behaviour.

Today no component in the app renders an `<a href>`. The rich-text renderer has no link syntax by design, and `RichText.test.ts` asserts that dice pills are not interactive. So this change adds the app's first link to another site.

The data provider validates identity fields only. It passes every other key through unchanged, so a new `links` key reaches the view with no provider change. Each block owns its own data: `sections.ts` reads raw `unknown` input, checks each field with `ownString`, silently drops bad entries, and resolves colour with `resolvePalette`. `resolvePalette(undefined)` and `resolvePalette("plaid")` both return `neutral`.

`CharacterView.svelte` renders blocks in a fixed order. It shows a group heading only when that group's resolver returns something.

## Goals / Non-Goals

**Goals:**

- Put every URL check in one pure function that tests can reach without rendering.
- Reuse the existing tokens and contrast tests, so `palette.ts` does not change.
- Follow the resolver-plus-block pattern that sections and pools already use.

**Non-Goals:**

- A link syntax in rich text. The renderer stays link-free.
- Icons or favicons fetched from other sites. They would add third-party requests and would not work offline.
- A shared URL-safety module for other features. Nothing else needs one yet.

## Decisions

### D1. A pure `resolveLinks(links, characterPalette)` resolver

A new `src/lib/character/links.ts` exports `resolveLinks(links: unknown, characterPalette: PaletteName): ResolvedLink[]`. A `ResolvedLink` is `{ href, label, palette }`, and all three are plain strings.

The resolver takes the character's already-resolved palette as an argument. This keeps it a pure function, and it keeps the "default to the character's colour" rule in one place. The view already computes `resolvePalette(character.color)`, so it passes that value in.

For each entry, the resolver does the following, in order:

1. Skip the entry if it is not a plain object.
2. Read `url` with the `ownString` pattern. Skip the entry if `url` is missing or not a string.
3. Parse it with `new URL(url)` inside `try`/`catch`. Skip the entry if parsing throws. Parsing with no base URL rejects relative paths like `/sunny`.
4. Skip the entry unless `parsed.protocol === "https:"`. The URL parser lower-cases the scheme, so `HTTPS://` passes and `javascript:`, `data:`, and `http:` fail.
5. Skip the entry if `parsed.username` or `parsed.password` is not empty.
6. Set `href` to `parsed.href`, the normalised URL, not the raw string. The browser then receives exactly the URL the resolver checked.
7. Set `label` to the trimmed `label` string. If that is empty or missing, use `parsed.hostname`.
8. Set `palette` to `resolvePalette(color)` when the entry has a `color` string. Otherwise use `characterPalette`.

**Alternative considered:** a regular expression such as `^https://`. Rejected. A regex does not normalise the URL, and it cannot reliably spot credentials or malformed hosts. The platform's URL parser is the same one the browser uses to follow the link.

**Alternative considered:** an unknown `color` falls back to the character's palette instead of `neutral`. Rejected for consistency. A section row with an unknown colour already falls back to `neutral` through `resolvePalette`. Links behave the same way, and the spec says "the fallback palette".

### D2. A `LinksBlock.svelte` chip row, rendered last

`LinksBlock.svelte` takes the resolved links and renders a `<ul>` that uses `flex-wrap: wrap`. Each `<li>` holds one `<a>`:

- `href={link.href}`, `target="_blank"`, `rel="noopener noreferrer"`.
- `data-palette={link.palette}`. The existing palette CSS then sets `--tint` and `--deep` for that chip.
- A `--tint` background, `--deep` text, `min-height: 44px`, and a pill radius. `display: inline-flex` centres the label vertically.
- The label as plain text in a Svelte text expression, so Svelte escapes it. The label never passes through `RichText` or `{@html}`.
- An arrow glyph in a span with `aria-hidden="true"`.
- A visually hidden span with the text "(opens in a new tab)", so the accessible name carries both the label and the new-tab notice.
- A visible `:focus-visible` outline for keyboard users.

`CharacterView.svelte` adds a `hasLinks` check that calls the same resolver as the block. It renders a "Links" group heading and the block after `SectionsBlock`. This matches how the Stats, Health, and Pools groups work.

**Alternative considered:** a card with one row per link, like sections. Rejected. The group is tapped only now and then, so it should take less space than the prompts above it.

**Alternative considered:** `aria-label` on the anchor for the new-tab notice. Rejected. A hidden text span keeps the visible label in the accessible name, so voice control can still match the words the player sees.

### D3. Colour from existing tokens

The chip uses `--deep` text on `--tint`. Section headings already use that pair. The "tint readability" suite in `emitted-css.test.ts` checks it for every palette in both modes. So the chip needs no new tokens and no new contrast tests.

### D4. `links` is typed as `unknown` on `Character`

`src/lib/types.ts` gains `links?: unknown`, with a doc comment that points at `resolveLinks`. This matches `sections` and `pools`. It keeps `Character` JSON-clean and keeps link rules out of the provider.

## Risks / Trade-offs

- [A future author links to a site that is unsafe or unsuitable for a child] → The sheet shows only what the author writes. The `https:` rule blocks script and data URLs, but it cannot judge a site's content. Sunny's sheet has no `links` key.
- [A link fails when the table has no wifi] → Expected: links point to other sites. The chip still renders, and the browser shows its own offline page in the new tab. The sheet itself is not affected.
- [The installed app (story 12, later) opens links in the system browser] → That is the right behaviour for a new tab. The sheet stays open in the app, and the tracked state is already saved.
- [`target="_blank"` without `noopener` would expose `window.opener`] → `rel="noopener noreferrer"` is required by the spec and asserted in a component test.
- [`new URL` behaves slightly differently in jsdom than in browsers] → Tests use plain, unambiguous URLs. The behaviour the spec requires (scheme, credentials, relative paths) is standard across URL parsers.

## Migration Plan

No migration is needed. The key is optional and new, and existing character files render the same. `urven.yaml` gains example links in the same change. Rolling back means removing the block. Any `links` key left in a file is then ignored again.
