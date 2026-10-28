## MODIFIED Requirements

### Requirement: Update pull requests run CI
Update pull requests SHALL trigger the CI workflows, so the CodeQL, `lets sync --check` and `test and build` checks run on them.

#### Scenario: A weekly npm pull request opens
- **WHEN** the update bot opens the weekly npm pull request
- **THEN** the CodeQL, `lets sync --check` and `test and build` checks run on it
