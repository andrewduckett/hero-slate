# ADR Review Manifest

- Status: completed
- Review date: 2026-10-15

## Review Summary

ADR review completed for this change. The design follows ADR 0006: counter text uses `--deep`, on `--tint` and on `--raised`, which are both contrast-tested pairs. It also follows ADR 0007: each pool keeps its authored colour. Pool counts stay under the `pools` key, as ADR 0003 describes.

## In-Force ADRs Reviewed

- [0001 Static-first SvelteKit on Cloudflare Workers](../../../docs/decisions/0001-static-first-sveltekit-on-cloudflare-workers.md)
- [0002 Character data behind a provider interface](../../../docs/decisions/0002-character-data-behind-a-provider-interface.md)
- [0003 Per-device state behind a key-value store interface](../../../docs/decisions/0003-per-device-state-behind-a-key-value-store-interface.md)
- [0004 Rich text rendered as a token tree, not an HTML string](../../../docs/decisions/0004-rich-text-rendered-as-token-tree-not-html-string.md)
- [0005 Self-hosted fonts, no third-party requests](../../../docs/decisions/0005-self-hosted-fonts-no-third-party-requests.md)
- [0006 Palette tokens separate fills from marks](../../../docs/decisions/0006-palette-tokens-separate-fills-from-marks.md)
- [0007 Colour marks meaning, not identity](../../../docs/decisions/0007-colour-marks-meaning-not-identity.md)
- [0008 Theme mode: an explicit choice over the device preference](../../../docs/decisions/0008-theme-mode-an-explicit-choice-over-the-device-preference.md)
- [0009 Ingest tools compute facts; the agent writes the sheet](../../../docs/decisions/0009-ingest-tools-compute-facts-the-agent-writes-the-sheet.md)
- [0010 Recorded fixtures carry no personal data](../../../docs/decisions/0010-recorded-fixtures-carry-no-personal-data.md)

## New Durable ADRs Created

- None. No decision in design.md is costly to reverse. The 12-use break point and the 100-use limit are constants in `pools.ts`. Keeping the counter inside the pools block, rather than sharing it with hit points, is a local choice that a later change can undo without touching data or contracts.
