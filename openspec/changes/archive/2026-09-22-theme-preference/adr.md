# ADR Review Manifest

- Status: completed
- Review date: 2026-09-22

## Review Summary

ADR review completed for this change. I read every in-force ADR under `docs/decisions/` and built the supersession graph: none are superseded, and the highest sequence number in use was 0007. I re-read `design.md` and judged its decisions against the ADR bar. One decision qualifies — how the light/dark mode is resolved and where the chosen mode lives — because reversing it later is costly and its rationale is not recoverable from the code alone. The no-flash inline script, the toggle's placement, and the emitted-CSS layout are implementation choices recorded in `design.md`, not durable forks.

## In-Force ADRs Reviewed

- 0001. Static-first SvelteKit on Cloudflare Workers
- 0002. Character data behind a provider interface
- 0003. Per-device state behind a key-value store interface
- 0004. Rich-text rendered as a token tree, not an HTML string
- 0005. Self-hosted fonts, with no third-party requests from the sheet
- 0006. Palette tokens separate fills from marks
- 0007. Colour marks meaning, not identity

## New Durable ADRs Created

- `docs/decisions/0008-theme-mode-an-explicit-choice-over-the-device-preference.md` — the mode is resolved by precedence (explicit choice, else device, else dark), expressed as a `data-theme` selector layered over the media query, with the chosen mode kept as a global device value outside the character-state store. Relates to ADR 0003, which owns that store; does not supersede it.
