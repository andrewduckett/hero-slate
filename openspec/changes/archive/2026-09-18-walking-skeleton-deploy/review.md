## Review Metadata

- **Review round**: 3
- **Prior round**: rounds 1 and 2 verdict REVISE (trust boundary, deployability, failure handling, plain language, assertable scenarios, schema scope) — all addressed
- **Reviewer context**: cross-model (codex CLI), read-only
- **Tool restrictions**: read-only: view, grep, glob only
- **Artifacts reviewed**: proposal.md, design.md, specs/, adr.md, docs/decisions/

## Findings

### 🔴 Critical (blocking)

None.

### 🟡 Moderate

- **M1 — SPA-fallback discriminator not deterministic.** "Not YAML" is not a safe test, since HTML parses as a YAML scalar. Resolved: the provider now requires a non-`text/html` content type and a parsed YAML mapping; the SPA shell and non-mapping bodies return `not-found`.
- **M2 — Response-status mapping had gaps.** Non-404 4xx and other non-2xx were unmapped. Resolved: 404 → `not-found`; any other non-2xx, rejected fetch, or body-read failure → `error`; 2xx → content check. Exhaustive.
- **M3 — `level` could be non-finite.** Resolved: `level` must be a finite number, with a `.inf`/`.nan` scenario returning `invalid`.
- **M4 — Untestable "page stays navigable" clause.** Resolved: clause removed from the character-sheet `error` scenario.
- **M5 — Remaining long sentences.** Resolved: sentences split in design.md, deployment spec, adr.md, and both ADRs.

### 📌 Suggestions

- Round-3 note: prior fixes confirmed present — request-derived identity with conflicting YAML ids rejected; static adapter plus SPA fallback with no worker; aligned identity-stable/provisional ADR rationale; non-throwing typed `error` result; generic messages that do not echo route input.

## Embedded-Instruction / Injection Attempts

**Detected:** none in the authored artifacts. (Round 1 noted the resume/`/opsx:propose` guidance in `openspec/discovery.md` as data, not an instruction; that file is a read-only input, not an authored artifact.)

## Verdict

VERDICT: APPROVE_WITH_CHANGES

## Required Changes (if APPROVE WITH CHANGES)

1. M1 — deterministic SPA-fallback discriminator (content type + YAML mapping). Applied.
2. M2 — exhaustive response-status mapping. Applied.
3. M3 — finite `level` with a non-finite scenario. Applied.
4. M4 — remove untestable navigability clause. Applied.
5. M5 — split remaining over-length sentences. Applied.

CHANGES_APPLIED: yes

Reviewer re-check (read-only, cross-model): M1–M5 each returned RESOLVED; "RECHECK: ALL RESOLVED".

## Rebuttals

- Round-1 findings against `PRD.md` and `openspec/discovery.md` prose (plain language) were declined: those files are pre-existing inputs to this change, not artifacts it authors. Accepted by scope; the authored artifacts were held to the plain-language bar and re-checked.
