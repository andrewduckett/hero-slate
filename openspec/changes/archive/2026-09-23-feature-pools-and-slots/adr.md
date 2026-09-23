# ADR Review Manifest

- Status: completed
- Review date: 2026-09-23

## Review Summary

ADR review completed for this change. The author read every in-force ADR under `docs/decisions/` and built the supersession graph. No ADR names another in its Supersedes field, and the highest sequence number in use is 0009.

The author then judged each decision in `design.md` against the ADR bar. None qualifies. Each decision is local to one ingest module, is cheap to reverse, or applies a principle an existing ADR already records:
- D1 and D2: the two new modules, and an unknown maximum for one misshapen rule
- D3 and D5: the limited-use formula and the reset words
- D4: skipping item sources
- D6 to D8: reading D&D Beyond's per-class slot tables, unknown multiclass slots, and a fail-safe Pact Magic lookup
- D9 to D11: the preview, validation, and cross-check reusing the app's pool resolver
- D12: pool ids proposed from labels
- D13: treating digest text as data

Three in-force ADRs bear on this change. The change follows each of them:
- **ADR 0009** (the ingest tools compute facts, and the agent writes the sheet): the digest computes every pool maximum. It reports a value as unknown instead of guessing, as for multiclass slots and unreadable Pact Magic.
- **ADR 0003** (per-device state behind a key-value store): the digest ignores D&D Beyond's used-count fields. Pool counts stay per-device state, outside the character definition.
- **ADR 0007** (colour marks meaning, not identity): pools keep their authored colours. The skill suggests a colour for each pool, and the Author confirms it.

## In-Force ADRs Reviewed

- 0001. Static-first SvelteKit on Cloudflare Workers
- 0002. Character data behind a provider interface
- 0003. Per-device state behind a key-value store interface
- 0004. Rich-text rendered as a token tree, not an HTML string
- 0005. Self-hosted fonts, with no third-party requests from the sheet
- 0006. Palette tokens separate fills from marks
- 0007. Colour marks meaning, not identity
- 0008. Theme mode: an explicit choice layered over the device preference
- 0009. Ingest tools compute facts; the agent writes the sheet

## New Durable ADRs Created

- None. This change introduced no major durable architectural decisions and created no new repository-level ADR files.
