**Why:** The repo pins Let's Spec 0.3.0, three releases behind, so its skills, schemas and rules are stale and its `lets` still reads a delegate config this machine no longer has.

## Story

#79 update-lets-spec — the repo runs Let's Spec 0.6.0, so code reviews can use a model this machine can run
https://github.com/andrewduckett/hero-slate/issues/79

## Decisions

| # | Question | Answer | Source |
|---|---|---|---|
| D1 | Where does Let's Spec come from? | `github:sidereal-io/lets-spec`; the old `andrewduckett/lets-spec` name only redirects | Evidence: `gh repo view andrewduckett/lets-spec`, issue #79 |
| D2 | How does `mise.toml` pin it? | Exact `{ version = "0.6.0" }`, as today; no `mise.lock` | User |
| D3 | Which OpenSpec CLI version? | Stays at 1.13.2, the version the 0.6.0 release notes name | Evidence: v0.6.0 release notes |
| D4 | What does the upgrade rewrite? | Whatever `lets sync` writes: the AGENTS.md rules block, 9 skill files and 3 schema files, per `lets sync --check` at 0.6.0 | Evidence: `lets sync --check` run with 0.6.0 |
| D5 | Does the upgrade need manual steps in the repo? | No; the 0.4–0.6 upgrade notes only touch the per-machine delegate config, which already uses the 0.6 format here | Evidence: upstream `docs/upgrading.md`, `~/.config/lets/config.yaml` |
| D6 | What is the acceptance check? | `mise exec -- lets sync --check` passes, and `lets --version` prints 0.6.0 | Evidence: issue #79 |

## Changes from the story

- Cut: "`lets delegate review` runs a model this machine supports" is no longer an acceptance check. Testing delegation belongs to Let's Spec and the machine's setup, not this repo.

Confirmed by user: yes
