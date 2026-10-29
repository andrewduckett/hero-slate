## Context

- Identity fields flow from YAML through `checkIdentity` and `toSummary` in `src/lib/data/yaml.ts` to `Character` (`src/lib/types.ts`) and `CharacterSummary` (`src/lib/data/provider.ts`). `color` is the model: the provider type-checks a string and `resolvePalette` in the theming layer interprets it.
- `AppHeader.svelte` is one flex row: `.header-text` (name, descriptor) and `ThemeToggle`. It paints `var(--accent)` and `var(--on-accent)` inline, and the theming spec promises that pairing under the text.
- `CharacterPicker.svelte` draws each card as an `<a>` styled like a mini header, with the same accent pair.
- The theme toggle is `background: transparent; color: inherit`, so it currently relies on the solid accent behind it.
- `static/` holds YAML and fonts only. There is no image in the repo and no image tooling in `package.json`.
- Tests run in jsdom (Vitest + Testing Library). jsdom does not load images or compute layout, but it does dispatch a synthetic `error` event on an `<img>`.
- Decision 0005: the page requests nothing from another host.

## Goals / Non-Goals

**Goals:**
- One pure resolver decides what counts as an avatar, shared by the header and the card.
- The art never changes the text's contrast: the name and descriptor stay on solid accent.
- No image element on the page unless the avatar resolved and loaded.
- One image file for both modes, with no palette knowledge in the image code.

