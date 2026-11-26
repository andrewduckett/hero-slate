<!-- Plain language: Help the next implementer find the approach, understand the choices and act on the plan. Explain necessary technical terms. Put each risk beside its mitigation and each open question beside the decision it affects. -->

## Context

- CI has three pull request workflows: `test and build`, CodeQL and
  `lets sync --check`. Each is a YAML file in `.github/workflows/`. None is
  a required status check, and the admin role can bypass merge rules.
- `test-and-build.yml` sets the pattern a new workflow follows: no branch
  filter on `pull_request`, so stacked pull requests are checked;
  `permissions: contents: read`; a per-ref `concurrency` group; Node from
  `jdx/mise-action`.
- Node 26 runs `.ts` files directly, by stripping types. The scripts in
  `scripts/` rely on this and import only `node:` modules and relative `.ts`
  files, so they need no `npm ci`.
- Vitest only collects `src/**/*.{test,spec}.{js,ts}` (`vite.config.ts`).
- A pull request title is text anyone who opens a pull request controls. In a
  `run:` step, `${{ github.event.pull_request.title }}` is pasted into the
  shell script before it runs, so a crafted title could run commands.

## Goals / Non-Goals

**Goals:**

- Put the pass or fail decision in one pure function that Vitest can test
  without git or GitHub.
- Keep the workflow thin: collect the title and the changed paths, call the
  function, print its message, exit with its status.
- Never place the title inside a shell script.

**Non-Goals:**

- Making the check required, or changing any repository setting (D6).
- Checking commit messages (D3).
- Running the check outside GitHub Actions, such as in a git hook.

## Test Seams

- **Primary test seam:** a Vitest unit test of the pure function
  `judgeCharacterWork({ title, changedPaths })` in
  `scripts/character-work-check.test.ts`. Every `ci-checks` scenario except
  the title edit and the stacked base maps to one case: a title and a list of
  paths in, a pass or fail result and the log message out.
- **Existing seams reused:** the Vitest suite. `vite.config.ts` gains
  `scripts/**/*.test.ts` in `test.include`, so `npm test` and the
  `test and build` check run the new test.
- **Live check:** the title edit and the stacked base need GitHub. This pull
  request is itself stacked on #135, so the build verifies both on it: edit
  its title to start with `char:`, see the check fail and list the
  non-character paths only from this branch, then restore the title and see
  it pass.
- **Skill walkthrough:** the marking rule in the two skill specs is agent
  behavior. A scripted manual walkthrough validates it, as it does the skills'
  existing commit rule.

## Scrutiny Tier & Blast Radius

- **Tier:** medium. One new workflow on established patterns, but it reads
  text that the pull request's author controls.
- **Blast radius:** a new workflow file, a new script and its test, one line
  of `vite.config.ts`, and the boundary reference
  `.agents/skills/character-work.md`. No app code, no app data, no secrets.
  The job's token can only read the repository.

## Decisions

**D-a. The mark is the exact, lowercase prefix `char:`.** The function tests
`title.startsWith('char:')`. `Char:` or ` char:` does not count. This matches
the lowercase Conventional Commits types and keeps the rule one line in the
glossary. A looser match was rejected: every variant it accepts is another
spelling agents and the Author must learn. The title mark is the choice most
costly to reverse, because the glossary, the boundary reference and agents'
habits all depend on it. The ADR step should consider recording it.

**D-b. Changed paths come from `git diff --name-only --no-renames -z`
between the base and head commits, three-dot form.** The command is
`git diff --name-only --no-renames -z "$BASE_SHA...$HEAD_SHA"`, with the
SHAs from `github.event.pull_request.base.sha` and `head.sha`.

- Three dots compare the head with the merge base, so a stacked pull request
  is judged only on its own commits (D4).
- `--no-renames` reports a rename as a deletion of the old path and an
  addition of the new one, so both sides are judged without parsing rename
  lines (D4).
- `-z` gives raw paths separated by NUL bytes, so git never quotes or escapes
  an unusual file name.
- The checkout uses `fetch-depth: 0` so the merge base is present. The
  repository is small, so the full history costs little.

Rejected: the GitHub API's list of pull request files. It needs paging and a
token with pull request read access. Also rejected: diffing the merge commit
that `actions/checkout` makes, because it does not exist when the pull request
has a merge conflict.

**D-c. The title reaches the script through an environment variable.** The
step sets `PR_TITLE: ${{ github.event.pull_request.title }}` under `env:`,
and the script reads `process.env.PR_TITLE`. The title is never written into
a `run:` script. This is GitHub's documented defence against script
injection. The workflow uses the `pull_request` event, not
`pull_request_target`, so a pull request from a fork gets a read-only token
and no secrets.

**D-d. The workflow triggers on `opened`, `synchronize`, `reopened` and
`edited`.** `edited` fires when the title, the description or the base branch
changes. Re-running on a description edit is cheap and harmless, and a base
change should re-judge the pull request anyway. A `concurrency` group keyed on
the pull request number cancels an older run.

**D-e. An unmarked pull request runs the job and passes.** The job always
runs, and the script exits 0 after it logs that the pull request is not
marked as character work. Skipping the job with an `if:` was rejected: GitHub
then shows the check as skipped, not passed, and the spec says it passes.

**D-f. The logic lives in `scripts/`, not `src/lib/`.** The check is a CI
tool, not app code. `scripts/character-work-check.ts` exports
`judgeCharacterWork` and runs it when executed as the main module. The
workflow runs it with `node scripts/character-work-check.ts`. Putting it in
`src/lib/` was rejected because `src/` is the app, and the boundary reference
calls everything under `src/` app code.

**D-g. The message.** On failure the script prints a GitHub `::error::`
annotation with a one-line summary, then each outside path on its own line,
then the two fixes from D5. The function returns the message text, so the
unit test asserts the paths and both fixes.

**D-h. The marking rule goes in a new "Pull requests" section of
`.agents/skills/character-work.md`, after "Commits" (D8).** The two character
skills already tell agents to follow that reference, so their `SKILL.md`
files do not change.

## Risks / Trade-offs

- [The check name `character work` collides with a future job name] → The
  workflow and its one job are both named `character work`, as
  `test and build` is.
- [A title with only `char:` and no description passes the mark test] → That
  is intended. The check judges files, not title quality.
- [`fetch-depth: 0` slows the checkout as the history grows] → The
  repository is small today. If it grows, fetch the base and head refs with a
  bounded depth instead.
- [An agent opens a character pull request without the mark, and the check
  passes] → Accepted (D1). The marking rule in the boundary reference reduces
  it; the check cannot see intent.

## Migration & Rollback

N/A. Nothing changes shape. To roll back, delete
`.github/workflows/character-work.yml`. Open pull requests then stop
reporting the check.
