<!-- Plain language: Name the actor, condition and observable result. Explain necessary domain terms using the agreed glossary. Keep requirement and scenario headings and WHEN/THEN syntax exactly as required. -->

## ADDED Requirements

### Requirement: A pull request of character work is marked as character work

The skill SHALL NOT open a pull request. When the Author asks an agent to open a pull request for the character work, the agent SHALL give it a title that starts with `char:`, which makes it a character work pull request. Its commits SHALL keep their Conventional Commits types and SHALL NOT start with `char:`.

These scenarios describe skill behavior. A scripted manual walkthrough of the skill validates them, not an automated test.

#### Scenario: The Author asks for a pull request

- **WHEN** the Author asks the agent to open a pull request for Gimdak's new sheet, which changes `static/characters/gimdak.yaml`
- **THEN** the pull request's title starts with `char:`, such as `char: add Gimdak`

#### Scenario: Commits keep their types

- **WHEN** the agent commits Gimdak's new sheet for that pull request
- **THEN** the commit message starts with a Conventional Commits type, such as `feat:`, and not with `char:`
