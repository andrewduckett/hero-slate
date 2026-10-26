**Why:** The ingest skill already knows the character's D&D Beyond id, but the Author still has to type a `links` block by hand; now that sheets can show links (#43), the skill should offer the obvious ones.

## Story

#44 ingest-offers-links — the ingest interview offers the character's D&D Beyond sheet and the spell compendium as links. https://github.com/andrewduckett/hero-slate/issues/44

## Decisions

| # | Question | Answer | Source |
|---|---|---|---|
| D1 | Does the preview need to change to show links? | Yes: it draws no `links` today and lists the key under "Not previewed", so it must draw a Links block of the links the app would keep. | Evidence: `src/lib/ingest/ddb/preview.ts` |
| D2 | Should draft validation warn about links? | Yes: warn when the app would drop a `links` entry, and when a link's `color` is not a palette name, like every other block. | User |
| D3 | Where does the sheet URL come from? | The digest gains a `sheetUrl` field, `https://www.dndbeyond.com/characters/<id>`, built from the id `parseReference` already extracts. | User |
| D4 | When is the spell compendium link offered? | Only when the digest's `spellcasting` list is not empty, the same gate as the Magic section. | User |
| D5 | What do the offered links look like, and where in the flow? | Sheet first, label `📜 D&D Beyond`; then spells, label `✨ Spells`; no `color`; the Author confirms, renames or drops each; no `links` key when both are dropped; a new step after section colours and before drafting. | User |
| D6 | How does the preview draw a link? | One line per kept link: its label, its resolved palette name and its URL, under a `Links` heading after Sections. | Assumption |
| D7 | Can the Author ask for links the skill did not offer? | Yes: in the links step the Author may ask for any other link by URL and optional label; the skill adds it after the offered links, in the order asked, and validation and the preview cover it like any other link. | User |

## Changes from the story

- Added: the preview draws links (D1). The story assumed it already did.
- Added: draft validation warns about dropped links and unknown link colours (D2).
- Added: the digest reports `sheetUrl` (D3). The story's relevant code did not name the digest or CLI.
- Added: the Author may ask for other links during the interview (D7). The story had put links to other sites out of scope as hand-authored; asking in the interview is cheaper than editing the file afterwards.

Confirmed by user: yes
