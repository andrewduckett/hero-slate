## Context

- Identity fields flow from YAML through `checkIdentity` and `toSummary` in `src/lib/data/yaml.ts` to `Character` (`src/lib/types.ts`) and `CharacterSummary` (`src/lib/data/provider.ts`). `color` is the model: the provider type-checks a string and `resolvePalette` in the theming layer interprets it.
- `AppHeader.svelte` is one flex row: `.header-text` (name, descriptor) and `ThemeToggle`. It paints `var(--accent)` and `var(--on-accent)` inline, and the theming spec promises that pairing under the text.
- `CharacterPicker.svelte` draws each card as an `<a>` styled like a mini header, with the same accent pair.
- The theme toggle is `background: transparent; color: inherit`, so it currently relies on the solid accent behind it.
- `static/` holds YAML and fonts only. There is no image in the repo and no image tooling in `package.json`.
- Tests run in jsdom (Vitest + Testing Library). jsdom does not load images or compute layout, but it does dispatch a synthetic `error` event on an `<img>`.
- Decision 0005: the page requests nothing from another host.
- The provider already builds `/characters/<id>.yaml` from an id that passed `ID_GRAMMAR`. Change request on PR #98: the avatar is named after the character, with no authored field (D14–D17).

## Goals / Non-Goals

**Goals:**
- The image is named after the character, so authors supply no image input at all.
- The art never changes the text's contrast: the name and descriptor stay on solid accent.
- No image element on the page unless the avatar image loaded.
- One image file for both modes, with no palette knowledge in the image code.

