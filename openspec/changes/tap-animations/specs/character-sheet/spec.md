## ADDED Requirements

### Requirement: Hit points changes ease into place

When current hit points change, the hit points bar's fill SHALL ease from its old
width to its new width with the shared motion timing. When the tracker enters or
leaves the calm down state, its opacity SHALL ease with the same timing. The
readout number SHALL change at once, with no count-up or tick. The bar SHALL show
its resolved width on first render, with no easing from empty. A test reads the
tracker's styles to assert which properties ease; a reviewer confirms the feel by
visual review.

#### Scenario: The fill bar eases its width

- **WHEN** a test reads the hit points tracker's styles
- **THEN** the bar's fill transitions its width with the shared motion duration and easing

#### Scenario: The down state eases its opacity

- **WHEN** a test reads the hit points tracker's styles
- **THEN** the tracker transitions its opacity with the shared motion duration and easing
- **AND** no transition on the tracker names a literal duration

#### Scenario: The readout changes at once

- **WHEN** a character has 30 of 45 hit points and a player taps -1
- **THEN** the readout shows "29 / 45" straight after the tap
