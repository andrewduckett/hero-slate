# ADR review: stat-block

ADR review completed for this change. No major durable architectural decisions
were introduced, and no new repository-level ADR files were created.

## Context reviewed

- `docs/decisions/0001-static-first-sveltekit-on-cloudflare-workers.md` — in force.
- `docs/decisions/0002-character-data-behind-a-provider-interface.md` — in force.

No ADR supersedes another; the highest sequence number in use is 0002.

## Why no new ADR

This change adds a pure render of ability and combat stats. Its design decisions
sit below the ADR bar:

- **Resolve stat data in a domain layer, not the provider.** This applies the
  existing decision in ADR-0002 rather than making a new one. The provider stays
  free of domain meaning, exactly as that ADR requires.
- **One entry shape, computed-or-overridden modifier, verbatim values,
  author-driven labels.** These are local config shape and behavior for one
  capability. The spec owns the behavior, and the design records the rationale.
  An engineer can change them by reading the code, and reversal is cheap.

No decision here is an expensive-to-reverse architectural fork, so none warrants a
repository-level ADR.