**Non-Goals:**
- Responsive image sets, lazy-loading strategy beyond the browser default, or image optimisation.
- Theming the image (tints, duotone) per palette.
- A reusable portrait pipeline (#97).

## Test Seams

- **Primary test seam:** component tests through Testing Library: `AppHeader.test.ts` and `CharacterPicker.test.ts` assert the `<img>` element's presence, `src`, empty `alt`, and its removal after a dispatched `error` event.
- **Existing seams reused:** `yaml.test.ts` for the stamped `avatar` and the summary copy; `characters.smoke.test.ts` checks that every shipped image is named after a shipped character. The legibility scenarios are a recorded browser check (D5), not a test.

## Scrutiny Tier & Blast Radius

- **Tier:** medium
- **Blast radius:** the character identity contract (`types.ts`, `provider.ts`, `yaml.ts`), two rendering components and their caller `CharacterView.svelte`, and a new static asset. The `src` attribute is a trust boundary, and only the provider writes it, from a grammar-checked id.

## Decisions

1. **The provider stamps the avatar URL from the id.** `toFoundOrInvalid` sets ``avatar: `/characters/${id}.png` `` on every `found` character, after the authored body is spread, so an authored `avatar` key is overwritten whatever its value. The id has already passed `ID_GRAMMAR`, so the URL is always a same-origin path and needs no resolver (D17). The provider does not check that the file exists (D16). Alternative: build the path in the view from `id`; rejected because only the provider knows where character files live, and a hosted provider will serve images from elsewhere (D15). Alternative: keep an authored `avatar` field with a site-path resolver; rejected by the user's change request, since it is input the sheet does not need (D14).

2. **One `AvatarArt.svelte` component renders the image for both the header and the card.** Props: `{ src?: string, showing?: boolean }`, with `showing` bindable. It renders nothing when `src` is `undefined`, otherwise renders `<img src alt="" decoding="async">` and removes the element from the DOM when the `error` event fires (a `$state` flag). `showing` is true exactly while the `<img>` is in the DOM, so the parent can reserve width (decision 4). Alternative: duplicate the markup and CSS in both components; rejected because the fade, the failure handling and the alt rule must stay identical.

3. **The fade is a CSS mask, not a colour overlay.** `mask-image: linear-gradient(to right, transparent, black 45%)` (with the `-webkit-` prefix for iPad Safari) lets the accent background show through the image's left edge. Alternative: a gradient overlay from `var(--accent)` to transparent; it works, but a mask needs no colour knowledge, so one image serves both modes (D9) and the component never reads the palette.

4. **The text reserves the image's whole width, only while an avatar shows.** Both containers — the `<header>` and the card's `<a>` — get `position: relative; overflow: hidden`, so the image clips to their rounded corners. The image is `position: absolute; inset: 0 0 0 auto; height: 100%; width: var(--avatar-width); object-fit: cover; object-position: center top`. `AvatarArt` tells its parent whether it is showing (a bindable `showing` prop, true while the image is in the DOM, false after `error`); the parent sets `data-avatar` from it, and `[data-avatar] .text { padding-right: var(--avatar-width) }` keeps every line of text clear of the image, fade zone included. Without `data-avatar` there is no padding, so a header or card with no avatar, or with a failed one, lays out exactly as today. The header sets `--avatar-width: min(40%, 14rem)`; the card sets `--avatar-width: min(40%, 8rem)`. Both wrap their text in one element, `.text`, so the rule is the same in each. Alternative: pad by the opaque part of the mask only; rejected because the fade zone still shows art under the text. Alternative: pad statically; rejected because it leaves dead space on every header without art.

5. **The toggle always sits on an opaque accent backing.** `AppHeader` wraps `ThemeToggle` in a span with `position: relative` (above the image), `border-radius: var(--radius-s)` to match the toggle's own corners, and `background: var(--accent)`. On a header with no art the backing is accent on accent, so it is invisible and nothing shifts; over art the icon keeps the accent/on-accent pairing the theming spec promises. Alternative: a translucent `color-mix` disc; rejected because dark art bleeding through can push the icon below 4.5:1, and the pairing would no longer be the one the contrast tests check.

6. **`avatar` joins the identity contract end to end.** `Character` and `CharacterSummary` gain `avatar?: string`. It is optional in the type because a later provider may have no image for a character; the YAML provider always sets it. `checkIdentity` does not look at `avatar`, and `toSummary` copies it. The hosted-database swap later touches one layer.

7. **Sample art is an original placeholder rasterised to `static/characters/sunny.png` at 512×512.** First try the `design-assets:ai-image-generator` skill, which needs an API key on this machine; if none is configured, author a simple SVG portrait by hand and rasterise it with `uv run --with cairosvg`. Either way the PNG is committed and the SVG source, if any, lives in `.workspace/` only. `sunny.yaml` needs no line: the file's name is the link (D14). Alternative: ship an SVG as the avatar; rejected because D10 fixed PNG and because a raster is what #97 will produce.

8. **`CharacterView` passes `character.avatar` to `AppHeader`, which passes it to `AvatarArt` as `src`.** `AppHeader` gains an optional `avatar?: string` prop; the home header passes none. The picker passes `summary.avatar` per card.

An ADR candidate: a character's avatar is the image named after its id, and the provider locates it. It extends decisions 0002 and 0005 to images. It is cheap to state now and costly to walk back once authors name files this way. The ADR step decides.

## Risks / Trade-offs

- [A character with no image file costs one failed request] → Accepted by the user (D16). The request stays on the site, and `AvatarArt` drops the image on `error`, so the header and card render as today.
- [The deployed SPA fallback answers a missing `.png` with the HTML shell at status 200] → The browser cannot decode HTML as an image, so it fires `error` and the image is dropped, the same as a 404.

- [`mask-image` unsupported on an old browser] → The image then shows unfaded with a hard edge; text stays on solid accent because of the reserved width, so legibility holds. Safari has supported the prefixed form for years; the target device is an iPad.
- [A failed image load drops the reserved width] → The text reflows once, at failure, on a sheet whose author pointed at a missing file. Accepted: it is rare, it is an author error, and the result matches a header with no avatar.
- [A long name on a 360 px screen] → The text gets about 60% of the header beside the image and the toggle, so a long name wraps to more lines than today. The browser check covers it; `--avatar-width` is one variable to tune.
- [A tall portrait crops badly with `object-fit: cover`] → `object-position: center top` keeps a face in frame for the usual bust composition; #97 fixes the composition at generation time.
- [Image load delays shift layout] → The image is absolutely positioned, so a late or failed load changes nothing in flow.
- [jsdom cannot see the fade or the reserved width] → The browser check is a recorded step in the tasks, as the picker's tap-target check was.
- [A large PNG slows the sheet] → 512 px, optimised; well under the fonts the page already ships.

## Migration & Rollback

N/A. No character file changes; existing files load unchanged, and a stray authored `avatar` key is ignored. Rolling back leaves `sunny.png` as an unused static file.
