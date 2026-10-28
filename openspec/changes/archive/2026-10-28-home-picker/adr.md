# ADR Review Manifest

- Status: completed
- Review date: 2026-10-28

## Review Summary

ADR review completed for this change.

## In-Force ADRs Reviewed

- [0001. Static-first SvelteKit on Cloudflare Workers](../../../docs/decisions/0001-static-first-sveltekit-on-cloudflare-workers.md): the manifest is a static asset fetched at runtime; no server code.
- [0002. Character data behind a provider interface](../../../docs/decisions/0002-character-data-behind-a-provider-interface.md): `listCharacters()` extends the same interface, and consumers never learn the manifest's path.
- [0003. Per-device state behind a key-value store interface](../../../docs/decisions/0003-per-device-state-behind-a-key-value-store-interface.md): cards show no per-device state.
- [0004. Rich text rendered as a token tree, not an HTML string](../../../docs/decisions/0004-rich-text-rendered-as-token-tree-not-html-string.md): not affected.
- [0005. Self-hosted fonts, no third-party requests](../../../docs/decisions/0005-self-hosted-fonts-no-third-party-requests.md): cards use the existing font variables.
- [0006. Palette tokens separate fills from marks](../../../docs/decisions/0006-palette-tokens-separate-fills-from-marks.md): a card is an accent fill with on-accent text.
- [0007. Colour marks meaning, not identity](../../../docs/decisions/0007-colour-marks-meaning-not-identity.md): the card's color is the character's own palette, the one place identity color is allowed, as the header already is.
- [0008. Theme mode: an explicit choice over the device preference](../../../docs/decisions/0008-theme-mode-an-explicit-choice-over-the-device-preference.md): not affected.
- [0009. Ingest tools compute facts; the agent writes the sheet](../../../docs/decisions/0009-ingest-tools-compute-facts-the-agent-writes-the-sheet.md): not affected. The manifest line stays a hand edit.
- [0010. Recorded fixtures carry no personal data](../../../docs/decisions/0010-recorded-fixtures-carry-no-personal-data.md): not affected.
- [0011. Self-hosted Renovate owns dependency updates](../../../docs/decisions/0011-self-hosted-renovate-owns-dependency-updates.md): not affected.

## New Durable ADRs Created

- None - no major durable architectural decisions were introduced. The ids-only manifest (design decision 1) is a data-file format that the provider interface already insulates consumers from, as ADR 0002 records. Reversing it changes one file format and one implementation, not every screen, so it does not pass the ADR test.
