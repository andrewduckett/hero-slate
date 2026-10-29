## ADDED Requirements

### Requirement: Pool changes ease into place

When a pool's count changes, each dot that changes state SHALL ease its fill and
border colours between filled and empty with the shared motion timing. A counter
pool's bar fill SHALL ease from its old width to its new width with the same
timing. A counter's readout number SHALL change at once. Dots and bars SHALL show
their resolved state on first render, with no easing from empty. A test reads the
pools' styles to assert which properties ease; a reviewer confirms the feel by
visual review.

#### Scenario: A dot eases between filled and empty

- **WHEN** a test reads the resource pools' styles
- **THEN** a pool dot transitions its background colour and border colour with the shared motion duration and easing

#### Scenario: A counter bar eases its width

- **WHEN** a test reads the resource pools' styles
- **THEN** a counter pool's bar fill transitions its width with the shared motion duration and easing
- **AND** no transition on the pools names a literal duration

#### Scenario: A counter readout changes at once

- **WHEN** a pool with `max` 35 has 35 remaining uses and a player selects -1
- **THEN** the pool shows `34 / 35` straight after the tap
