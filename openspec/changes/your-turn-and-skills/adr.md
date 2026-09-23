# ADR Review Manifest

- Status: completed
- Review date: 2026-09-23

## Review Summary

ADR review completed for this change. The author read every in-force ADR under `docs/decisions/` and built the supersession graph. No ADR names another in its Supersedes field, and the highest sequence number in use is 0009.

The author then judged each decision in `design.md` against the ADR bar. None qualifies. Each decision is local to one ingest module, is cheap to reverse, or applies a principle an existing ADR already records:
- D1 to D4: the two new modules, all 18 skills in the digest, the skill-bonus formula, and an unknown bonus for a manual skill value
- D5 to D9: the action fields and their three states, and the feature, save, and weapon rules with their fail-safe unknowns
- D10 to D12: skill grouping, the short recommendation, and pill formatting, all agent behavior in the skill
- D13 and D14: the preview and validation reusing the app's section resolver
- D15: no pill cross-check, which story 20 can add later at low cost
- D16: treating digest text as data

Three in-force ADRs bear on this change. The change follows each of them:
- **ADR 0009** (the ingest tools compute facts, and the agent writes the sheet): the digest computes every skill bonus, to-hit, damage, and DC. It reports a number as unknown instead of guessing. The agent only selects, groups by comparing equal values, formats, and words rows.
- **ADR 0004** (rich text rendered as a token tree, not an HTML string): section text from D&D Beyond names reaches the sheet as text nodes, so it cannot inject markup.
- **ADR 0007** (colour marks meaning, not identity): the skill suggests a colour for each section, and the Author confirms it.

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
