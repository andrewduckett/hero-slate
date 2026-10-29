# ADR Review Manifest

- Status: completed
- Review date: 2026-10-28

## Review Summary

ADR review completed for this change. No design decision passes the test. Each one is cheap to reverse, or is already covered by a record in force.

- D1 (`sharp`): a dev dependency that only one Author tool imports. Swapping it touches one module and its tests.
- D2, D5, D6, D7: implementation details that the code and the spec show.
- D3, D4, D8: folder, command and skill names. Renaming them is cheap.
- The split between a deterministic tool and the agent's editorial work follows [0009](../../../docs/decisions/0009-ingest-tools-compute-facts-the-agent-writes-the-sheet.md).
- One PNG per character, named after its id, stays as [0012](../../../docs/decisions/0012-avatar-images-are-named-after-the-character.md) says.

## In-Force ADRs Reviewed

- [0001](../../../docs/decisions/0001-static-first-sveltekit-on-cloudflare-workers.md) Static-first SvelteKit on Cloudflare Workers
- [0002](../../../docs/decisions/0002-character-data-behind-a-provider-interface.md) Character data behind a provider interface
- [0003](../../../docs/decisions/0003-per-device-state-behind-a-key-value-store-interface.md) Per-device state behind a key-value store interface
- [0004](../../../docs/decisions/0004-rich-text-rendered-as-token-tree-not-html-string.md) Rich text rendered as a token tree
- [0005](../../../docs/decisions/0005-self-hosted-fonts-no-third-party-requests.md) Self-hosted fonts, no third-party requests
- [0006](../../../docs/decisions/0006-palette-tokens-separate-fills-from-marks.md) Palette tokens separate fills from marks
- [0007](../../../docs/decisions/0007-colour-marks-meaning-not-identity.md) Colour marks meaning, not identity
- [0008](../../../docs/decisions/0008-theme-mode-an-explicit-choice-over-the-device-preference.md) Theme mode is an explicit choice
- [0009](../../../docs/decisions/0009-ingest-tools-compute-facts-the-agent-writes-the-sheet.md) Ingest tools compute facts; the agent writes the sheet
- [0010](../../../docs/decisions/0010-recorded-fixtures-carry-no-personal-data.md) Recorded fixtures carry no personal data
- [0011](../../../docs/decisions/0011-self-hosted-renovate-owns-dependency-updates.md) Self-hosted Renovate owns dependency updates
- [0012](../../../docs/decisions/0012-avatar-images-are-named-after-the-character.md) Avatar images are named after the character

## New Durable ADRs Created

- None - no major durable architectural decisions were introduced.
