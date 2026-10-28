## Story

#30 landscape-layout — the sheet uses a landscape tablet's width instead of one narrow column.
https://github.com/andrewduckett/hero-slate/issues/30

## Decisions

| # | Question | Answer | Source |
|---|---|---|---|
| D1 | How do the groups sit across a wide screen? | Two columns. The header spans the full width. The left column holds Stats, Health and Pools; the right column holds the sections, then Links. | User |
| D2 | Which screens get two columns? | Every viewport at least 1024 CSS pixels wide, whatever its orientation. Narrower viewports keep one column. | User |
| D3 | Do narrower layouts change? | No. Portrait tablet (800×1280), phones turned sideways (up to about 930 wide) and phones (360) look as they do today. | Evidence: issue #30 Scope |
| D4 | Does reading and focus order change? | No. The HTML order stays header, Stats, Health, Pools, sections, Links; the columns only place it. | Evidence: issue #30 Scope; spec "Sheet block order" |
| D5 | How many ability and combat tiles sit on a row? | A fixed count per layout, never `auto-fit`: abilities 3 per row in two columns, 6 at portrait tablet width, 3 at phone width; combat 3 per row everywhere. | Evidence: issue #30 Scope; prototype at 1280×800 |
| D6 | What does the "no lone tile on a row" promise cover? | The usual 6 abilities and 3 combat entries. Other counts wrap at the same fixed count and may leave a short last row. | User |
| D7 | What if the right column runs much longer than the left (Gimdak)? | Accept the empty space under the left column. Sections never move into the left column. | User, after the prototype |
| D8 | What if one column has nothing to show? | The other column spans the full width. | User |
| D9 | How wide can the content get on wide screens? | Wider than today's 44rem cap. The prototype used 80rem, which fills 1280 with the existing 16px gutters; design sets the final value. | Assumption |
| D10 | Does the home picker (`/`) change? | No. It keeps its current 44rem layout; its own layout is #31. | Evidence: issue #30 Scope |
| D11 | Which specs change? | "Sheet block order" describes order in a multi-column layout, not "top to bottom". Add reviewer scenarios at 1280×800 for `/sunny`, `/urven` and `/gimdak`. "Sheet fits a phone screen" describes fixed tile counts, not wrapping. | Evidence: issue #30 Scope |
| D12 | What does a reviewer check at 1280×800? | No sideways scroll; groups in two columns as in D1; abilities 3×2 and combat 3 in a row; every tracker control still at least 44×44 CSS pixels. At 800×1280 and 360 wide, the sheet matches today's layout. Checks run in a browser because jsdom computes no layout. | Evidence: issue #30 Scope; spec "Sheet fits a phone screen" |
| D13 | Does the story need splitting? | No. It fits in one change. | Assumption |

## Changes from the story

- Added: the two-column threshold is a width of 1024 CSS pixels (D2). This covers desktops and smaller landscape tablets, not only the 1280×800 tablet.
- Added: when one column is empty, the other spans the full width (D8).
- Narrowed: "a lone tile never sits on a row by itself" holds for the usual 6 abilities and 3 combat entries only (D6).
- Added: sections stay in the right column even when it runs much longer than the left (D7).

Confirmed by user: yes
