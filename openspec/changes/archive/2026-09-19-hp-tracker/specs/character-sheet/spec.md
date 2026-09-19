## ADDED Requirements

### Requirement: Hit points resolution

The system SHALL resolve a character's hit points from the authored `hitPoints`
data and the stored current value. It SHALL read `max` from `hitPoints` only when
`max` is an integer greater than 0. Otherwise the character has no hit points to
track. It SHALL NOT read a current value from the definition. Current hit points are
store state, keyed by the character's logical id under the tracker key "hp". It SHALL
take the stored current when that value is a finite integer, then clamp it to the
range `0..max`. When no finite integer is stored, it SHALL start current at `max`.
Resolution SHALL be a pure function that never throws on missing or wrong-typed data.

#### Scenario: Full health on first load

- **WHEN** a character has `hitPoints` max 45 and no stored current
- **THEN** the resolved hit points are 45 of 45

#### Scenario: Authored current in the file is ignored

- **WHEN** a character's file sets `hitPoints` max 45 and current 20, and the store holds no value
- **THEN** the resolved hit points are 45 of 45

#### Scenario: Stored current is used

- **WHEN** a character has max 45 and a stored current of 30
- **THEN** the resolved hit points are 30 of 45

#### Scenario: A stored value above max clamps down

- **WHEN** the stored current is 45 and the author lowers max to 40
- **THEN** the resolved current is 40 of 40

#### Scenario: A stored value below zero clamps up

- **WHEN** the stored current is -1 and max is 45
- **THEN** the resolved current is 0 of 45

#### Scenario: A raised max does not heal

- **WHEN** the stored current is 40 and the author raises max to 50
- **THEN** the resolved current stays 40 of 50

#### Scenario: Non-integer max means no hit points

- **WHEN** `hitPoints` is absent, or its `max` is missing, zero, negative, fractional, or not a finite number
- **THEN** the character has no hit points to track
- **AND** no error is raised

#### Scenario: Non-integer stored current starts at max

- **WHEN** a character has max 45 and a stored current that is fractional or not a finite number
- **THEN** the resolved hit points are 45 of 45

### Requirement: Reduced max persists the clamped current

The system SHALL persist the clamped current when load-time resolution lowers it to
fit a reduced max. The lower value then becomes the stored truth. A later raised max
therefore does not restore the lost hit points. When that write fails, the system
SHALL still show the clamped value for the session. The earlier stored value may
reappear on a later load, which is the accepted per-device fallback.

#### Scenario: Lowered then raised max does not heal

- **WHEN** the stored current is 45, the author lowers max to 40 and the sheet loads, then the author raises max to 50 and the sheet loads again
- **THEN** the resolved hit points are 40 of 50 on the second load

### Requirement: State loads before the tracker accepts taps

The system SHALL read the stored current before the tracker accepts an adjustment. It
SHALL NOT show interactive controls while that read is pending. A load SHALL bind
state only for the currently requested id. When the route id changes while a read is
in flight, the system SHALL discard the late read for the previous id. The system
SHALL issue the reduced-max write-back before the controls accept taps, so a later
tap wins over the write-back. These rules hold even when the store resolves slowly.

#### Scenario: A late read for a previous id is discarded

- **WHEN** the route id changes from "sunny" to "ash" while sunny's stored current is still being read, and that read then completes
- **THEN** the tracker shows ash's resolved hit points, not sunny's

#### Scenario: A tap after reduced-max load is not overwritten

- **WHEN** a reduced max clamps current on load, the controls become interactive, and a player taps -1 before the write-back settles
- **THEN** a later read returns the tapped value, not the clamped value

### Requirement: Hit points tracker rendering

The system SHALL render a hit points tracker from the resolved hit points. It SHALL
show a `current / max` readout as text. It SHALL render the bar as an element with an
accessible progress role. That element SHALL expose the current value, a minimum of
0, and the maximum. A test then asserts the fill from those values, not from pixels.
It SHALL show adjustment controls for -5, -1, +1, and +5. It SHALL NOT show a reset
control, because a player restores hit points by tapping up. When the character has
no hit points to track, the system SHALL NOT render the tracker.

#### Scenario: Tracker shows readout, bar, and controls

- **WHEN** a character resolves to 30 of 45 hit points
- **THEN** the tracker shows the readout "30 / 45"
- **AND** the bar exposes current 30, minimum 0, and maximum 45 through its progress role
- **AND** the tracker shows -5, -1, +1, and +5 controls

#### Scenario: No hit points hides the tracker

- **WHEN** a character has no hit points to track
- **THEN** the sheet renders no hit points tracker
- **AND** no error is raised

### Requirement: Hit points adjustment and persistence

The system SHALL change current hit points when a player taps an adjustment control.
It SHALL add or subtract that control's integer amount. It SHALL clamp the result to
the range `0..max`, so current never drops below 0 or rises above max. It SHALL
persist the new current through the state store, under the character's logical id and
the tracker key "hp". The value then returns on the next load. A failed write SHALL
NOT block the on-screen change.

#### Scenario: Adjusting changes and persists current

- **WHEN** a player at 30 of 45 taps -5
- **THEN** the readout shows "25 / 45"
- **AND** reopening the sheet shows 25 of 45

#### Scenario: Down-tap clamps at zero

- **WHEN** a player at 3 of 45 taps -5
- **THEN** the readout shows "0 / 45"

#### Scenario: Up-tap clamps at max

- **WHEN** a player at 43 of 45 taps +5
- **THEN** the readout shows "45 / 45"

### Requirement: Calm state at zero hit points

The system SHALL set the attribute `data-hp-state="down"` on the tracker when current
hit points reach 0. It SHALL remove that attribute when current rises above 0. The
down state SHALL dim the tracker with reduced opacity. It SHALL NOT flash, shake, or
use an alarm color. A test asserts the attribute and the reduced opacity; a reviewer
confirms the calm resting look by visual review. The tracker SHALL stay usable at 0,
so a player can tap back up.

#### Scenario: Zero applies the down state

- **WHEN** a character's current hit points reach 0
- **THEN** the tracker carries `data-hp-state="down"`
- **AND** the tracker is dimmed with reduced opacity
- **AND** the +1 and +5 controls still restore hit points

#### Scenario: Above zero clears the down state

- **WHEN** a character's current hit points rise above 0
- **THEN** the tracker no longer carries `data-hp-state="down"`
- **AND** the tracker is no longer dimmed
