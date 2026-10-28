## Story

#31 home-picker — `/` lists characters as tappable cards
<https://github.com/andrewduckett/hero-slate/issues/31>

## Decisions

| # | Question | Answer | Source |
|---|---|---|---|
| D1 | What does the manifest hold? | An ordered list of ids only. `listCharacters()` returns summaries (`id`, `name`, optional `level`, `class`, `color`) that the YAML provider assembles by loading each listed file. One source of truth; a future database returns the same summaries in one query. | User |
| D2 | Where does the manifest live? | `static/characters/manifest.yaml`, next to the files it lists. The shipped-characters smoke test skips it, and `manifest` is a reserved id. | User |
| D3 | What text does a card show? | The name, and the same level/class descriptor line the sheet header uses. | User |
| D4 | A listed id whose file is missing or invalid, or that fails the id grammar? | Skipped. The picker shows only characters that load. | User; Evidence: `openspec/specs/character-data/spec.md` (id grammar) |
| D5 | In what order do cards appear? | The manifest's order. | Evidence: `openspec/prd.md` §7 |
| D6 | Does the sheet get a way back to `/`? | No. Tap goes to `/:id`; the browser's back button covers the return this story. | Assumption |
| D7 | What shows when the manifest cannot be fetched or parsed, or lists nothing that loads? | A fetch or parse failure shows "Could not load characters. Try again." An empty manifest, or one whose entries all skip, shows "No characters yet." | Assumption (mirrors the sheet's messages) |
| D8 | What does the home header say, and how wide is the page? | Title "Hero Slate", subtitle "Choose your hero". Home keeps its 44rem width. | Assumption; Evidence: `openspec/specs/character-sheet/spec.md` (wide sheet content width) |
| D9 | How does a card carry the character's color? | The card uses the resolved palette, so an unknown color falls back to neutral. Fill versus tint is a design decision. | Evidence: `openspec/specs/theming/spec.md` (color name resolution) |

## Changes from the story

- **Cut:** `avatar` leaves the manifest and the card. No `avatar` field exists yet; #35 owns it and already depends on #31.
- **Cut:** the manifest's `name` and `color` fields. Each character's YAML already holds them, so the manifest lists ids only (D1).

Confirmed by user: yes
