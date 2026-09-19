## ADDED Requirements

### Requirement: Sheet block order

The system SHALL render a loaded character's blocks in one fixed order. The order
SHALL be: the identity header, the abilities block, the combat block, the hit points
tracker, the resource pools, and then the custom sections. The system SHALL skip a
block that does not render, and it SHALL keep the remaining blocks in this order.
Custom sections SHALL keep their authored order among themselves.

#### Scenario: A full character renders in the fixed order

- **WHEN** a character with abilities, combat entries, hit points, pools, and sections loads
- **THEN** the sheet shows, from top to bottom, the identity header, the abilities, the combat values, the hit points tracker, the pools, and the sections

#### Scenario: A missing block leaves the rest in order

- **WHEN** a character has no hit points to track but has abilities, combat entries, pools, and sections
- **THEN** the sheet shows the header, the abilities, the combat values, the pools, and the sections, in that order
- **AND** the sheet shows no hit points tracker

#### Scenario: Stats render before the trackers

- **WHEN** a character with abilities and hit points loads
- **THEN** the abilities block appears before the hit points tracker

### Requirement: Group headings

The system SHALL show a fixed heading above each group of blocks. The heading text
SHALL be "Stats" above the abilities and combat blocks, "Health" above the hit
points tracker, and "Pools" above the resource pools. The system SHALL render a
heading only when at least one block in its group renders. The custom sections keep
their own authored titles and get no group heading.

#### Scenario: Headings appear above their groups

- **WHEN** a character with abilities, combat entries, hit points, and pools loads
- **THEN** the sheet shows the headings "Stats", "Health", and "Pools", in that order
- **AND** each heading appears directly before its group's blocks

#### Scenario: A group with nothing to show has no heading

- **WHEN** a character has no hit points to track
- **THEN** the sheet shows no "Health" heading

#### Scenario: Stats heading needs only one stat block

- **WHEN** a character has combat entries but no valid abilities
- **THEN** the sheet shows the "Stats" heading above the combat block

### Requirement: Hit points controls group damage before healing

The system SHALL render the hit points adjustment controls in reading order -5, -1,
+1, +5. The two damage controls SHALL come first and the two heal controls last. A
player can then learn that one side lowers hit points and the other side raises them.

#### Scenario: Controls appear in reading order

- **WHEN** a character with hit points loads
- **THEN** the tracker's controls appear in the order -5, -1, +1, +5

### Requirement: Sheet fits a phone screen

The system SHALL lay out the sheet so that it fits a viewport 360 CSS pixels wide
without horizontal scrolling. Ability tiles SHALL wrap onto more rows when they do
not fit on one row. Each hit points control and each pool dot SHALL offer a tap
target of at least 44 by 44 CSS pixels. A reviewer SHALL confirm these properties in
a browser at 360 pixels wide, because the test environment does not compute layout.

#### Scenario: The sheet fits at phone width

- **WHEN** a reviewer opens `/sunny` in a browser 360 CSS pixels wide
- **THEN** the page does not scroll sideways
- **AND** the six ability tiles wrap onto more than one row

#### Scenario: Tracker controls are large enough to tap

- **WHEN** a reviewer measures a hit points control and a pool dot at 360 CSS pixels wide
- **THEN** each tap target is at least 44 by 44 CSS pixels
