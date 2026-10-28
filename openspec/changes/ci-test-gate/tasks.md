## 1. The `test and build` check

- [ ] 1.1 [easy] Add `.github/workflows/test-and-build.yml`: it runs on every `pull_request` with no branch filter and on `push` to `main`, has one job named `test and build`, and grants the token `contents: read` only (D1, D2, D9) (verify: grep -Eq '^name: test and build' .github/workflows/test-and-build.yml && grep -q 'contents: read' .github/workflows/test-and-build.yml && ! grep -A2 '^  pull_request:' .github/workflows/test-and-build.yml | grep -q branches)
- [ ] 1.2 [easy] The job checks out the repository, installs the tools with `jdx/mise-action@v5` and `GITHUB_TOKEN`, as `lets-sync-check.yml` does, then runs `npm ci` (D5) (verify: grep -q 'jdx/mise-action@v5' .github/workflows/test-and-build.yml && grep -q 'npm ci' .github/workflows/test-and-build.yml)
- [ ] 1.3 [easy] The job runs `npm test`, then `npm run build`, as separate named steps, in that order, and never `npm run check` (D2, D6, D7) (verify: awk '/npm test/{t=NR} /npm run build/{b=NR} END{exit !(t && b && t<b)}' .github/workflows/test-and-build.yml && ! grep -q 'npm run check' .github/workflows/test-and-build.yml)
- [ ] 1.4 [easy] A newer push to the same ref cancels the older run: a `concurrency` group on the workflow and ref with `cancel-in-progress: true`, as `codeql.yml` has (D8) (verify: grep -q 'cancel-in-progress: true' .github/workflows/test-and-build.yml)
- [ ] 1.5 [easy] The same commands the job runs pass locally from a clean install (verify: npm ci && npm test && npm run build)

## 2. Docs

- [ ] 2.1 [easy] AGENTS.md's **Checks** paragraph says CI runs `test and build` on every pull request, alongside CodeQL and `lets sync --check`, and still asks agents to run `npm test` and `npm run build` before pushing (D4) (verify: grep -q 'test and build' AGENTS.md && ! grep -q 'lets sync --check` only' AGENTS.md)
- [ ] 2.2 [easy] README.md's contributing section says the same (D4) (verify: grep -q 'test and build' README.md && ! grep -q 'lets sync --check` only' README.md)

## 3. Prove it on GitHub

- [ ] 3.1 [easy] Push the branch; the `test and build` check runs on pull request #94 and passes (verify: gh pr checks 94 --watch)
- [ ] 3.2 [medium] Prove the failure path and the stacked case: on a throwaway branch `ci-test-gate-red` off `ci-test-gate`, commit one deliberately failing test, open a draft pull request that targets `ci-test-gate`, and confirm `test and build` runs and fails. Then close that pull request and delete the branch, local and remote (verify: gh pr checks ci-test-gate-red --watch; test $? -eq 1)
