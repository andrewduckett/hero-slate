# ADR Review Manifest

- Status: completed
- Review date: 2026-09-19

## Review Summary

ADR review completed for this change.

## In-Force ADRs Reviewed

- **ADR 0001** — Static-first SvelteKit on Cloudflare Workers: sections are
  definition data only; no server state or worker code is introduced.
- **ADR 0002** — Character data behind a provider interface: `sections` is a field
  on the `Character` type returned by the provider. This change adds no new
  provider method and does not change how the provider resolves character data.
- **ADR 0003** — Per-device state behind a key-value store interface: sections are
  read-only authored data. This change introduces no new tracker key and no new
  state-store interaction.

## New Durable ADRs Created

- **ADR 0004** — `docs/decisions/0004-rich-text-rendered-as-token-tree-not-html-string.md`
  The rich-text renderer builds a typed token tree and walks it with recursive
  Svelte components. It never constructs an HTML string or uses `{@html}`. This
  makes XSS structurally impossible rather than runtime-filtered, and it removes
  the need for a sanitizer dependency. See the file for full context and
  consequences.
