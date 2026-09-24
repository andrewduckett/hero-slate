## MODIFIED Requirements

### Requirement: Sheet block order

The system SHALL render a loaded character's blocks in one fixed order. The order
SHALL be: the identity header, the abilities block, the combat block, the hit points
tracker, the resource pools, the custom sections, and then the links. The system
SHALL skip a block that does not render, and it SHALL keep the remaining blocks in
this order. Custom sections SHALL keep their authored order among themselves.

#### Scenario: A full character renders in the fixed order

- **WHEN** a character with abilities, combat entries, hit points, pools, sections, and links loads
- **THEN** the sheet shows, from top to bottom, the identity header, the abilities, the combat values, the hit points tracker, the pools, the sections, and the links

#### Scenario: A missing block leaves the rest in order

- **WHEN** a character has no hit points to track but has abilities, combat entries, pools, and sections
- **THEN** the sheet shows the header, the abilities, the combat values, the pools, and the sections, in that order
- **AND** the sheet shows no hit points tracker

#### Scenario: Stats render before the trackers

- **WHEN** a character with abilities and hit points loads
- **THEN** the abilities block appears before the hit points tracker

#### Scenario: Links render after the sections

- **WHEN** a character with sections and links loads
- **THEN** the links appear after the last section

### Requirement: Group headings

The system SHALL show a fixed heading above each group of blocks. The heading text
SHALL be "Stats" above the abilities and combat blocks, "Health" above the hit
points tracker, "Pools" above the resource pools, and "Links" above the links. The
system SHALL render a heading only when at least one block in its group renders. The
custom sections keep their own authored titles and get no group heading.

#### Scenario: Headings appear above their groups

- **WHEN** a character with abilities, combat entries, hit points, pools, and links loads
- **THEN** the sheet shows the headings "Stats", "Health", "Pools", and "Links", in that order
- **AND** each heading appears directly before its group's blocks

#### Scenario: A group with nothing to show has no heading

- **WHEN** a character has no hit points to track
- **THEN** the sheet shows no "Health" heading

#### Scenario: Stats heading needs only one stat block

- **WHEN** a character has combat entries but no valid abilities
- **THEN** the sheet shows the "Stats" heading above the combat block

#### Scenario: No valid links means no Links heading

- **WHEN** a character lists only links that the sheet drops
- **THEN** the sheet shows no "Links" heading
