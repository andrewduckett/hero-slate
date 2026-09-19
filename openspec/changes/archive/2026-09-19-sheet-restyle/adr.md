# ADR Review Manifest

- Status: completed
- Review date: 2026-09-19

## Review Summary

ADR review completed for this change. `design.md` makes six decisions (D1–D6).
Only D4, self-hosted fonts, is a durable fork. A later engineer could switch to a
font CDN without knowing why we avoid it. That would quietly add third-party
requests to a child's page. The other decisions are visual choices, token values,
or test hooks. They can be read from the code and are cheap to change.

## In-Force ADRs Reviewed

No ADR supersedes another. The highest sequence number was 0004.

- `docs/adr/0001-static-first-sveltekit-on-cloudflare-workers.md`: fonts ship as
  static files, with no Worker code.
- `docs/adr/0002-character-data-behind-a-provider-interface.md`: this change adds
  no data fields and does not touch the provider.
- `docs/adr/0003-per-device-state-behind-a-key-value-store-interface.md`: the
  trackers keep their state keys and behavior.
- `docs/adr/0004-rich-text-rendered-as-token-tree-not-html-string.md`: the rich-text
  styles may change, but the renderer does not.

## New Durable ADRs Created

- `docs/adr/0005-self-hosted-fonts-no-third-party-requests.md`
