**Why:** The installed full-screen app has no browser back button, so since pwa-install (#106) a player who opens a sheet from the home screen cannot get back to the character picker.

## Story

#110 back-to-picker — a player can get back to the character picker from any sheet
https://github.com/andrewduckett/hero-slate/issues/110

## Decisions

| # | Question | Answer | Source |
|---|---|---|---|
| D1 | Where do the controls sit? | In a bar above the identity header, on the page surface, taking the place of the page's top margin: "← All heroes" at the start, the theme toggle at the end. Nothing sits on the avatar | User, from browser mock-ups |
| D2 | Why not inside the header, as the story says? | Anything in the header's corner covers the avatar's face, and a second button there squeezes the name. The bar keeps the art clear and gives the name its width back: on Urven the Stats heading moves up from 285 to 221 CSS pixels; on Sunny it moves about 9 pixels lower | Evidence: browser measurements at 360 CSS pixels |
| D3 | A hamburger menu instead? | No: it takes two taps instead of one, hides the way out, and needs a menu with focus handling for only two items | User |
| D4 | What does the control show? | The text "← All heroes", with a border, so a child reads it as a button. The theme toggle in the bar has no border, so the rarely used control stays quiet | User |
| D5 | What is its accessible name? | "All heroes" | User |
| D6 | What does it do? | A plain link to `/`, not `history.back()` | Evidence: issue #110 scope |
| D7 | How does the picker keep the link off `/`? | The shared header shows the link in its bar only when its caller asks; the sheet asks and the picker does not, so the picker's bar holds only the toggle | Assumption |
| D8 | What is the way back on the error and not-found messages? | A text link to `/`, "Choose your hero", under the message, with a tap target of at least 44 by 44 CSS pixels | User |
| D9 | Does the loading message get a way back? | No: loading ends in found, error or not-found, and each of those has one | Assumption |
| D10 | How are layout, legibility and tap size checked? | A reviewer checks the bar at 360 and 1280 CSS pixels, in light and dark mode, on a sheet with an avatar, and once in the installed app; tests cover the link, its name, its place before the header, and its order before the toggle | Assumption |
| D11 | Which spec changes? | `character-sheet` gains the way back, the bar above the header, and the message links, and loses "Theme toggle stays legible over the avatar", because the toggle no longer sits on the art; `home-screen-install` and `theming` stay as they are | Evidence: `openspec/specs/character-sheet/spec.md`, `openspec/specs/theming/spec.md`, `openspec/specs/home-screen-install/spec.md` |
| D12 | Which other placements were rejected? | Buttons inside the card under the subtitle (no room for a label at 360 pixels); beside the name (crushes the name to three letters a line); split corners, or one dark glass pill over the art (covers the art, and the glass ignores the accent/on-accent pairing); a left rail (costs the name about 50 pixels of width) | User, from browser mock-ups |

## Changes from the story

- Placement: the way back sits in a bar above the header instead of beside the theme toggle in it, so nothing covers the avatar and the name keeps its width (D1, D2).
- The theme toggle moves into the same bar, out of the header. This replaces the requirement that kept the toggle on an opaque backing over the art.

Confirmed by user: yes
