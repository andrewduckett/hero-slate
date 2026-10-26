**Why:** Dependabot can't read `mise.toml`, so gh, the OpenSpec CLI and Let's Spec drift until someone bumps them by hand, and with Dependabot alerts off nothing reports a vulnerable dependency.

## Story

#81 renovate-updates — Renovate opens every dependency update and security PR; Dependabot only raises alerts.
https://github.com/andrewduckett/hero-slate/issues/81

## Decisions

| # | Question | Answer | Source |
|---|---|---|---|
| D1 | Which of pier-pressure's decisions (andrewduckett/pier-pressure#119) carry over? | All of them: the same GitHub App, also installed on this repository; a daily run; the Dependency Dashboard on; no hourly PR limit; Let's Spec in its own PR; the config validator in CI on PRs that change the config or workflow; done means a local dry run before merge and a checklist for the first live run. | User |
| D2 | How does a Node update move both `.nvmrc` and `mise.toml`? | It doesn't need to: delete `.nvmrc`, so `node = "26"` in `mise.toml` is the only Node pin. Point `README.md:29` and `AGENTS.md:47` at `mise.toml`. | User |
| D3 | Which commit prefix do update PRs use? | `chore(deps):` for every ecosystem. AGENTS.md has no `build:` or `ci:` type, and Renovate's default `fix(deps):` for `yaml` is turned off. | User |
| D4 | Does an npm update change the range in `package.json`? | Yes: `rangeStrategy: bump`, as Dependabot did (#76 moved `jsdom` from `^30.1.2` to `^30.1.3`). The exact `vite-node` pin stays exact. | Evidence: #76 diff |
| D5 | Which ecosystems get a weekly minor-and-patch PR? | npm (`dependencies` and `devDependencies` together, as Dependabot's group did), GitHub Actions (with the Renovate and Node pins in the Renovate workflow), and `mise.toml` without Let's Spec. | Evidence: `.github/dependabot.yml`, D1 |
| D6 | Are Dependabot alerts and security updates on today? | Alerts are off (the vulnerability-alerts API returns 404), so this change turns on the dependency graph and alerts. Security updates are already off. | Evidence: GitHub API |
| D7 | Can the workflow's own `GITHUB_TOKEN` open the PRs? | No. The `main` ruleset requires no checks, but PRs opened with that token don't trigger CodeQL or `lets sync --check`. The App token does. | Evidence: `main` ruleset, `.github/workflows/` |
| D8 | Does the `dependencies` label exist, and does `security`? | `dependencies` exists; this change creates `security`. | Evidence: `gh label list` |

## Changes from the story

- Changed: `.nvmrc` is deleted instead of tracked by Renovate (D2). `mise.toml` is the only Node pin, and the README and AGENTS.md point at it.
- Changed: update commits use `chore(deps):` for every ecosystem (D3). pier-pressure's `build(deps)` and `ci(deps)` don't fit this repository's commit types.
- Added: npm updates bump the range in `package.json` (D4), as Dependabot did.

Confirmed by user: yes
