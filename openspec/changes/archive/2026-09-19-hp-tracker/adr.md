# ADR Review Manifest

- Status: completed
- Review date: 2026-09-19

## Review Summary

ADR review completed for this change. The design introduces one durable fork: the
per-device state store interface. It qualifies for an ADR, so we recorded it in
`docs/decisions/0003`. The remaining decisions are spec behavior or reversible code
choices, so they stay in the specs and design.

## In-Force ADRs Reviewed

- `docs/decisions/0001-static-first-sveltekit-on-cloudflare-workers.md` — static-first,
  no backend this release. The state store honors it: state persists on-device via
  localStorage, with no server code.
- `docs/decisions/0002-character-data-behind-a-provider-interface.md` — authored data
  behind a provider interface. It anticipated this store following the same pattern.

## New Durable ADRs Created

- `docs/decisions/0003-per-device-state-behind-a-key-value-store-interface.md` —
  per-device state behind a key-value store interface, with an opaque JSON value
  keyed by logical id and tracker key. Records why key-value was chosen over a
  combined per-character document or a typed per-tracker record.
