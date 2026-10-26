# 0011. Self-hosted Renovate owns every dependency update, and Dependabot only raises alerts

- Status: accepted
- Date: 2026-10-26
- Supersedes: none
- Superseded by: none

## Context

Hero Slate pins its dependencies in three places: `package.json` with `package-lock.json`, the actions in `.github/workflows/`, and the development tools in `mise.toml`. The tools in `mise.toml` are Node, gh, the OpenSpec CLI and Let's Spec.

Dependabot covered the first two, but it can't read `mise.toml`. Those tools were bumped by hand and fell behind. A Let's Spec bump also has to run `lets sync` and commit what it writes, or CI's `lets sync --check` fails. And with Dependabot alerts off, nothing reported a vulnerable dependency at all.

Two bots that both open version updates for the same file open duplicate pull requests. So one tool has to own every version update.

The sister project PierPressure faced the same problem and settled it in its ADR-0024. This record adopts that decision for Hero Slate.

## Decision

Renovate owns every version update. It runs self-hosted, from a daily GitHub Actions workflow in this repository, with the repository's own mise toolchain on PATH. It signs in as a GitHub App, so its pull requests trigger CI. Dependabot keeps only its alerts: version updates and Dependabot security updates are off. Renovate reads the alerts and opens a separate pull request for each fix.

Nothing merges automatically. The maintainer reviews and merges every update. The project has no required status checks and a test suite that runs only locally, so a green CI run on an update proves little on its own.

`mise.toml` is the only file that pins Node. The `.nvmrc` that duplicated it is gone, so a Node update changes one file.

We considered these alternatives:

- **Keep Dependabot, and bump `mise.toml` by hand.** Nothing new to run, but the hand-bumped tools keep drifting. It leaves the original problem in place.
- **Dependabot for npm and Actions, Renovate for `mise.toml` only.** The npm and Actions rules stay as they were, but there are two bots, two configs and two dashboards to keep in step, and Renovate's default managers need turning off one by one to avoid duplicates.
- **Mend's hosted Renovate app.** Nothing to run, but it doesn't run post-upgrade commands from a repository's config, so every Let's Spec bump would fail `lets sync --check` until someone ran `lets sync` by hand.
- **Renovate with auto-merge for minor and patch updates.** Less to review, but CI here runs only CodeQL and `lets sync --check`. Neither runs the tests or the build, so an update that breaks the app would merge unseen.

## Consequences

- **Easier:** every pin, `mise.toml` included, gets update pull requests, with one set of grouping and schedule rules.
- **Easier:** a Let's Spec bump arrives complete. Renovate runs `lets sync` on it, so the pull request already passes `lets sync --check`.
- **Easier:** security fixes and version updates come from one bot, so they never race each other on the same dependency.
- **Harder:** the project now runs a bot of its own. The workflow, the GitHub App, its private key and the Renovate version all need looking after.
- **Harder:** the maintainer runs `npm test` and `npm run build` on each update before merging, because CI does not.
- **Harder:** adding a Dependabot version update back, even for one ecosystem, reintroduces duplicate pull requests.
