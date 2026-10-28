## Why

A player who does not know a character's exact link has no way in: `/` is a placeholder header that tells them to type a path. With three characters shipped and more coming, the home page needs to show who is on the roster and open a sheet with one tap. Deep links already work, so this is the last piece of the "find my character" journey.

## What Changes

- A new character manifest, `static/characters/manifest.yaml`, lists character ids in display order (D1, D2, D5). Adding a character is one YAML file plus one manifest line.
- The data provider gains `listCharacters()`, which returns a summary (`id`, `name`, optional `level`, `class`, `color`) for each listed character that loads. An id that fails the grammar, or whose definition is missing or invalid, is skipped (D1, D4). Consumers depend on the interface, never on the manifest's path.
- `/` renders one large tappable card per summary. A card shows the name and the sheet's level/class descriptor, in the character's resolved palette color, and links to `/:id` (D3, D6, D9).
- `/` shows a fixed retry message when the manifest cannot be loaded, and a fixed empty message when nothing loads (D7). Its header stays "Hero Slate" with the subtitle "Choose your hero", and the page keeps its 44rem width (D8).
- The shipped-characters smoke test skips the manifest, and `manifest` becomes a reserved id (D2).
- Out of scope: avatars (#35), search or filtering, a per-card state preview, and a back link from the sheet to `/`.

## Capabilities

### New Capabilities

- `home-picker`: the home page at `/` lists the characters the manifest names as tappable cards, in manifest order, and handles the loading, empty and failure states.

### Modified Capabilities

- `character-data`: the data-provider interface gains `listCharacters()`, backed by a character manifest; the manifest format and the rule for skipping entries that do not load.
- `deployment`: the manifest ships as a public asset at `/characters/manifest.yaml`.

## Impact

- `src/lib/data/provider.ts`: `CharacterProvider` gains `listCharacters()` and a `CharacterSummary` type.
- `src/lib/data/yaml.ts`: the YAML provider fetches and parses the manifest, then loads each listed character through `getCharacter` to build summaries.
- `src/routes/+page.svelte`: replaces the placeholder with the picker; a new picker component under `src/lib/` renders the cards.
- `src/lib/format.ts`: the existing descriptor function is reused for card text.
- `static/characters/manifest.yaml`: new, listing `sunny`, `gimdak` and `urven`.
- `src/lib/data/characters.smoke.test.ts`: skips the manifest file.
- No new dependencies. No server code. The `Character` type and per-device state are unchanged.
