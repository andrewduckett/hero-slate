# ADR Review Manifest

- Status: completed
- Review date: 2026-09-23

## Review Summary

ADR review completed for this change. The author read every in-force ADR under `docs/decisions/` and built the supersession graph. No ADR names another in its Supersedes field, and the highest sequence number in use was 0009.

The author then judged each decision in `design.md` against the ADR bar. One qualifies:
- **D12**, blanking personal fields in recorded fixtures, is a privacy posture. It is costly to reverse: a raw fixture in a public repository took a history rewrite to remove, and copies remain on GitHub. An engineer recording a new fixture could skip the step without knowing why it matters. ADR 0010 records it.

The rest do not qualify. Each is local to the spells module or the skill, is cheap to reverse, or applies a principle an existing ADR already records:
- D1 and D2: the new module and the three new optional fields
- D3 and D4: grouping spells by name into cast ways, and status as a fact rather than a filter
- D5 to D8: the casting-ability rules, the number rules, cantrip scaling, and the fail-safe unknowns
- D9 and D10: the spellcasting summary, and reusing the limited-use rule
- D11: the two-tier recommendation, which is agent behavior in the skill
- D13: treating digest text as data

Three in-force ADRs bear on this change. The change follows each of them:
- **ADR 0009** (the ingest tools compute facts, and the agent writes the sheet): the digest computes every spell number. It reports a number as unknown instead of guessing. The agent only selects, formats, and words rows.
- **ADR 0004** (rich text rendered as a token tree, not an HTML string): spell names from D&D Beyond reach the sheet as text nodes, so they cannot inject markup.
- **ADR 0007** (colour marks meaning, not identity): the skill suggests a colour for the Magic section, and the Author confirms it.

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

- [0010. Recorded fixtures carry no personal data](../../../docs/decisions/0010-recorded-fixtures-carry-no-personal-data.md)
