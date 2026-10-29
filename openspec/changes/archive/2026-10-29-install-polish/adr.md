# ADR Review Manifest

- Status: completed
- Review date: 2026-10-29

## Review Summary

ADR review completed for this change. Every decision in design.md is cheap to reverse and readable from the code: the logo drawing, its sizes, the startup-image list, the hand-written links and the extra meta tag. None needs a record.

The design follows two records: [0006](../../../docs/decisions/0006-palette-tokens-separate-fills-from-marks.md) sets the star's colour token, and [0001](../../../docs/decisions/0001-static-first-sveltekit-on-cloudflare-workers.md) keeps the art as committed static files.

## In-Force ADRs Reviewed

- [0001. Static-first SvelteKit on Cloudflare Workers](../../../docs/decisions/0001-static-first-sveltekit-on-cloudflare-workers.md)
- [0002. Character data behind a provider interface](../../../docs/decisions/0002-character-data-behind-a-provider-interface.md)
- [0003. Per-device state behind a key-value store interface](../../../docs/decisions/0003-per-device-state-behind-a-key-value-store-interface.md)
- [0004. Rich-text rendered as a token tree, not an HTML string](../../../docs/decisions/0004-rich-text-rendered-as-token-tree-not-html-string.md)
- [0005. Self-hosted fonts, with no third-party requests from the sheet](../../../docs/decisions/0005-self-hosted-fonts-no-third-party-requests.md)
- [0006. Palette tokens separate fills from marks](../../../docs/decisions/0006-palette-tokens-separate-fills-from-marks.md)
- [0007. Colour marks meaning, not identity](../../../docs/decisions/0007-colour-marks-meaning-not-identity.md)
- [0008. Theme mode: an explicit choice layered over the device preference](../../../docs/decisions/0008-theme-mode-an-explicit-choice-over-the-device-preference.md)
- [0009. Ingest: tools compute the facts, the agent writes the sheet](../../../docs/decisions/0009-ingest-tools-compute-facts-the-agent-writes-the-sheet.md)
- [0010. Recorded fixtures carry no personal data](../../../docs/decisions/0010-recorded-fixtures-carry-no-personal-data.md)
- [0011. Self-hosted Renovate owns every dependency update, and Dependabot only raises alerts](../../../docs/decisions/0011-self-hosted-renovate-owns-dependency-updates.md)
- [0012. Avatar images are named after the character, located by the provider](../../../docs/decisions/0012-avatar-images-are-named-after-the-character.md)

## New Durable ADRs Created

- None. No decision in this change is costly to reverse.
