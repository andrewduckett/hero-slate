<!-- Reference setup: pier-pressure/.github/renovate.json5, pier-pressure/.github/workflows/renovate.yml
     and pier-pressure/docs/decisions/0024-*.md. Copy them, then apply the brainstorm's decisions:
     no Python, uv or Docker rules; npm uses rangeStrategy bump (D4); every commit is chore(deps) (D3).
     RENOVATE_VERSION below is the one the workflow pins; use pier-pressure's, 44.181.8. -->

## 1. Pins in mise.toml

- [x] 1.1 [easy] `mise.toml` is the only Node pin: delete `.nvmrc`, and point `README.md:29` and `AGENTS.md:47` at `mise.toml` (verify: `test ! -e .nvmrc && ! grep -n nvmrc README.md AGENTS.md`) (✓ `test ! -e .nvmrc && ! grep -n nvmrc README.md AGENTS.md` passed)
- [x] 1.2 [easy] The Let's Spec pin uses `asset_pattern = "lets-spec-*.tar.gz"`, and the OpenSpec comment says it is an ordinary pin Renovate moves on its own, not tied to Let's Spec (verify: `mise install && mise exec -- lets sync --check`) (✓ `mise install && mise exec -- lets sync --check` passed; a fresh install picked `lets-spec-0.6.0.tar.gz`)

## 2. Renovate rules

- [x] 2.1 [medium] `.github/renovate.json5` tracks npm, GitHub Actions (with the `# renovate:` pins in the workflow) and `mise.toml`; runs `on monday` in UTC with no hourly PR limit; labels PRs `dependencies`; commits `chore(deps):` everywhere; bumps npm ranges; groups minor and patch per ecosystem, npm `dependencies` and `devDependencies` together, and leaves each major alone (verify: `mise exec node@24 -- npx --yes --package renovate@44.181.8 -- renovate-config-validator --strict --no-global .github/renovate.json5`) (✓ `renovate-config-validator --strict --no-global` passed)
- [x] 2.2 [medium] The same config gives Let's Spec its own PR that runs `lets sync` as a post-upgrade task and commits every file it writes, and turns on `vulnerabilityAlerts` with the extra label `security` (verify: `mise exec node@24 -- npx --yes --package renovate@44.181.8 -- renovate-config-validator --strict --no-global .github/renovate.json5`) (✓ `renovate-config-validator --strict --no-global` passed)

## 3. Runner and repository settings

- [x] 3.1 [medium] `.github/workflows/renovate.yml` runs Renovate daily and on `workflow_dispatch`, signed in with a token from the `RENOVATE_APP_ID` and `RENOVATE_APP_PRIVATE_KEY` secrets, with `^lets sync$` as the only allowed command and mise's shims on PATH; on a PR that changes the config or the workflow, it only runs the config validator. Push the branch so the validator runs (verify: `gh pr checks 82 | grep -E '^validate\s+pass'`) (✓ `gh pr checks 82` shows `validate pass`)
- [ ] 3.2 [easy] Dependabot opens no version update PRs: delete `.github/dependabot.yml` (verify: `test ! -e .github/dependabot.yml`)
- [ ] 3.3 [easy] The dependency graph and Dependabot alerts are on, and Dependabot security updates stay off (verify: `gh api repos/andrewduckett/hero-slate/vulnerability-alerts --silent && test "$(gh api repos/andrewduckett/hero-slate --jq .security_and_analysis.dependabot_security_updates.status)" = disabled`)
- [ ] 3.4 [easy] The repository has a `security` label for Renovate's security PRs (verify: `gh label list --json name --jq '.[].name' | grep -qx security`)

## 4. Documentation

- [ ] 4.1 [easy] ADR-0011 in `docs/decisions/` records that self-hosted Renovate owns every dependency update and Dependabot only raises alerts, with the alternatives pier-pressure's ADR-0024 weighed and why auto-merge is out (verify: `grep -q 'status: accepted' docs/decisions/0011-*.md`)
- [ ] 4.2 [easy] The README says what Renovate updates, how updates and security fixes arrive, that nothing merges automatically, and how to install the GitHub App and add its two secrets (verify: `grep -q 'RENOVATE_APP_PRIVATE_KEY' README.md`)

## 5. Integration

- [ ] 5.1 [medium] A local Renovate dry run with the repository config finds dependencies in `package.json`, `.github/workflows/` and `mise.toml`, and proposes nothing for `.nvmrc`; the project checks stay green (verify: `LOG_LEVEL=debug mise exec node@24 -- npx --yes renovate@44.181.8 --platform=local --dry-run=lookup 2>&1 | tee .workspace/renovate-dry-run.log | grep -q '"packageFile": "mise.toml"' && npm test && npm run build`)
- [ ] 5.2 [easy] The PR description holds a checklist for the first live run: the dashboard opens, the due PRs open with `chore(deps):` and `dependencies`, the Let's Spec PR passes `lets sync --check`, and CodeQL runs on an update PR (verify: `gh pr view 82 --json body --jq .body | grep -q 'First live run'`)
