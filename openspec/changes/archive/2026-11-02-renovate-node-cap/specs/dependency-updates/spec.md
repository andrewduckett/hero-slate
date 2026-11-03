## ADDED Requirements

### Requirement: The update bot's own Node stays in its supported range
The update bot SHALL NOT propose a Node version for its own runner, the `RENOVATE_NODE_VERSION` pin in `.github/workflows/renovate.yml`, at or above 25. This cap keeps the runner inside the `engines.node` range of the pinned Renovate release (`^24.11.0`). The cap SHALL NOT apply to the Node pin in `mise.toml`.

#### Scenario: A Node major the update bot does not support
- **WHEN** `RENOVATE_NODE_VERSION` is `"24"` and Node 26 is released
- **THEN** the update bot opens no pull request that changes `RENOVATE_NODE_VERSION`

#### Scenario: The project's Node is not capped
- **WHEN** `mise.toml` pins `node = "26"` and Node 28 is released
- **THEN** the update bot opens a pull request that changes the Node pin in `mise.toml`
