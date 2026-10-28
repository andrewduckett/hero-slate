## MODIFIED Requirements

### Requirement: Sheet block order

The system SHALL render a loaded character's blocks in one fixed order. The order
SHALL be: the identity header, the abilities block, the combat block, the hit points
tracker, the resource pools, the custom sections, and then the links. The system
SHALL skip a block that does not render, and it SHALL keep the remaining blocks in
this order. Custom sections SHALL keep their authored order among themselves. The
document order, and so the reading and keyboard focus order, SHALL be this fixed
order at every viewport width. In a single-column layout the blocks SHALL appear
from top to bottom in this order. In the two-column layout the header SHALL come
first. The left column SHALL follow, from top to bottom, and then the right column,
from top to bottom. Together they SHALL keep this order.

#### Scenario: A full character renders in the fixed order

- **WHEN** a character with abilities, combat entries, hit points, pools, sections, and links loads
- **THEN** the sheet's document order is the identity header, the abilities, the combat values, the hit points tracker, the pools, the sections, and the links

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

#### Scenario: Focus order follows the fixed order in two columns

- **WHEN** a reviewer opens `/urven` in a browser 1280 by 800 CSS pixels and presses Tab repeatedly from the top of the page
- **THEN** focus reaches the hit points controls, then the pool controls, then the link chips, in that order

### Requirement: Sheet fits a phone screen

The system SHALL lay out the sheet so that it fits a viewport 360 CSS pixels wide
without horizontal scrolling. Each hit points control and each pool control, whether
a pool dot or a pool counter button, SHALL offer a tap target of at least 44 by 44
CSS pixels. A reviewer SHALL confirm these properties in a browser at 360 pixels
wide, because the test environment does not compute layout.

#### Scenario: The sheet fits at phone width

- **WHEN** a reviewer opens `/sunny` in a browser 360 CSS pixels wide
- **THEN** the page does not scroll sideways

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

## ADDED Requirements

### Requirement: Two-column sheet on wide screens

A wide viewport is one at least 64rem wide, which is 1024 CSS pixels at the
browser's default font size. On a wide viewport, the system SHALL lay out a loaded
sheet in two columns below the identity header. The header SHALL span both columns.
The left column SHALL hold the Stats, Health, and Pools groups. The right column
SHALL hold the custom sections and then the Links group. On a narrower viewport,
the system SHALL lay out the sheet in one column.

#### Scenario: A landscape tablet shows two columns

- **WHEN** a reviewer opens `/sunny` in a browser 1280 by 800 CSS pixels
- **THEN** the identity header spans the full width of the sheet
- **AND** the Stats, Health, and Pools groups sit in the left column
- **AND** the Strengths and Your Turn sections sit in the right column
- **AND** the page does not scroll sideways

#### Scenario: Links sit at the bottom of the right column

- **WHEN** a reviewer opens `/urven` in a browser 1280 by 800 CSS pixels
- **THEN** the Links group sits in the right column, below the last section
- **AND** the page does not scroll sideways

#### Scenario: A portrait tablet keeps one column

- **WHEN** a reviewer opens `/sunny` in a browser 800 by 1280 CSS pixels
- **THEN** every group and section sits in one column, from top to bottom

### Requirement: Blocks keep their column

In the two-column layout, the system SHALL keep each block in its assigned column
whatever the column heights. It SHALL NOT move a block into the other column to
balance them.

#### Scenario: A long right column leaves the left column short

- **WHEN** a reviewer opens `/gimdak` in a browser 1280 by 800 CSS pixels
- **THEN** all six sections sit in the right column, in authored order
- **AND** no section sits in the left column below the pools
- **AND** the page does not scroll sideways

### Requirement: A sheet with one side empty uses the full width

On a wide viewport, one column may have no block to render. The system SHALL then
let the other column's blocks span the full width of the sheet.

#### Scenario: No sections and no links

- **WHEN** a character with abilities, hit points, and pools but no valid sections and no valid links loads in a viewport 1280 CSS pixels wide
- **THEN** the Stats, Health, and Pools groups span the full width of the sheet
- **AND** the six ability tiles sit in one row

#### Scenario: Only sections

- **WHEN** a character with sections but no abilities, combat entries, hit points, or pools loads in a viewport 1280 CSS pixels wide
- **THEN** the sections span the full width of the sheet

### Requirement: Wide sheet content width

On a wide viewport, the system SHALL let the sheet grow wider than 44rem. At 1280
CSS pixels wide, the sheet SHALL fill the viewport apart from its side gutters. The
home page at `/` SHALL keep its current content width
of at most 44rem at every viewport width.

#### Scenario: The sheet fills a landscape tablet

- **WHEN** a reviewer opens `/sunny` in a browser 1280 by 800 CSS pixels
- **THEN** the sheet's left and right edges each sit 16 CSS pixels from the viewport's edges

#### Scenario: The home page keeps its width

- **WHEN** a reviewer opens `/` in a browser 1280 by 800 CSS pixels
- **THEN** the page content is no wider than 44rem

### Requirement: Ability tiles sit 3 or 6 per row

The system SHALL place ability tiles either 3 or 6 per row, and never another count.
It SHALL NOT fit as many tiles per row as the width allows. Ability tiles SHALL sit 3
per row when the Stats group shares the width with the right column. They SHALL sit
6 per row in one column on a viewport 800 CSS pixels wide. They SHALL sit 3 per row
on a viewport 600 CSS pixels wide or narrower.

#### Scenario: Two columns put abilities in two rows of three

- **WHEN** a reviewer opens `/sunny` in a browser 1280 by 800 CSS pixels
- **THEN** the six ability tiles sit in two rows of three

#### Scenario: A portrait tablet puts abilities in one row

- **WHEN** a reviewer opens `/sunny` in a browser 800 by 1280 CSS pixels
- **THEN** the six ability tiles sit in one row

#### Scenario: A phone puts abilities in two rows of three

- **WHEN** a reviewer opens `/sunny` in a browser 360 CSS pixels wide
- **THEN** the six ability tiles sit in two rows of three

#### Scenario: A width between phone and tablet leaves no lone tile

- **WHEN** a reviewer opens `/sunny` in a browser 600 CSS pixels wide
- **THEN** the six ability tiles sit in two rows of three

### Requirement: Combat tiles sit 3 per row

The system SHALL place combat tiles 3 per row at every viewport width. It SHALL NOT
fit as many tiles per row as the width allows.

#### Scenario: Three combat tiles share one row at every width

- **WHEN** a reviewer opens `/sunny` in a browser 360, 800, or 1280 CSS pixels wide
- **THEN** the three combat tiles sit in one row

#### Scenario: Four combat entries leave a short last row

- **WHEN** a character with four combat entries loads in a viewport 1280 CSS pixels wide
- **THEN** three combat tiles sit in the first row and one in the second
