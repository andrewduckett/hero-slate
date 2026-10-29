**Why:** The installed full-screen app has no browser back button, so since pwa-install (#106) a player who opens a sheet from the home screen cannot get back to the character picker.

## Story

#110 back-to-picker — a player can get back to the character picker from any sheet
https://github.com/andrewduckett/hero-slate/issues/110

## Decisions

| # | Question | Answer | Source |
|---|---|---|---|
| D1 | Where does the control sit in the sheet header? | Stacked under the theme toggle, in the toggle's opaque accent backing; the toggle stays on top where it is now | User |
| D2 | Why not side by side, as the story says? | At 360px with an avatar the name column is already about 90px wide; a second button in the row would leave about 40px | Evidence: `src/lib/AppHeader.svelte` layout, `src/lib/AvatarArt.svelte` `--avatar-width` |
| D3 | A hamburger menu instead? | No: it takes two taps instead of one, hides the way out, and needs a menu with focus handling for only two items | User |
| D4 | What does the control show? | A house glyph ⌂, icon only, with the same size and border as the toggle | User |
| D5 | What is its accessible name? | "All heroes" | User |
| D6 | What does it do? | A plain link to `/`, not `history.back()` | Evidence: issue #110 scope |
| D7 | How does the picker keep it off `/`? | The shared header shows it only when its caller asks; the sheet asks and the picker does not | Assumption |
| D8 | What is the way back on the error and not-found messages? | A text link to `/`, "Choose your hero", under the message, with a tap target of at least 44 by 44 CSS pixels | User |
| D9 | Does the loading message get a way back? | No: loading ends in found, error or not-found, and each of those has one | Assumption |
| D10 | How are legibility and tap size checked? | A reviewer checks the header control over an avatar, in light and dark mode, at 360px, and once in the installed app; tests cover the link, its name and its target | Assumption |
| D11 | Which spec changes? | `character-sheet` gains one requirement for the way back; `home-screen-install` stays as is | Evidence: `openspec/specs/character-sheet/spec.md`, `openspec/specs/home-screen-install/spec.md` |

## Changes from the story

- Placement: the control stacks under the theme toggle instead of sitting beside it, so the name keeps its width on a phone (D1, D2).

Confirmed by user: yes
