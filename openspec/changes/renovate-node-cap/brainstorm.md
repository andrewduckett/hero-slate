**Why:** Renovate opened #116 to run itself on Node 26, which its `engines` field (`node: ^24.11.0`) rejects, so the runner's Node pin needs a cap that keeps such updates from being proposed.

## Story

#117 renovate-node-cap — Renovate keeps its runner on a Node version Renovate supports
https://github.com/andrewduckett/hero-slate/issues/117

## Decisions

| # | Question | Answer | Source |
|---|---|---|---|
| D1 | Close #116 only, or add a rule? | Add a rule. Closing alone only ignores Node 26, and blocks it later when Renovate supports it | User |
| D2 | What does the rule cap? | `allowedVersions: "<25"` on the `node` dependency | Evidence: `renovate` 44.201.1 `engines.node` is `^24.11.0` |
| D3 | Which pins does it cover? | Only `RENOVATE_NODE_VERSION` in `.github/workflows/renovate.yml`, matched by file name. The project's Node in `mise.toml` is unaffected | User |
| D4 | Can the cap follow Renovate's `engines` on its own? | No. A comment beside the rule says to raise it when Renovate accepts a newer Node | Evidence: Renovate can't read another package's `engines` |
| D5 | What happens to #116? | Renovate closes it on its next run once the rule merges; close it by hand during cleanup if it is still open | User |
| D6 | How is the rule checked? | The Renovate workflow's `validate` job runs on the PR because it changes `.github/renovate.json5` | Evidence: `.github/workflows/renovate.yml` |

## Changes from the story

None

Confirmed by user: yes
