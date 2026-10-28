**Why:** No workflow runs the tests or the build, so a pull request can break the app with every check green; a test gate in CI makes "the checks pass" mean the app works.

## Story

#91 ci-test-gate — every pull request runs the tests and build in CI
https://github.com/andrewduckett/hero-slate/issues/91

## Decisions

| # | Question | Answer | Source |
|---|---|---|---|
| D1 | Which events run the check? | Every pull request, with no branch filter, so stacked pull requests get it; and every push to `main`. | User |
| D2 | One check or two? | One job: install once, run `npm test`, then `npm run build`. The failing step's name says which broke. | User |
| D3 | Where does the requirement live? | A new `ci-checks` capability. Also amend `dependency-updates` "Update pull requests run CI" to name the new check. | User |
| D4 | Fix the same stale sentence in README.md? | Yes: README's contributing section and the AGENTS.md **Checks** paragraph both get the edit. | User |
| D5 | How are tools installed? | `jdx/mise-action@v5` with `GITHUB_TOKEN`, as `lets-sync-check.yml` does, then `npm ci`. | Evidence: `.github/workflows/lets-sync-check.yml`, `package-lock.json` |
| D6 | Does `npm run check` run? | No: its `node:fs` type errors are known noise. | Evidence: AGENTS.md, #91 |
| D7 | Why tests before build? | `npm run build` rewrites `palette.css`; running tests first checks the committed file, so a stale one fails. | Evidence: `package.json`, `src/lib/theme/generate.test.ts` |
| D8 | Does a newer push cancel an older run? | Yes, per ref, as `codeql.yml` does. | Evidence: `.github/workflows/codeql.yml` |
| D9 | Token permissions? | `contents: read` only. | Evidence: `.github/workflows/lets-sync-check.yml` |

## Changes from the story

- Added: README.md's contributing section gets the same fix as AGENTS.md, because it repeats the stale sentence (D4).
- Added: the `dependency-updates` spec names the new check among those that run on update pull requests (D3).
- Out of scope, as the story says: making the check required, and turning the Cloudflare build's test step back on.

Confirmed by user: yes
