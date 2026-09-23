# ADR Review Manifest

- Status: completed
- Review date: 2026-09-23

## Review Summary

ADR review completed for this change. I read every in-force ADR under `docs/decisions/` and built the supersession graph. No ADR is superseded, and the highest sequence number in use was 0008.

I re-read `design.md` and judged each decision against the ADR bar. One decision qualifies: D1, which splits the ingest so that tested tools compute facts and the agent writes the sheet. It is a system boundary. Reversing it would change every later ingest story, and nothing in the code explains why the split exists.

`design.md` records the other decisions, which are cheap to reverse:
- D2: the code layout under `src/lib/ingest/ddb/`
- D3: running the tools with `vite-node`
- D4: three commands, with the id coming from the draft's file name
- D5: the preview reusing the app's resolvers
- D6: the label alias table
- D7: the Armor Class allowlist

ADR 0002 (the character-data provider) and ADR 0007 (colour roles) bear on this change. Neither is contradicted:
- The ingest is an authoring tool, not a consumer of character data. The new ADR records why it writes the character file directly.
- The agent suggests colors only where authors already choose them: the character, pools, sections, and rows.

## In-Force ADRs Reviewed

- 0001. Static-first SvelteKit on Cloudflare Workers
- 0002. Character data behind a provider interface
- 0003. Per-device state behind a key-value store interface
- 0004. Rich-text rendered as a token tree, not an HTML string
- 0005. Self-hosted fonts, with no third-party requests from the sheet
- 0006. Palette tokens separate fills from marks
- 0007. Colour marks meaning, not identity
- 0008. Theme mode: an explicit choice layered over the device preference

## New Durable ADRs Created

- `docs/decisions/0009-ingest-tools-compute-facts-the-agent-writes-the-sheet.md` covers the split: tested tools compute the facts, the agent writes the sheet, and a preview checks the draft against the app's rules and the digest before anything is written. It relates to ADR 0002 and does not supersede it.
