# ci-checks Specification

## Purpose
Says what GitHub Actions checks on every pull request and on `main`, so a green pull request means the tests pass and the static site builds.

## Requirements

### Requirement: Every pull request runs the tests and the build
CI SHALL run one check named `test and build` on every pull request, whatever branch it targets. The check SHALL run the full test suite (`npm test`) and then the production build (`npm run build`). It SHALL pass only when both succeed. It SHALL NOT run the type-check (`npm run check`).

#### Scenario: Tests and build both pass
- **WHEN** a pull request's tests all pass and its build succeeds
- **THEN** the `test and build` check on that pull request passes

#### Scenario: A test fails
- **WHEN** a pull request has a failing test
- **THEN** the `test and build` check on that pull request fails
- **AND** its log shows the failing test

#### Scenario: The build fails
- **WHEN** a pull request's tests pass but `npm run build` exits non-zero
- **THEN** the `test and build` check on that pull request fails

#### Scenario: A stacked pull request
- **WHEN** a pull request targets another change's branch instead of `main`
- **THEN** the `test and build` check runs on it

### Requirement: A stale generated palette fails the check
The check SHALL run the tests against the committed `src/lib/theme/palette.css`, before the build regenerates it.

#### Scenario: palette.css does not match palette.ts
- **WHEN** a pull request changes `src/lib/theme/palette.ts` without regenerating `src/lib/theme/palette.css`
- **THEN** the `test and build` check on that pull request fails

### Requirement: Pushes to main run the check
CI SHALL run the `test and build` check on every push to `main`.

#### Scenario: A pull request merges
- **WHEN** a pull request merges into `main`
- **THEN** the `test and build` check runs on the resulting `main` commit

### Requirement: A newer push supersedes an older run
When a new commit is pushed to a branch while its `test and build` check is still running, CI SHALL cancel the older run and run the check on the new commit.

#### Scenario: Two quick pushes
- **WHEN** a second commit is pushed to a pull request's branch before the first commit's check finishes
- **THEN** the first run is cancelled
- **AND** the check reports the second commit's result

### Requirement: A character work pull request changes only character files

CI SHALL run one check named `character work` on every pull request, whatever branch it targets. On a character work pull request, as the glossary defines it, the check SHALL fail when the pull request adds, changes or deletes any file outside `static/characters/`. A rename counts by both its old and its new path. A file in a subfolder of `static/characters/` counts as inside. The check SHALL compare the pull request's head with its base branch, so it judges only the pull request's own changes.

#### Scenario: Only character files change

- **WHEN** a pull request titled `char: add Gimdak` changes `static/characters/gimdak.yaml` and `static/characters/manifest.yaml`
- **THEN** the `character work` check passes

#### Scenario: A file in a subfolder of static/characters

- **WHEN** a pull request titled `char: add Gimdak's notes` adds `static/characters/notes/gimdak.md`
- **THEN** the `character work` check passes

#### Scenario: App code changes

- **WHEN** a pull request titled `char: add Gimdak` changes `static/characters/gimdak.yaml` and `src/lib/character/pools.ts`
- **THEN** the `character work` check fails

#### Scenario: A file outside is deleted

- **WHEN** a pull request titled `char: tidy Sunny` deletes `docs/notes.md`
- **THEN** the `character work` check fails

#### Scenario: A rename out of static/characters

- **WHEN** a pull request titled `char: move Sunny` renames `static/characters/sunny.yaml` to `docs/sunny.yaml`
- **THEN** the `character work` check fails

#### Scenario: A rename into static/characters

- **WHEN** a pull request titled `char: add Sunny` renames `docs/sunny.yaml` to `static/characters/sunny.yaml`
- **THEN** the `character work` check fails

#### Scenario: A stacked pull request

- **WHEN** a pull request titled `char: add Gimdak` targets a branch that changes `src/lib/character/pools.ts`, and the pull request itself changes only `static/characters/gimdak.yaml`
- **THEN** the `character work` check passes

### Requirement: A pull request without the mark passes the character work check

The `character work` check SHALL pass on a pull request whose title does not start with `char:`, whatever files it changes. Only the exact, lowercase prefix counts: a title that starts with `Char:` or with a space before `char:` is not marked. Its log SHALL say that the pull request is not marked as character work.

#### Scenario: A feature pull request changes character files and code

- **WHEN** a pull request titled `feat: add spell slots` changes `static/characters/sunny.yaml` and `src/lib/character/pools.ts`
- **THEN** the `character work` check passes
- **AND** its log says that the pull request is not marked as character work

#### Scenario: The mark is not at the start

- **WHEN** a pull request titled `fix: char: typo` changes `src/app.html`
- **THEN** the `character work` check passes

#### Scenario: The mark is not lowercase

- **WHEN** a pull request titled `Char: add Gimdak` changes `src/app.html`
- **THEN** the `character work` check passes
- **AND** its log says that the pull request is not marked as character work

#### Scenario: A space comes before the mark

- **WHEN** a pull request titled ` char: add Gimdak` changes `src/app.html`
- **THEN** the `character work` check passes
- **AND** its log says that the pull request is not marked as character work

### Requirement: Editing the title re-runs the character work check

CI SHALL run the `character work` check again when a pull request's title is edited, and judge the pull request by its new title.

#### Scenario: The mark is added

- **WHEN** the title of a pull request that changes `src/app.html` is edited from `feat: add Gimdak` to `char: add Gimdak`
- **THEN** the `character work` check runs again and fails

#### Scenario: The mark is removed

- **WHEN** the title of a pull request that changes `src/app.html` is edited from `char: add Gimdak` to `feat: add Gimdak`
- **THEN** the `character work` check runs again and passes

### Requirement: A failed character work check says what to fix

When the `character work` check fails, its log SHALL list every changed path outside `static/characters/`, one per line. It SHALL then give the Author two ways to fix it: move that change to its own issue and pull request, or remove the `char:` mark from the title if the pull request is not character work.

#### Scenario: Two outside paths

- **WHEN** a pull request titled `char: add Gimdak` changes `static/characters/gimdak.yaml`, `src/lib/character/pools.ts` and `README.md`
- **THEN** the `character work` check's log lists `src/lib/character/pools.ts` and `README.md`, and does not list `static/characters/gimdak.yaml`
- **AND** the log says to move those changes to their own issue and pull request, or to remove the `char:` mark if the pull request is not character work
