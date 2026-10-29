## Why

The sheet header and the picker card identify a character by text alone. A portrait is the one visual that says "this is *my* hero" at a glance, and no field carries one yet (issue #35). The header and the card both exist now, so the field can land end to end in one change.

## What Changes

- A character's avatar is the image named after it: `/characters/<id>.png`. Authors add art by dropping a file with the character's id into `static/characters/`; the definition carries no `avatar` field, and an authored one is ignored (D14).
- The provider builds the URL, as it already builds `/characters/<id>.yaml`, and stamps `avatar` on the character and its summary, so the picker gets it without a second load (D15). The id is already grammar-checked, so the URL never leaves the site and no resolver is needed (D17, D3).
- The sheet header shows the image filling its right side and fading into the accent before it reaches the name and descriptor, which stay on the contrast-checked accent/on-accent pair. The theme toggle sits over the image's edge on an opaque accent backing (D4).
- The picker card does the same at card size (D6).
- The image is decorative, `alt=""` (D7). A character with no image file, or an image that fails to load, renders the header and card exactly as today, at the cost of one failed request (D8, D16). One image serves both modes (D9).
- Sample art: `static/characters/sunny.png`, an original 512 px placeholder, found by its name alone (D14).
- The term *Avatar* — the image that stands for a character wherever the character is named as a whole — is defined inline in the specs it touches (D12).

Out of scope, as the packet says: emoji avatars, uploads, cropping, remote URLs, and the D&D Beyond ingest skill (D11). A repeatable way to make portraits is #97.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `character-data`: a new "Avatar location" requirement says the provider supplies `/characters/<id>.png`; "Character schema shape" and "Character summary shape" carry `avatar`.
- `character-sheet`: the header gains the avatar image, its fade and legibility arrangement, its decorative alt, and the unchanged rendering when the image fails to load.
- `home-picker`: "Home lists characters as cards" gains the same image at card size, with the same rules.

`theming` is read for context. Its "Character color applies to the sheet header" requirement still holds: the name and descriptor stay on the accent pair (D13).

## Impact

- Code: `src/lib/types.ts`, `src/lib/data/provider.ts`, `src/lib/data/yaml.ts` (the stamped URL, `toSummary`); `src/lib/AvatarArt.svelte`, which both renderers share; `src/lib/AppHeader.svelte` and `src/lib/CharacterView.svelte` (the header); `src/lib/CharacterPicker.svelte` (the card).
- Tests: the provider, header, picker and smoke tests gain avatar cases; a browser check covers legibility in both modes (D5).
- Data: `static/characters/sunny.png` is new; no character file changes. The character `Character` type stays JSON-clean; no API or dependency changes.
