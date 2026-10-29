## Story

#35 avatar-images — a character's portrait fades across the sheet header and its picker card
https://github.com/andrewduckett/hero-slate/issues/35

## Decisions

| # | Question | Answer | Source |
|---|---|---|---|
| D1 | What does the provider do with `avatar`? | Optional identity field. A string passes through unresolved; any other type makes the definition `invalid`, like `color`. `toSummary` copies it to the summary. | Evidence: issue #35 packet; `src/lib/data/yaml.ts` `checkIdentity`, `toSummary` |
| D2 | Which values render, and who decides? | The rendering layer shows an image only for a site path: a string starting with `/` that a browser keeps on the site's own origin (so not `//`, `/\` or embedded whitespace, which browsers rewrite into another host). Anything else (remote URL, scheme, empty, relative) renders as no avatar. The provider never rejects a string. | User; the parse rule added after plan review round 1 |
| D3 | Why refuse remote URLs at all? | The page makes no request to another host; a remote `src` would be one. | Evidence: `docs/decisions/0005-self-hosted-fonts-no-third-party-requests.md` |
| D4 | Where does the image sit in the header, and what is "legible on top"? | Image fills the right side and fades to transparent before it reaches the name and descriptor, which stay on the solid accent/on-accent pair, outside the image. The theme toggle sits over the image's edge with a small opaque accent backing so its icon keeps the contrast-checked pairing on any art. | User; backing made opaque after plan review round 1 |
| D5 | How is legibility accepted? | A reviewer confirms it in a browser in both modes, as the home-picker spec does for tap targets; jsdom cannot compute layout. | Evidence: `openspec/specs/home-picker/spec.md` "Cards are large enough to tap" |
| D6 | Does the card do the same? | Yes, at card size: image on the right fading into the accent; name and descriptor on solid accent. The card has no toggle. | Evidence: issue #35 packet |
| D7 | Is the image decorative or named? | Decorative, `alt=""`. The name is already text beside it; the card link's accessible name stays the character's name. | User |
| D8 | What happens when the image is absent, fails to load, or the value is not a site path? | The header and card render exactly as today: no image element on the page, no layout change. A load failure removes the image. | Evidence: issue #35 packet |
| D9 | One image for both modes? | Yes. The fade blends into whichever accent is active, so one file serves light and dark. | Assumption |
| D10 | Where does sample art live, and in what form? | `static/characters/sunny.png`, an original placeholder portrait of about 512 px square that this change generates once by hand. Referenced as `avatar: /characters/sunny.png`. | User |
| D11 | Does the D&D Beyond skill learn about `avatar`? | No. Its source blanks avatar URLs (decision 0010) and the packet rules it out. A separate skill makes art: #97. | Evidence: issue #35 packet; `docs/decisions/0010-recorded-fixtures-carry-no-personal-data.md` |
| D12 | Where is the term *Avatar* defined? | Inline in the affected specs, as `character-data` defines its terms. The project has no `openspec/glossary.md` and the issue carries no glossary handoff, so none is created. | Evidence: issue #35 `**Term**` line; `openspec/specs/character-data/spec.md` Purpose |
| D13 | Which specs change? | `character-data` (field validation, summary shape), `character-sheet` (header), `home-picker` (card). `theming` is context only: the accent pair it promises still holds under the text. | Evidence: the three specs' requirements |

## Changes from the story

- Split out: a repeatable way to make portraits. Filed as #97 `portrait-skill`, a standalone Could/S story that relates to #35 and is not blocked by it. Reason: a generation skill (prompting, style, size, licence) is its own piece of work; this story only needs one sample file to show the rendering.
- Added: the site-path rule (D2). The packet type-checked a string and said remote URLs were out of scope, but named no layer that enforces it.
- Added: the toggle's backing (D4). The packet asked for a legible toggle without saying how it stays legible over art.

Confirmed by user: yes
