# ADR Review Manifest

- Status: completed
- Review date: 2026-09-18

## Review Summary

ADR review completed for this change. This is the first change in a greenfield repo, so no ADR directory existed. We established `docs/decisions/` with a template and recorded the two durable, costly-to-reverse decisions from design.md. Two other decisions do not clear the ADR bar: fixing identity as the stable schema with provisional other fields, and the pure descriptor-line function. Each is cheap to reverse or owned by the specs.

## In-Force ADRs Reviewed

- None existed before this change. `docs/decisions/` was created here, seeded with `0000-template.md`.

## New Durable ADRs Created

- `docs/decisions/0001-static-first-sveltekit-on-cloudflare-workers.md` — the framework, hosting, and static-first rendering model that keep the dynamic-backend door open.
- `docs/decisions/0002-character-data-behind-a-provider-interface.md` — the data-provider boundary and logical-id addressing that keep a future hosted backend a component swap.
