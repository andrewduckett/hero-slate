# custom-sections Specification

## Purpose

Custom sections let an author define ordered groups of titled freeform prompts in
a character's YAML file. They give a player short, readable lines to act on
instead of a catalog of rules.

## Requirements

### Requirement: Authored section definitions

The system SHALL read `sections` as an ordered list of section definitions. A valid
definition SHALL be a non-array object with a non-empty string `title`. `color` SHALL
be optional and, when present, SHALL be a string. `rows` SHALL be optional and, when
present, SHALL be an array. The system SHALL keep valid sections in authored order.
It SHALL silently ignore any invalid definition. When `color` is absent, the system
SHALL use the neutral palette. When `color` is present but unknown, the system SHALL
treat it as valid data and fall back to the neutral palette when rendering. The system
SHALL access all section and row properties with own-key-safe reads.

#### Scenario: Valid sections keep their authored order

- **WHEN** a character defines a "Your Turn" section followed by a "Strengths" section
- **THEN** the system renders "Your Turn" before "Strengths"

#### Scenario: A section with no title is not rendered

- **WHEN** a section definition omits `title`
- **THEN** the system does not render that section
- **AND** it renders any valid sibling sections normally

#### Scenario: An unknown color falls back to neutral

- **WHEN** a section definition sets `color` to an unknown palette name
- **THEN** the system renders the section with the neutral palette

#### Scenario: No sections hides the block

- **WHEN** a character has no `sections` field
- **THEN** the system renders no custom-sections block

#### Scenario: A section with no valid rows is omitted entirely

- **WHEN** a section has a valid title but its `rows` contains no valid row definitions
- **THEN** the system does not render that section's heading or any content for it

### Requirement: Section heading color

The system SHALL render a section's heading only when that section has at least one
valid row. It SHALL render the heading with the section's named palette as a
background color and the on-accent text color on top. It SHALL derive these colors
from `--accent` and `--on-accent` CSS custom properties set by the `data-palette`
attribute on the section container.

#### Scenario: Section heading uses accent background

- **WHEN** a section defines `color: forest`
- **THEN** the section heading renders with the forest palette's accent background
- **AND** the heading text renders in the forest palette's on-accent color

### Requirement: Row definitions within a section

The system SHALL read each section's `rows` as an ordered list of row definitions.
A valid row definition SHALL be a non-array object with a non-empty string `body`.
`title` SHALL be optional and, when present, SHALL be a non-empty string. `color`
SHALL be optional and, when present, SHALL be a string. The system SHALL keep valid
rows in authored order within their section. It SHALL silently ignore any invalid
row definition.

#### Scenario: Valid rows keep their authored order

- **WHEN** a section defines an "Attack" row followed by a "Help" row
- **THEN** the system renders "Attack" before "Help" within that section

#### Scenario: A row with no body is not rendered

- **WHEN** a row definition omits `body`
- **THEN** the system does not render that row
- **AND** it renders any valid sibling rows normally

#### Scenario: A row without a title renders body only

- **WHEN** a row definition has a `body` but no `title`
- **THEN** the system renders the body without a title column

### Requirement: Row title color

The system SHALL render each row's title as text in the row's resolved palette
accent color. When a row has no `color`, it SHALL inherit the section's palette.
When a row specifies an unknown `color` name, it SHALL fall back to the neutral
palette. The accent color used as text on the sheet surface SHALL meet WCAG AA
(4.5:1) for every named palette in both light and dark modes.

#### Scenario: Row title inherits section color when row color is absent

- **WHEN** a row has no `color` and its section has `color: sun`
- **THEN** the row title renders in the sun palette's accent color

#### Scenario: Row title uses its own color when present

- **WHEN** a row defines `color: ocean` inside a section with `color: forest`
- **THEN** the row title renders in the ocean palette's accent color

#### Scenario: Unknown row color falls back to neutral

- **WHEN** a row specifies an unknown color name
- **THEN** the row title renders in the neutral palette's accent color

#### Scenario: Row title accent meets WCAG AA contrast on the surface

- **WHEN** the system renders a row title in any named palette's accent color
- **THEN** the contrast ratio against the base surface meets 4.5:1 in both light and dark modes
