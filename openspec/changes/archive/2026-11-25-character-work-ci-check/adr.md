<!-- Plain language: Make each record link identify the decision so a reader can find its rationale. Keep this manifest separate from the records themselves. -->

# ADR Review Manifest

- Status: completed
- Review date: 2026-11-25

## Review Summary

ADR review completed for this change. One decision in `design.md` needs a
record: D-a, the `char:` title mark. Agents, the glossary, the boundary
reference and the CI check all depend on it, and a branch prefix or a label
were real alternatives, so a maintainer could swap it without knowing why.

The other decisions do not need a record:

- **How the changed paths are collected** (D-b), **how the title reaches the
  script** (D-c), **the triggers** (D-d) and **passing an unmarked pull
  request** (D-e) live in the workflow and script. Each is cheap to change,
  and the reasons are in `design.md`.
- **Where the script lives** (D-f), **the message** (D-g) and **where the
  marking rule is written** (D-h) are file layout and wording.

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

- [0013. Character work pull requests are marked by a `char:` title prefix](../../../docs/decisions/0013-character-work-pull-requests-are-marked-by-a-char-title-prefix.md)
