# ADR Review Manifest

- Status: completed
- Review date: 2026-10-28

## Review Summary

ADR review completed for this change. Of design.md's eight decisions, one passes the test: the site-path rule for avatars. An engineer reading only the resolver could widen it to accept remote URLs, and once authors write such lines the page reports visits to other hosts and the rule is costly to restore. The other decisions — the shared component, the CSS mask, the reserved text width, the toggle backing, the field plumbing, the sample art and the prop path — live in code and cost little to change.

## In-Force ADRs Reviewed

- [0001. Static-first SvelteKit on Cloudflare Workers](../../../docs/decisions/0001-static-first-sveltekit-on-cloudflare-workers.md)
- [0002. Character data behind a provider interface](../../../docs/decisions/0002-character-data-behind-a-provider-interface.md)
- [0003. Per-device state behind a key-value store interface](../../../docs/decisions/0003-per-device-state-behind-a-key-value-store-interface.md)
- [0004. Rich text rendered as a token tree, not an HTML string](../../../docs/decisions/0004-rich-text-rendered-as-token-tree-not-html-string.md)
- [0005. Self-hosted fonts, with no third-party requests from the sheet](../../../docs/decisions/0005-self-hosted-fonts-no-third-party-requests.md)
- [0006. Palette tokens separate fills from marks](../../../docs/decisions/0006-palette-tokens-separate-fills-from-marks.md)
- [0007. Colour marks meaning, not identity](../../../docs/decisions/0007-colour-marks-meaning-not-identity.md)
- [0008. Theme mode is an explicit choice over the device preference](../../../docs/decisions/0008-theme-mode-an-explicit-choice-over-the-device-preference.md)
- [0009. Ingest tools compute facts; the agent writes the sheet](../../../docs/decisions/0009-ingest-tools-compute-facts-the-agent-writes-the-sheet.md)
- [0010. Recorded fixtures carry no personal data](../../../docs/decisions/0010-recorded-fixtures-carry-no-personal-data.md)
- [0011. Self-hosted Renovate owns dependency updates](../../../docs/decisions/0011-self-hosted-renovate-owns-dependency-updates.md)

## New Durable ADRs Created

- [0012. Avatar images are site assets, resolved in the view](../../../docs/decisions/0012-avatar-images-are-site-assets-resolved-in-the-view.md) — builds on 0005; extends the no-third-party-requests rule to images and fixes where the rule is enforced.
