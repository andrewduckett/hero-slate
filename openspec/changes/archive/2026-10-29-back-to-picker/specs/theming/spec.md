## MODIFIED Requirements

### Requirement: Manual mode toggle

The system SHALL show a control in the home page's identity header, at `/`, that switches the app between light and dark by hand. A sheet route SHALL NOT show the control; the chosen mode applies to every route all the same. Activating the control SHALL switch the page to the other mode at once, with no reload. A chosen mode SHALL override the device preference until the player chooses again.

The control SHALL be a button with an accessible name that states its action. The control SHALL be operable by keyboard. The control SHALL expose its current state to assistive technology, so a player using a screen reader can tell which mode is active.

#### Scenario: Toggling switches the mode

- **WHEN** a player views the home page in dark mode and activates the toggle
- **THEN** the page switches to light mode at once, with no reload

#### Scenario: A choice overrides the device preference

- **WHEN** a player on a dark-preferring device chooses light
- **THEN** the app renders in light mode
- **AND** it stays in light mode though the device prefers dark

#### Scenario: The toggle is present without a character

- **WHEN** a player opens `/`, the route that renders no character
- **THEN** the identity header contains the mode toggle
- **AND** the toggle switches the mode

#### Scenario: A sheet shows no toggle

- **WHEN** a player opens `/:id`, whether the character is found, not found or fails to load
- **THEN** the page contains no mode toggle

#### Scenario: The toggle is a labeled, keyboard-operable button

- **WHEN** a test inspects the toggle control
- **THEN** the control is a button with an accessible name
- **AND** it is reachable and operable by keyboard
- **AND** it exposes whether light or dark is active
