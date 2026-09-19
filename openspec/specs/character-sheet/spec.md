# character-sheet Specification

## Purpose

Resolves a clean character URL by its logical id and renders the character's identity header. This is the front door a player uses to open a sheet by deep link.

## Requirements

### Requirement: Logical-id routing

The system SHALL resolve the path `/:id` by treating the path segment as a logical character id and loading it through the data provider. The route SHALL NOT reference a file name.

#### Scenario: Deep link resolves a character

- **WHEN** a player opens `/sunny` and the provider returns `found`
- **THEN** the header shows the text "Sunny Thornwood"

#### Scenario: Not-found id shows a generic message

- **WHEN** a player opens `/:id` and the provider returns `not-found`
- **THEN** the page shows the fixed text "Character not found"
- **AND** the message does not echo the requested id
- **AND** no uncaught error is raised

#### Scenario: Invalid id shows a generic message

- **WHEN** a player opens `/:id` and the provider returns `invalid`
- **THEN** the page shows the fixed text "Character not found"
- **AND** the message does not echo the requested id

#### Scenario: Transient error shows a retry message

- **WHEN** a player opens `/:id` and the provider returns `error`
- **THEN** the page shows the fixed text "Could not load this character. Try again."
- **AND** no uncaught error is raised

### Requirement: Identity header rendering

The system SHALL render an identity header showing the character's name and a descriptor line built from level and class.

#### Scenario: Name and descriptor render

- **WHEN** a character with name "Sunny Thornwood", level 6, and class "Druid" loads
- **THEN** the header shows the text "Sunny Thornwood"
- **AND** the header shows the text "Level 6 Druid"

### Requirement: Descriptor line tolerates missing fields

The system SHALL build the descriptor line from a pure function of level and class. The function SHALL prefix level with "Level " only when level is present. It SHALL join the present parts with a single space. It SHALL return an empty string when neither part is present. When the descriptor is empty, the header SHALL show the name alone. The function SHALL NOT throw on a missing or wrong-typed field.

#### Scenario: Level only

- **WHEN** the function receives level 6 and no class
- **THEN** it returns the string "Level 6"

#### Scenario: Class only

- **WHEN** the function receives class "Druid" and no level
- **THEN** it returns the string "Druid"

#### Scenario: Neither level nor class

- **WHEN** the function receives neither a level nor a class
- **THEN** it returns an empty string
- **AND** the header shows the name with no descriptor element

#### Scenario: Class printed as authored

- **WHEN** the function receives class "druid" in lowercase
- **THEN** it returns "druid" with the same casing it received
