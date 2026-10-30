**Why:** The installed full-screen app has no browser back button, so since pwa-install (#106) a player who opens a sheet from the home screen cannot get back to the character picker.

## Story

#110 back-to-picker — a player can get back to the character picker from any sheet
https://github.com/andrewduckett/hero-slate/issues/110

## Decisions

| # | Question | Answer | Source |
|---|---|---|---|
| D1 | Where does the way back sit? | The identity header card itself is the link, with a small caption "‹ All heroes" above the name on the solid accent. No bar, no button in the corner, nothing over the avatar | User, from browser mock-ups |
| D2 | Why not a button in the header or a bar above it, as the story says? | A button in the corner covers the avatar's face, and a bar above the card pushes the sheet down 36 CSS pixels. The caption costs 17 pixels at 360 wide and about 20 on a 768 tablet, where the card is one row | Evidence: browser measurements on Sunny at 360 and 768 CSS pixels |
| D3 | A hamburger menu instead? | No: it takes two taps instead of one, hides the way out, and needs a menu with focus handling for only two items | User |
| D4 | What does the control show? | The caption "‹ All heroes", small and uppercase, in the on-accent colour. The tap target is the whole card | User |
| D5 | What is its accessible name? | "All heroes" | User |
| D6 | What does it do? | A plain link to `/`, not `history.back()` | Evidence: issue #110 scope |
| D7 | How does the picker keep the link off `/`? | The shared header renders as a link only when its caller asks; the sheet asks and the picker does not | Assumption |
| D8 | What is the way back on the error and not-found messages? | A text link to `/`, "Choose your hero", under the message, with a tap target of at least 44 by 44 CSS pixels | User |
| D9 | Does the loading message get a way back? | No: loading ends in found, error or not-found, and each of those has one | Assumption |
| D10 | How are layout and legibility checked? | A reviewer checks a sheet with an avatar at 360 and 768 CSS pixels, in light and dark mode, and once in the installed app; tests cover the link, its name, the caption's place before the name, and the toggle's presence on the home page only | Assumption |
| D11 | Which specs change? | `character-sheet` gains the header link and the message links, and loses "Theme toggle stays legible over the avatar"; `theming` moves "Manual mode toggle" to the home page; `home-screen-install` stays as it is | Evidence: `openspec/specs/character-sheet/spec.md`, `openspec/specs/theming/spec.md` |
| D12 | Which other placements were rejected? | Buttons in the header's corner (cover the avatar); a bar above the card, bordered or as plain text (pushes the sheet down and adds chrome above the card); a tab growing out of the card (still a bar); a fixed bar at the bottom (reserves 60 pixels of every screen); a strip of hero avatars (replaces the picker); the name as a menu (two taps) | User, from browser mock-ups |
| D13 | Where does the theme toggle go? | To the home page's header only, in the corner where it has always been. Light or dark is one choice for the whole app, so one place to set it is enough, and the sheet keeps no control that could sit over the art | User |

## Changes from the story

- Placement: the way back is the header card itself, with a caption, instead of a button beside the theme toggle, so nothing covers the avatar and the sheet barely moves (D1, D2).
- The theme toggle leaves the sheet and lives on the home page only (D13). This replaces the requirement that kept the toggle on an opaque backing over the art, and narrows the theming rule that put the toggle on every route.

Confirmed by user: yes
