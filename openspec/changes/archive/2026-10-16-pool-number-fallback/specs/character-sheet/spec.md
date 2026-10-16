## MODIFIED Requirements

### Requirement: Sheet fits a phone screen

The system SHALL lay out the sheet so that it fits a viewport 360 CSS pixels wide
without horizontal scrolling. Ability tiles SHALL wrap onto more rows when they do
not fit on one row. Each hit points control and each pool control, whether a pool
dot or a pool counter button, SHALL offer a tap target of at least 44 by 44 CSS
pixels. A reviewer SHALL confirm these properties in a browser at 360 pixels wide,
because the test environment does not compute layout.

#### Scenario: The sheet fits at phone width

- **WHEN** a reviewer opens `/sunny` in a browser 360 CSS pixels wide
- **THEN** the page does not scroll sideways
- **AND** the six ability tiles wrap onto more than one row

#### Scenario: Tracker controls are large enough to tap

- **WHEN** a reviewer measures a hit points control and a pool dot at 360 CSS pixels wide
- **THEN** each tap target is at least 44 by 44 CSS pixels

#### Scenario: Dots in a pool of more than 5 uses keep full size

- **WHEN** a reviewer opens `/urven` at 360 CSS pixels wide and measures a Focus Points dot (a pool of 7)
- **THEN** the dot is at least 44 by 44 CSS pixels
- **AND** the page does not scroll sideways

#### Scenario: Pool counter buttons are large enough to tap

- **WHEN** a reviewer opens `/gimdak` at 360 CSS pixels wide and measures each Lay On Hands counter button
- **THEN** each button is at least 44 by 44 CSS pixels
- **AND** the page does not scroll sideways
