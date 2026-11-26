<!-- Plain language: Make each record link identify the decision so a reader can find its rationale. Keep this manifest separate from the records themselves. -->

# ADR Review Manifest

- Status: completed
- Review date: 2026-11-25

## Review Summary

ADR review completed for this change. One decision needs a record:

- **Edits go through the write tool's edit mode** (design.md D-1, D-8 and
  D-11). Record 0009 said the write tool never overwrites an existing
  character. Without a record, a maintainer reading 0009 could remove edit
  mode as a violation, or a later change could let the agent save edits
  directly and lose the guarantee that every saved file was checked. Record
  0013 supersedes that one rule of 0009 and keeps the rest. 0009's
  "Superseded by" line now names 0013 for that rule only.

The other decisions do not need a record:

- **Exit code 6, the message texts and the draft folder** (D-2, D-3, D-4)
  live in code and in the specs, and cost little to change.
- **How the change list matches entries and finds lost comments** (D-5,
  D-6) is behavior the specs own and tests pin; there is no fork between
  architectural approaches.
- **Editing the draft in place, the skill's layout and the routing edits**
  (D-7, D-9) are agent instructions, cheap to reword.
- **Splitting two requirements for validation** (D-10) is a spec-writing
  choice that leaves nothing to reverse.

## In-Force ADRs Reviewed

- [0001. Static-first SvelteKit on Cloudflare Workers](../../../docs/decisions/0001-static-first-sveltekit-on-cloudflare-workers.md)
- [0002. Character data behind a provider interface](../../../docs/decisions/0002-character-data-behind-a-provider-interface.md)
- [0003. Per-device state behind a key-value store interface](../../../docs/decisions/0003-per-device-state-behind-a-key-value-store-interface.md)
- [0004. Rich-text rendered as a token tree, not an HTML string](../../../docs/decisions/0004-rich-text-rendered-as-token-tree-not-html-string.md)
- [0005. Self-hosted fonts, with no third-party requests from the sheet](../../../docs/decisions/0005-self-hosted-fonts-no-third-party-requests.md)
- [0006. Palette tokens separate fills from marks](../../../docs/decisions/0006-palette-tokens-separate-fills-from-marks.md)
- [0007. Colour marks meaning, not identity](../../../docs/decisions/0007-colour-marks-meaning-not-identity.md)
- [0008. Theme mode: an explicit choice layered over the device preference](../../../docs/decisions/0008-theme-mode-an-explicit-choice-over-the-device-preference.md)
- [0009. Ingest: tools compute the facts, the agent writes the sheet](../../../docs/decisions/0009-ingest-tools-compute-facts-the-agent-writes-the-sheet.md) (its no-overwrite rule is superseded by 0013)
- [0010. Recorded fixtures carry no personal data](../../../docs/decisions/0010-recorded-fixtures-carry-no-personal-data.md)
- [0011. Self-hosted Renovate owns every dependency update, and Dependabot only raises alerts](../../../docs/decisions/0011-self-hosted-renovate-owns-dependency-updates.md)
- [0012. Avatar images are named after the character, located by the provider](../../../docs/decisions/0012-avatar-images-are-named-after-the-character.md)

## New Durable ADRs Created

- [0013. Edits to an existing sheet go through the write tool's edit mode](../../../docs/decisions/0013-edits-to-a-sheet-go-through-the-write-tool.md)
