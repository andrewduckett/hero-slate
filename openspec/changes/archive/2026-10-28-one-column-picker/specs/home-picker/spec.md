## ADDED Requirements

### Requirement: Cards sit in one column

The system SHALL show the cards at `/` in a single column at every viewport width, one card per row, each card as wide as the home page's content. A reviewer SHALL confirm this in a browser, because the test environment does not compute layout.

#### Scenario: One column on a landscape tablet

- **WHEN** a reviewer opens `/` with at least two characters listed, in a browser 1024 CSS pixels wide
- **THEN** each card sits on its own row, below the one before it
- **AND** each card's width equals the width of the home page content, which is at most 44rem
- **AND** the reviewer records the check

#### Scenario: One column on a phone

- **WHEN** a reviewer opens `/` with at least two characters listed, in a browser 360 CSS pixels wide
- **THEN** each card sits on its own row
- **AND** the page does not scroll sideways
- **AND** the reviewer records the check
