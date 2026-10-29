## ADDED Requirements

### Requirement: Shared motion timing

The system SHALL define one shared motion timing in its stylesheets: a duration
of 200 ms and an `ease-out` easing. Every eased state change on the sheet SHALL
use that duration and easing, rather than a value of its own. An eased change
SHALL NOT flash, shake, or add an element. A test reads the stylesheets to assert
the timing; a reviewer confirms the feel by visual review.

#### Scenario: The shared timing is 200 ms ease-out

- **WHEN** a test reads the app's stylesheets
- **THEN** they define the shared motion duration as 200 ms
- **AND** they define the shared motion easing as `ease-out`

#### Scenario: No eased change uses its own timing

- **WHEN** a test reads the stylesheets of every component with an eased change
- **THEN** each transition takes its duration and easing from the shared motion timing
- **AND** no transition names a literal duration

### Requirement: Reduced motion makes changes instant

The system SHALL set the shared motion duration to 0 when the device reports
`prefers-reduced-motion: reduce`. Every eased change SHALL then reach its new state
at once. The new state itself SHALL be the same as with motion.

#### Scenario: Reduced motion sets the duration to zero

- **WHEN** a test reads the app's stylesheets
- **THEN** a `prefers-reduced-motion: reduce` media query sets the shared motion duration to 0

#### Scenario: Reduced motion keeps the end state

- **WHEN** a device reports `prefers-reduced-motion: reduce` and a player taps -1 on 30 of 45 hit points
- **THEN** the tracker shows "29 / 45" at once, with no easing
