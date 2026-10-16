## MODIFIED Requirements

### Requirement: Draft validation

The preview tool SHALL read a drafted character file and check it before it draws anything. These are **errors**:
- The file is not parseable YAML, or its top level is not a mapping.
- The file would fail the character provider's identity checks for `name`, `level`, `class`, or `color`.
- The logical id does not match the provider's id grammar.
- The file sets an `id` that differs from the target logical id.

These are **warnings**:
- The character's `color` is not a palette name. The app would fall back to neutral.
- The app would silently drop an entry in `abilities`, `combat`, or `pools`.
- A `pools` entry has an integer `max` above 100. This warning SHALL name the pool and say that the app tracks at most 100 uses.
- A `pools` entry's `color` is not a palette name. The app would fall back to neutral.
- `hitPoints.max` is present but is not an integer greater than 0.
- The app would silently drop a `sections` entry, or a row inside a section.
- A section's or a row's `color` is not a palette name. The app would fall back to neutral.

The preview tool SHALL list every error and warning. It SHALL exit with code 1 when there is at least one error.

#### Scenario: A missing name is an error

- **WHEN** the draft has no `name`
- **THEN** the preview reports an error
- **AND** it exits with code 1

#### Scenario: An unknown color is a warning

- **WHEN** the draft sets `color: purple`
- **THEN** the preview warns that `purple` is not a palette name and will fall back to neutral
- **AND** it still draws the preview

#### Scenario: A pool above the dot limit is a warning

- **WHEN** the draft has a pool labelled `Sorcery Points` with `max: 120`
- **THEN** the preview warns that the app would drop a `pools` entry
- **AND** it warns that `Sorcery Points` has a maximum of 120, and the app tracks at most 100 uses
- **AND** it exits with code 0

#### Scenario: A repeated pool id is a warning

- **WHEN** two draft pools share the id `slots-1`
- **THEN** the preview warns that the app would drop a `pools` entry

#### Scenario: A row with no body is a warning

- **WHEN** a draft section has a row with a `title` and no `body`
- **THEN** the preview warns that the app would drop a row in that section
- **AND** it exits with code 0

#### Scenario: A section with no rows is a warning

- **WHEN** a draft section titled `Your Turn` has an empty `rows` list
- **THEN** the preview warns that the app would drop a `sections` entry

#### Scenario: An unknown section color is a warning

- **WHEN** a draft section sets `color: purple`
- **THEN** the preview warns that `purple` is not a palette name and will fall back to neutral
