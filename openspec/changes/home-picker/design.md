## Context

- `/` is a placeholder: `src/routes/+page.svelte` renders `AppHeader` with a hint to type a path. The layout already prerenders the shell with `ssr = false`, so the home page fetches at runtime like the sheet does.
- `CharacterProvider` (`src/lib/data/provider.ts`) exposes only `getCharacter(id)`. The YAML implementation (`src/lib/data/yaml.ts`) validates the id, fetches `/characters/<id>.yaml`, maps every outcome to a typed result, and validates identity through `checkIdentity`. Its tests inject a `FetchLike`.
- `CharacterSheet.svelte` is the pattern for a route container: it takes the provider as a prop, owns the load lifecycle, discards late results, and hands a typed result to a presentational view.
- Palette names resolve through `resolvePalette` (`src/lib/theme/resolve.ts`); `data-palette` on an element maps `--accent`, `--on-accent`, `--tint` and `--deep` for the active mode. `formatIdentity` (`src/lib/format.ts`) builds the "Level 7 Druid" line.
- The shipped-characters smoke test reads every `.yaml` in `static/characters/` and expects each to load as `found`.
- The home page must keep its 44rem width (character-sheet spec, "Wide sheet content width").
- Constraints from `AGENTS.md`: static-first, consumers depend only on the provider, no palette knowledge in the provider, `Character` stays JSON-clean.

## Goals / Non-Goals

**Goals:**
- Add a listing operation to the provider interface that a hosted backend can implement in one query.
- Keep one source of truth for name, level, class and color: the character file.
- Reuse the sheet's lifecycle pattern, descriptor function and palette resolution; add no new primitives.

**Non-Goals:**
- Avatars (#35), search or filtering, state previews on cards, a back link from the sheet, caching or offline behavior (#33).
- Validating the manifest beyond its shape. A listed id that does not load is skipped, not reported.

## Test Seams

- **Primary test seam:** the component harness (`@testing-library/svelte`) rendering `CharacterPicker` with a fake `CharacterProvider`, as `CharacterSheet.test.ts` does today. It proves cards, order, links, palette attributes, and the loading, empty and error states.
- **Existing seams reused:** `yaml.test.ts` with an injected `FetchLike` for `listCharacters()` and the reserved id; `characters.smoke.test.ts` for the shipped manifest against the shipped files. Layout properties (tap size, phone width) are confirmed by a reviewer in a browser, as the sheet's are.

## Scrutiny Tier & Blast Radius

- **Tier:** medium. One new operation on an established interface, one new route component on an established pattern, no trust boundary beyond the id grammar the provider already enforces.
- **Blast radius:** `src/lib/data/` (interface and YAML implementation, plus every test double that implements `CharacterProvider`), `src/routes/+page.svelte`, a new `src/lib/CharacterPicker.svelte`, `static/characters/manifest.yaml`, and the smoke test. The sheet, theming, state and ingest code are untouched.

## Decisions

1. **The manifest lists ids; the provider assembles summaries** (D1). `listCharacters()` returns `{ status: 'found', characters: CharacterSummary[] } | { status: 'error' }`. The YAML implementation fetches the manifest, then calls its own `getCharacter` for each id in parallel with `Promise.all`, and keeps the `found` ones. Alternative: a manifest carrying `name` and `color`. Rejected because the fields would drift from the sheet, and because a database implementation returns summaries from one query anyway, so the interface should already speak in summaries.
2. **Summaries are built from `found` definitions only.** `CharacterSummary` is `Pick<Character, 'id' | 'name' | 'level' | 'class' | 'color'>`, copied field by field so provisional fields never leak. Validation stays in `checkIdentity`; the listing adds none. Alternative: a lighter manifest-only fetch that skips validation. Rejected: a card would then open a sheet that fails.
3. **Manifest shape is `characters: [ids]`.** A top-level mapping leaves room for later keys without a format change. Entries that are not strings, that fail `ID_GRAMMAR`, that equal `manifest`, or that repeat an earlier id are dropped before any fetch.
4. **Manifest load failures and any `error` entry return `error`; `not-found` and `invalid` entries are skipped.** A missing or malformed manifest is an author mistake the page should surface as "try again", not an empty roster that hides the mistake. A 503 on one file means the roster is incomplete for a reason a reload fixes, so the whole listing says so. Alternative: show the partial roster. Rejected: a kid would see a hero vanish for no visible reason.
5. **The reserved id lives in `getCharacter`.** A check for `manifest` sits beside the grammar check, returning `not-found` before any fetch. Alternative: move the manifest to `static/characters.yaml`. Rejected by the user (D2) for discoverability.
6. **`CharacterPicker.svelte` is a container, like `CharacterSheet.svelte`.** It takes `provider` as a prop, owns `loading | found | error`, and renders the list itself: `<ul data-block="picker">` of `<li data-palette={resolvePalette(summary.color)}>` each holding one `<a href="/{id}">`. The route's `+page.svelte` wires the YAML provider and the header. The list and the cards stay in one file because the card has no behavior of its own; split it when #35 adds the avatar.
7. **A card is a mini header.** Accent background, on-accent text, the display font for the name, the descriptor beneath, `min-height: 44px`, `border-radius: var(--radius-l)`, `box-shadow: var(--shadow)`. Cards sit in a CSS grid of `minmax(16rem, 1fr)` columns, so one per row on a phone and two on a tablet inside the 44rem page. Alternative: tint with deep text, like link chips. Rejected: a card represents the sheet it opens, and the sheet's header is accent-filled.
8. **The link's accessible name is the card's text.** The anchor wraps the name and descriptor, so a screen reader announces "Sunny Thornwood, Level 7 Druid". No `aria-label` duplicates it.
9. **The smoke test checks the manifest both ways.** It skips `manifest.yaml` when collecting ids, and adds one test that the manifest's ids equal the set of shipped files. An author who adds a file without a line, or a line without a file, fails `npm test`.
10. **Every `CharacterProvider` test double gains `listCharacters`.** The interface change is breaking for in-repo doubles only; the doubles in `CharacterSheet.test.ts` and `characters.smoke.test.ts` get a stub that returns an empty `found`.

## Risks / Trade-offs

- [N+1 fetches on `/`: one manifest plus one file per character] → Fine at a family's roster size, and they run in parallel. A hosted backend implements `listCharacters()` in one query.
- [A manifest line and a file drift apart] → The smoke test fails the suite on either direction of drift.
- [`AppHeader` tests stub `matchMedia`; a picker test that renders the header would need the same stub] → The picker component renders no header; the route page composes them and has no unit test, like `[id]/+page.svelte`.
- [A slow character file delays the whole roster] → Accepted: the page shows "Loading…" until all resolve, and the sheet already waits for its reads. Per-card loading would complicate the empty-state rule.
- [Reserving `manifest` is a special case in the provider] → One line beside the grammar check, with a comment naming D2.

## Migration & Rollback

N/A for data. Deploy adds `static/characters/manifest.yaml` listing `sunny`, `gimdak` and `urven`; the build serves it beside the character files. Rollback is reverting the commit; the sheet's deep links do not depend on the manifest.
