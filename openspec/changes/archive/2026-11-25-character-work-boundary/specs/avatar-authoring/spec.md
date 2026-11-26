<!-- Plain language: Name the actor, condition and observable result. Explain necessary domain terms using the agreed glossary. Keep requirement and scenario headings and WHEN/THEN syntax exactly as required. -->

## ADDED Requirements

### Requirement: The skill changes only character files

The skill does character work, as the glossary defines it. It SHALL create or change files only under `static/characters/` and `.workspace/`. It SHALL NOT create or change any other file, such as app code, tests, specs, the style guide, or skill instructions.

These scenarios describe skill behavior. A scripted manual walkthrough of the skill validates them, not an automated test.

#### Scenario: A new avatar touches only character files

- **WHEN** the skill takes the Author from the id `sunny` to a saved avatar
- **THEN** every file the skill created or changed is under `static/characters/` or `.workspace/`

### Requirement: An app change waits for its own workflow

When the Author asks for a change outside `static/characters/` and `.workspace/`, the skill SHALL NOT make it. It SHALL tell the Author that the change starts as an issue through `lets-shape`, and that `lets-go` builds it later, on its own branch and pull request, in a run the Author can start once the avatar is done.

These scenarios describe skill behavior. A scripted manual walkthrough of the skill validates them, not an automated test.

#### Scenario: The Author asks for an app change now

- **WHEN** the Author asks the skill to make the sheet header show a larger avatar
- **THEN** the skill changes no file outside `static/characters/` and `.workspace/`
- **AND** it tells the Author that the change starts as an issue through `lets-shape` and is built later through `lets-go`

### Requirement: The skill offers only what the sheet supports

The skill SHALL offer only avatar choices that the app reads and draws today, as the specs `character-data` and `character-sheet` define them: one avatar image for each character.

These scenarios describe skill behavior. A scripted manual walkthrough of the skill validates them, not an automated test.

#### Scenario: One avatar for each character

- **WHEN** the skill saves an avatar for `sunny`
- **THEN** it saves one image, `static/characters/sunny.png`, and no other avatar image for Sunny

### Requirement: A gap in the sheet format becomes an issue

A *gap* is something the Author wants that the sheet format cannot express. On a gap, the skill SHALL, in order:
1. Say that the sheet cannot do it.
2. Offer the nearest supported choice.
3. Offer to open an issue for it through `lets-shape`.
4. Carry on with the avatar, whether the Author accepts or declines each offer.

These scenarios describe skill behavior. A scripted manual walkthrough of the skill validates them, not an automated test.

#### Scenario: A second picture for a Wild Shape form

- **WHEN** the Author asks for a second avatar that shows Sunny in Wild Shape
- **THEN** the skill tells the Author that the sheet shows one avatar for each character
- **AND** it offers a supported choice, such as one avatar whose look hints at the Wild Shape form
- **AND** it offers to open an issue through `lets-shape` for more than one avatar
- **AND** it goes on with the one avatar

#### Scenario: The Author declines the issue

- **WHEN** the skill offers to open an issue for a gap and the Author declines
- **THEN** the skill opens no issue
- **AND** it goes on with the avatar

### Requirement: A commit of character work holds only character files

The skill SHALL NOT commit. When the Author asks an agent to commit the character work, the commit SHALL hold only files under `static/characters/`. When the working tree holds other changes, the agent SHALL leave them out of the commit and tell the Author which files it left out.

These scenarios describe skill behavior. A scripted manual walkthrough of the skill validates them, not an automated test.

#### Scenario: The skill does not commit

- **WHEN** the avatar tool saves `static/characters/sunny.png`
- **THEN** the skill makes no commit

#### Scenario: Other changes stay out of a character commit

- **WHEN** the Author asks the agent to commit Sunny's new avatar, and the working tree also changes `src/lib/components/Header.svelte`
- **THEN** the commit holds `static/characters/sunny.png` and `static/characters/sunny.yaml`, and no file outside `static/characters/`
- **AND** the agent tells the Author that it left `src/lib/components/Header.svelte` out of the commit