**Non-Goals:**
- Responsive image sets, lazy-loading strategy beyond the browser default, or image optimisation.
- Theming the image (tints, duotone) per palette.
- A reusable portrait pipeline (#97).

## Test Seams

- **Primary test seam:** component tests through Testing Library: `AppHeader.test.ts` and `CharacterPicker.test.ts` assert the `<img>` element's presence, `src`, empty `alt`, and its removal after a dispatched `error` event.
- **Existing seams reused:** `yaml.test.ts` for the provider's `avatar` type check and summary copy; `characters.smoke.test.ts` proves `sunny.yaml` with its `avatar` line still loads; a new `avatar.test.ts` for the pure resolver, in the style of `resolve.test.ts`. The legibility scenarios are a recorded browser check (D5), not a test.

## Scrutiny Tier & Blast Radius

- **Tier:** medium
- **Blast radius:** the character identity contract (`types.ts`, `provider.ts`, `yaml.ts`), two rendering components and their caller `CharacterView.svelte`, one shipped data file, and a new static asset. The `src` attribute is a trust boundary: the resolver is the only place a value becomes a URL.

## Decisions

1. **One pure resolver, `resolveAvatar(value: unknown): string | undefined`, in `src/lib/avatar.ts`.** It returns the value only when it is a string that starts with `/` and survives a browser-style parse: `new URL(value, base)` for a fixed private `base` such as `https://hero-slate.invalid` must give that base's origin and a `pathname` equal to the value. Anything else is `undefined`. The parse step matters: browsers read `/\host/x` as `//host/x` and strip a newline or tab inside a URL, so a `startsWith` check alone lets `/\example.test/x.png` reach another host. Alternatives: let each component check inline (two copies of a security rule), or reject in the provider (a typo in a polish field would take the whole sheet down, against D1/D2). The resolver mirrors `resolvePalette`: the boundary type-checks, the layer that owns meaning interprets.

2. **One `AvatarArt.svelte` component renders the image for both the header and the card.** Props: `{ avatar: unknown, showing?: boolean }`, with `showing` bindable. It calls `resolveAvatar`, renders nothing when that is `undefined`, otherwise renders `<img src alt="" decoding="async">` and removes the element from the DOM when the `error` event fires (a `$state` flag). `showing` is true exactly while the `<img>` is in the DOM, so the parent can reserve width (decision 4). Alternative: duplicate the markup and CSS in both components; rejected because the fade, the failure handling and the alt rule must stay identical.

3. **The fade is a CSS mask, not a colour overlay.** `mask-image: linear-gradient(to right, transparent, black 45%)` (with the `-webkit-` prefix for iPad Safari) lets the accent background show through the image's left edge. Alternative: a gradient overlay from `var(--accent)` to transparent; it works, but a mask needs no colour knowledge, so one image serves both modes (D9) and the component never reads the palette.

4. **The text reserves the image's whole width, only while an avatar shows.** Both containers — the `<header>` and the card's `<a>` — get `position: relative; overflow: hidden`, so the image clips to their rounded corners. The image is `position: absolute; inset: 0 0 0 auto; height: 100%; width: var(--avatar-width); object-fit: cover; object-position: center top`. `AvatarArt` tells its parent whether it is showing (a bindable `showing` prop, true after resolve, false after `error`); the parent sets `data-avatar` from it, and `[data-avatar] .text { padding-right: var(--avatar-width) }` keeps every line of text clear of the image, fade zone included. Without `data-avatar` there is no padding, so a header or card with no avatar, or with a failed one, lays out exactly as today. The header sets `--avatar-width: min(40%, 14rem)`; the card sets `--avatar-width: min(40%, 8rem)`. Both wrap their text in one element, `.text`, so the rule is the same in each. Alternative: pad by the opaque part of the mask only; rejected because the fade zone still shows art under the text. Alternative: pad statically; rejected because it leaves dead space on every header without art.

5. **The toggle always sits on an opaque accent backing.** `AppHeader` wraps `ThemeToggle` in a span with `position: relative` (above the image), `border-radius: var(--radius-s)` to match the toggle's own corners, and `background: var(--accent)`. On a header with no art the backing is accent on accent, so it is invisible and nothing shifts; over art the icon keeps the accent/on-accent pairing the theming spec promises. Alternative: a translucent `color-mix` disc; rejected because dark art bleeding through can push the icon below 4.5:1, and the pairing would no longer be the one the contrast tests check.

6. **`avatar` joins the identity contract end to end.** `Character` and `CharacterSummary` gain `avatar?: string`; `checkIdentity` adds the string check with the message `avatar must be a string`; `toSummary` copies it. Same pattern as `color`, so the hosted-database swap later touches one layer.

7. **Sample art is an original placeholder rasterised to `static/characters/sunny.png` at 512×512.** First try the `design-assets:ai-image-generator` skill, which needs an API key on this machine; if none is configured, author a simple SVG portrait by hand and rasterise it with `uv run --with cairosvg`. Either way the PNG is committed and the SVG source, if any, lives in `.workspace/` only. Alternative: ship an SVG as the avatar; rejected because D10 fixed PNG and because a raster is what #97 will produce.

8. **`CharacterView` passes the raw `avatar` to `AppHeader`, which passes it to `AvatarArt`.** `AppHeader` gains an optional `avatar?: unknown` prop; the home header passes none. The picker passes `summary.avatar` per card. No resolution happens in the containers, so the rule has one home.

An ADR candidate: avatars are site assets resolved in the view, never remote URLs. It extends decisions 0002 and 0005 to images. It is cheap to state now and costly to walk back once authors write `avatar` lines. The ADR step decides.

## Risks / Trade-offs

- [`mask-image` unsupported on an old browser] → The image then shows unfaded with a hard edge; text stays on solid accent because of the reserved width, so legibility holds. Safari has supported the prefixed form for years; the target device is an iPad.
- [A failed image load drops the reserved width] → The text reflows once, at failure, on a sheet whose author pointed at a missing file. Accepted: it is rare, it is an author error, and the result matches a header with no avatar.
- [A long name on a 360 px screen] → The text gets about 60% of the header beside the image and the toggle, so a long name wraps to more lines than today. The browser check covers it; `--avatar-width` is one variable to tune.
- [A tall portrait crops badly with `object-fit: cover`] → `object-position: center top` keeps a face in frame for the usual bust composition; #97 fixes the composition at generation time.
- [Image load delays shift layout] → The image is absolutely positioned, so a late or failed load changes nothing in flow.
- [jsdom cannot see the fade or the reserved width] → The browser check is a recorded step in the tasks, as the picker's tap-target check was.
- [A large PNG slows the sheet] → 512 px, optimised; well under the fonts the page already ships.

## Migration & Rollback

N/A. `avatar` is optional; existing files load unchanged. Rolling back removes the field from `sunny.yaml`, which older code ignores.
