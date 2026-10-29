## Why

The sheet header and the picker card identify a character by text alone. A portrait is the one visual that says "this is *my* hero" at a glance, and no field carries one yet (issue #35). The header and the card both exist now, so the field can land end to end in one change.

## What Changes

- Add an optional `avatar` identity field to the character definition. The provider type-checks it as a string and carries it through unresolved; a wrong type makes the definition `invalid` (D1). The character summary copies it, so the picker gets it without a second load (D1).
- The rendering layer treats only a site path — a string starting with `/` and not `//` — as an image to show. Anything else renders as no avatar, so no request ever leaves the site (D2, D3).
- The sheet header shows the image filling its right side and fading into the accent before it reaches the name and descriptor, which stay on the contrast-checked accent/on-accent pair. The theme toggle sits over the image's edge on a translucent accent backing (D4).
- The picker card does the same at card size (D6).
- The image is decorative, `alt=""` (D7). A missing, failing or non-site-path avatar renders the header and card exactly as today (D8). One image serves both modes (D9).
- Sample art: `static/characters/sunny.png`, an original placeholder of about 512 px, referenced from `sunny.yaml` as `avatar: /characters/sunny.png` (D10).
- The term *Avatar* — the image that stands for a character wherever the character is named as a whole — is defined inline in the specs it touches (D12).

Out of scope, as the packet says: emoji avatars, uploads, cropping, remote URLs, and the D&D Beyond ingest skill (D11). A repeatable way to make portraits is #97.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `character-data`: "Definition validation" and "Character schema shape" gain `avatar` as an optional string identity field; "Character summary shape" carries it.
- `character-sheet`: "Identity header rendering" gains the avatar image, its site-path rule, its fade and legibility arrangement, its decorative alt, and the unchanged rendering when it is absent or fails.
- `home-picker`: "Home lists characters as cards" gains the same image at card size, with the same rules.

`theming` is read for context. Its "Character color applies to the sheet header" requirement still holds: the name and descriptor stay on the accent pair (D13).

## Impact

- Code: `src/lib/types.ts`, `src/lib/data/provider.ts`, `src/lib/data/yaml.ts` (`checkIdentity`, `toSummary`); `src/lib/AppHeader.svelte` and `src/lib/CharacterView.svelte` (the header gets the avatar); `src/lib/CharacterPicker.svelte` (the card); the site-path check, which both renderers share.
- Tests: the provider, header, picker and smoke tests gain avatar cases; a browser check covers legibility in both modes (D5).
- Data: `static/characters/sunny.yaml` gains `avatar`; `static/characters/sunny.png` is new. The character `Character` type stays JSON-clean; no API or dependency changes.
