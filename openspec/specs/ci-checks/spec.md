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
