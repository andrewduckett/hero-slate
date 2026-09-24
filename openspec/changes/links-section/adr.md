# ADR Review Manifest

- Status: completed
- Review date: 2026-09-24

## Review Summary

ADR review completed for this change. The change introduces no major durable architectural decisions, so it creates no new repository-level ADR files.

The candidate decision was that links to other sites live in one `https:`-only block, and rich text never gets link syntax. The team judged it too small for an ADR. The resolver and its tests make the rule clear from the code, and `design.md` records the alternatives.

## In-Force ADRs Reviewed

- `docs/decisions/0001-static-first-sveltekit-on-cloudflare-workers.md` — the links block is client-side rendering only and adds no server code.
- `docs/decisions/0002-character-data-behind-a-provider-interface.md` — `links` passes through the provider unresolved, and the links resolver owns its meaning.
- `docs/decisions/0003-per-device-state-behind-a-key-value-store-interface.md` — links are definition data and store no per-device state.
- `docs/decisions/0004-rich-text-rendered-as-token-tree-not-html-string.md` — labels are plain text and never pass through the rich-text renderer or raw HTML.
- `docs/decisions/0005-self-hosted-fonts-no-third-party-requests.md` — the block fetches no favicons or other third-party assets.
- `docs/decisions/0006-palette-tokens-separate-fills-from-marks.md` — chips use the `tint` fill with `deep` text.
- `docs/decisions/0007-colour-marks-meaning-not-identity.md` — a link without a colour uses the character's palette, and an author can set a colour per link.
- `docs/decisions/0008-theme-mode-an-explicit-choice-over-the-device-preference.md` — chips reuse palette tokens, so they follow the chosen mode.
- `docs/decisions/0009-ingest-tools-compute-facts-the-agent-writes-the-sheet.md` — not affected; the ingest skill offering links is a later story.
- `docs/decisions/0010-recorded-fixtures-carry-no-personal-data.md` — not affected; this change adds no recorded fixtures.

## New Durable ADRs Created

- None - no major durable architectural decisions were introduced.
