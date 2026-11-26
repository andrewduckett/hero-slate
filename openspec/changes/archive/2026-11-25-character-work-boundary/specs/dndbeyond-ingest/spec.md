<!-- Plain language: Name the actor, condition and observable result. Explain necessary domain terms using the agreed glossary. Keep requirement and scenario headings and WHEN/THEN syntax exactly as required. -->

## ADDED Requirements

### Requirement: The skill changes only character files

The skill does character work, as the glossary defines it. It SHALL create or change files only under `static/characters/` and `.workspace/`. It SHALL NOT create or change any other file, such as app code, tests, specs, or skill instructions.

These scenarios describe skill behavior. A scripted manual walkthrough of the skill validates them, not an automated test.

#### Scenario: A new sheet touches only character files

- **WHEN** the skill takes the Author from a character reference to a written file `static/characters/sunny.yaml`
- **THEN** every file the skill created or changed is under `static/characters/` or `.workspace/`

### Requirement: An app change waits for its own workflow

When the Author asks for a change outside `static/characters/` and `.workspace/`, the skill SHALL NOT make it. It SHALL tell the Author that the change starts as an issue through `lets-shape`, and that `lets-go` builds it later, on its own branch and pull request, in a run the Author can start once the sheet is done.

These scenarios describe skill behavior. A scripted manual walkthrough of the skill validates them, not an automated test.

#### Scenario: The Author asks for an app change now

- **WHEN** the Author asks the skill to raise the app's 100-use pool limit so a pool of 120 uses fits
- **THEN** the skill changes no file outside `static/characters/` and `.workspace/`
- **AND** it tells the Author that the change starts as an issue through `lets-shape` and is built later through `lets-go`

### Requirement: The skill recommends only what the sheet supports

The skill SHALL recommend only entries that the app reads and draws today, as the specs `character-data`, `character-sheet`, `resource-pools`, `custom-sections`, `character-links`, `rich-text`, and `theming` define them. The skill SHALL treat a preview warning that the app drops an entry as evidence that the entry is unsupported.

These scenarios describe skill behavior. A scripted manual walkthrough of the skill validates them, not an automated test.

#### Scenario: A draft of recommended entries draws whole

- **WHEN** the Author keeps every pool, section, row, and link the skill recommended for Sunny, and the skill runs the preview tool
- **THEN** the preview shows no warning that the app drops an entry

#### Scenario: A dropped entry is a gap

- **WHEN** the preview warns that the app drops a link to `http://example.com/map`
- **THEN** the skill tells the Author that the sheet cannot show that link
- **AND** it follows the gap steps in "A gap in the sheet format becomes an issue"

### Requirement: A gap in the sheet format becomes an issue

A *gap* is something the Author wants that the sheet format cannot express. On a gap, the skill SHALL, in order:
1. Say that the sheet cannot do it.
2. Offer the nearest supported choice, such as prose in a custom section row.
3. Offer to open an issue for it through `lets-shape`.
4. Carry on with the sheet, whether the Author accepts or declines each offer.

These scenarios describe skill behavior. A scripted manual walkthrough of the skill validates them, not an automated test.

#### Scenario: A pool too large for the app

- **WHEN** the Author wants to keep a limited use with a maximum of 120 uses
- **THEN** the skill tells the Author that the app tracks at most 100 uses and would drop that pool
- **AND** it offers a supported choice, such as a section row that names the 120 uses in prose
- **AND** it offers to open an issue through `lets-shape` for larger pools
- **AND** it goes on to the next step of the flow

#### Scenario: The Author declines the issue

- **WHEN** the skill offers to open an issue for a gap and the Author declines
- **THEN** the skill opens no issue
- **AND** it goes on to the next step of the flow

### Requirement: A commit of character work holds only character files

The skill SHALL NOT commit. When the Author asks an agent to commit the character work, the commit SHALL hold only files under `static/characters/`. When the working tree holds other changes, the agent SHALL leave them out of the commit and tell the Author which files it left out.

These scenarios describe skill behavior. A scripted manual walkthrough of the skill validates them, not an automated test.

#### Scenario: The skill does not commit

- **WHEN** the write tool saves `static/characters/sunny.yaml`
- **THEN** the skill makes no commit

#### Scenario: Other changes stay out of a character commit

- **WHEN** the Author asks the agent to commit Gimdak's new sheet, and the working tree also changes `src/lib/character/pools.ts`
- **THEN** the commit holds `static/characters/gimdak.yaml` and no file outside `static/characters/`
- **AND** the agent tells the Author that it left `src/lib/character/pools.ts` out of the commit
