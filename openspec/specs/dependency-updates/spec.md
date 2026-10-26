# dependency-updates Specification

## Purpose

Keeps every pinned dependency current through update pull requests that the maintainer reviews and merges, and turns each security alert into its own pull request.

## Requirements

### Requirement: Updates cover every pinned dependency file
The update bot SHALL track the dependencies pinned in these places:

- `package.json` and `package-lock.json`
- the actions in `.github/workflows/`, and the Renovate and Node versions the Renovate workflow pins
- the tools in `mise.toml`

#### Scenario: A mise tool falls behind
- **WHEN** `mise.toml` pins gh at `2.102` and gh 2.103.0 is released
- **THEN** the update bot opens a pull request that changes the gh pin in `mise.toml`

#### Scenario: The dashboard lists what was found
- **WHEN** the update bot has run on `main`
- **THEN** the Dependency Dashboard issue lists dependencies from each of `package.json`, `.github/workflows/` and `mise.toml`

### Requirement: Node is pinned in one place
`mise.toml` SHALL be the only file that pins the Node version. The repository SHALL hold no `.nvmrc`.

#### Scenario: A new Node major
- **WHEN** `mise.toml` pins `node = "26"` and Node 28 is released
- **THEN** one update pull request changes the Node pin, and it changes only `mise.toml`

### Requirement: An npm update moves the range in package.json
An npm update SHALL change the version range in `package.json` to the new version, and update `package-lock.json` to match. An exact pin SHALL stay exact.

#### Scenario: A patch inside the range
- **WHEN** `package.json` lists `"jsdom": "^30.1.3"` and jsdom 30.1.4 is released
- **THEN** the weekly npm pull request changes the entry to `"^30.1.4"` and moves `package-lock.json` to 30.1.4

#### Scenario: An exact pin
- **WHEN** `package.json` lists `"vite-node": "6.0.0"` and vite-node 6.0.1 is released
- **THEN** the weekly npm pull request changes the entry to `"6.0.1"`

### Requirement: Minor and patch updates arrive weekly, grouped by ecosystem
The update bot SHALL open at most one pull request a week for each ecosystem, holding all of that ecosystem's minor and patch updates. The ecosystems are npm, GitHub Actions and `mise.toml`. The npm pull request SHALL hold both `dependencies` and `devDependencies`.

#### Scenario: A dependency and a dev dependency get patch releases
- **WHEN** `yaml` and `vitest` both get patch releases in the same week
- **THEN** one pull request updates both

#### Scenario: Updates in two ecosystems
- **WHEN** an action and an npm package both get minor releases in the same week
- **THEN** they arrive in two pull requests, one per ecosystem

### Requirement: Each major update arrives on its own
The update bot SHALL open a separate pull request for each major update, never grouped with other updates.

#### Scenario: A major and a minor in one week
- **WHEN** `vite` gets a major release and `svelte` gets a minor release in the same week
- **THEN** the `vite` major arrives in its own pull request, and the `svelte` minor arrives in the weekly npm pull request

### Requirement: Let's Spec updates arrive on their own
The update bot SHALL open a separate pull request for each Let's Spec update, of any size, never grouped with other `mise.toml` tools.

#### Scenario: Let's Spec and gh move in the same week
- **WHEN** Let's Spec and gh both get minor releases in the same week
- **THEN** Let's Spec arrives in its own pull request, and gh arrives in the weekly `mise.toml` pull request

### Requirement: A Let's Spec update carries what `lets sync` writes
A Let's Spec update pull request SHALL include the files `lets sync` writes for the new version. `mise install` and `lets sync --check` SHALL then pass on it without a hand edit.

#### Scenario: Let's Spec moves to a new minor
- **WHEN** the update bot opens the pull request that moves Let's Spec from 0.6.0 to 0.7.0
- **THEN** the pull request holds the `mise.toml` change and the files `lets sync` wrote, and the `lets sync --check` check passes

### Requirement: The update bot runs no other commands
The update bot SHALL run `lets sync` as its only command after an update. A repository config that asks for any other command SHALL NOT run it.

#### Scenario: A config asks for another command
- **WHEN** the repository's update config asks to run `rm -rf docs` after an update
- **THEN** the update bot does not run it, and reports the command as not allowed

### Requirement: The OpenSpec CLI updates on its own
The update bot SHALL update the OpenSpec CLI pin in `mise.toml` like any other tool, without tying it to the Let's Spec version.

#### Scenario: OpenSpec releases without Let's Spec
- **WHEN** OpenSpec 1.14.0 is released and Let's Spec does not move
- **THEN** the weekly `mise.toml` pull request moves the OpenSpec pin to 1.14.0

### Requirement: Security fixes arrive at once, on their own
When a Dependabot alert reports a vulnerable dependency, the update bot SHALL open a separate pull request that moves it to a fixed version. The pull request's title SHALL end with `[SECURITY]`, it SHALL carry the label `security`, and it SHALL ignore the weekly schedule.

#### Scenario: An alert on an npm package
- **WHEN** a Dependabot alert opens on Tuesday for a package in `package-lock.json`, and a fixed version exists
- **THEN** by the end of the next daily run, a pull request whose title ends with `[SECURITY]` moves that package to the fixed version, and it is labelled `security`

### Requirement: The update bot runs every day
The update bot SHALL run once a day on `main`.

#### Scenario: A day passes
- **WHEN** 24 hours pass
- **THEN** the update workflow has run once on `main`

### Requirement: Update pull requests run CI
Update pull requests SHALL trigger the CI workflows, so the CodeQL and `lets sync --check` checks run on them.

#### Scenario: A weekly npm pull request opens
- **WHEN** the update bot opens the weekly npm pull request
- **THEN** the CodeQL and `lets sync --check` checks run on it

### Requirement: Nothing merges automatically
The update bot SHALL NOT merge any pull request. The maintainer merges every update.

#### Scenario: All checks pass
- **WHEN** every check passes on an update pull request
- **THEN** the pull request stays open until the maintainer merges it

### Requirement: Update pull requests follow the commit conventions
Update commits SHALL start with the Conventional Commits prefix `chore(deps):` in every ecosystem. Update pull requests SHALL carry the label `dependencies`.

#### Scenario: A production dependency update
- **WHEN** the update bot opens a pull request that updates `yaml`
- **THEN** its commit message starts with `chore(deps):` and it has the label `dependencies`

#### Scenario: An Actions update
- **WHEN** the update bot opens a GitHub Actions pull request
- **THEN** its commit message starts with `chore(deps):`

### Requirement: The Dependency Dashboard stays open
The update bot SHALL keep one open Dependency Dashboard issue. It lists the dependencies found and the updates being held back. Ticking an update's box there SHALL produce that pull request at the next daily run.

#### Scenario: The maintainer asks for a held-back update
- **WHEN** the maintainer ticks a held-back update on the Dependency Dashboard
- **THEN** that update's pull request opens at the next daily run

### Requirement: A broken update config fails CI
CI SHALL validate the update config on every pull request that changes the config or the update workflow, and fail when the config is invalid.

#### Scenario: A typo in the config
- **WHEN** a pull request changes the update config to hold an unknown option
- **THEN** CI reports a failed config check on that pull request

### Requirement: Dependabot only raises alerts
The repository SHALL have the dependency graph and Dependabot alerts on. Dependabot SHALL NOT open version update or security update pull requests.

#### Scenario: A vulnerable package is found
- **WHEN** a dependency in `package-lock.json` has a published advisory
- **THEN** a Dependabot alert opens, and Dependabot opens no pull request for it
