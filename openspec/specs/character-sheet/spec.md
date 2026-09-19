# character-sheet Specification

## Purpose

Resolves a clean character URL by its logical id and renders the character's identity header. This is the front door a player uses to open a sheet by deep link.

## Requirements

### Requirement: Logical-id routing

The system SHALL resolve the path `/:id` by treating the path segment as a logical character id and loading it through the data provider. The route SHALL NOT reference a file name.

#### Scenario: Deep link resolves a character

- **WHEN** a player opens `/sunny` and the provider returns `found`
- **THEN** the header shows the text "Sunny Thornwood"

#### Scenario: Not-found id shows a generic message

- **WHEN** a player opens `/:id` and the provider returns `not-found`
- **THEN** the page shows the fixed text "Character not found"
- **AND** the message does not echo the requested id
- **AND** no uncaught error is raised

#### Scenario: Invalid id shows a generic message

- **WHEN** a player opens `/:id` and the provider returns `invalid`
- **THEN** the page shows the fixed text "Character not found"
- **AND** the message does not echo the requested id

#### Scenario: Transient error shows a retry message

- **WHEN** a player opens `/:id` and the provider returns `error`
- **THEN** the page shows the fixed text "Could not load this character. Try again."
- **AND** no uncaught error is raised

### Requirement: Identity header rendering

The system SHALL render an identity header showing the character's name and a descriptor line built from level and class.

#### Scenario: Name and descriptor render

- **WHEN** a character with name "Sunny Thornwood", level 6, and class "Druid" loads
- **THEN** the header shows the text "Sunny Thornwood"
- **AND** the header shows the text "Level 6 Druid"

### Requirement: Descriptor line tolerates missing fields

The system SHALL build the descriptor line from a pure function of level and class. The function SHALL prefix level with "Level " only when level is present. It SHALL join the present parts with a single space. It SHALL return an empty string when neither part is present. When the descriptor is empty, the header SHALL show the name alone. The function SHALL NOT throw on a missing or wrong-typed field.

#### Scenario: Level only

- **WHEN** the function receives level 6 and no class
- **THEN** it returns the string "Level 6"

#### Scenario: Class only

- **WHEN** the function receives class "Druid" and no level
- **THEN** it returns the string "Druid"

#### Scenario: Neither level nor class

- **WHEN** the function receives neither a level nor a class
- **THEN** it returns an empty string
- **AND** the header shows the name with no descriptor element

#### Scenario: Class printed as authored

- **WHEN** the function receives class "druid" in lowercase
- **THEN** it returns "druid" with the same casing it received

### Requirement: Stat entries and their validity

The system SHALL read `abilities` and `combat` as lists of entries. It SHALL treat
an entry as valid only when the entry is a non-array object whose `label` is a
string with at least one non-whitespace character. It SHALL drop every other list
member — including `null`, a boolean, a number, a string, an array, and an object
with a missing, empty, whitespace-only, or non-string label. It SHALL NOT recurse
into or stringify nested objects or arrays. It SHALL keep every valid entry in the
authored order and SHALL NOT deduplicate entries: two valid entries with the same
label both render. Reading SHALL never raise an uncaught error, whatever the data.

#### Scenario: Invalid list members are dropped

- **WHEN** an abilities list contains `null`, a bare number, an array, and an object with no label, alongside one valid entry
- **THEN** the sheet renders only the one valid entry
- **AND** no error is raised

#### Scenario: Whitespace-only label is not a label

- **WHEN** an entry has a label of `"   "` (only whitespace)
- **THEN** the system drops that entry

#### Scenario: Duplicate labels both render

- **WHEN** an abilities list contains two valid entries both labeled "Strength"
- **THEN** the sheet renders both entries in order

### Requirement: Abilities block rendering

The system SHALL render an abilities block from the valid abilities entries. It
SHALL render each entry in the authored order. For each entry it SHALL show the
label, the modifier as the prominent value, and — only when the entry's `value`
is a finite number — the raw score as a small secondary value. It SHALL render
every label, modifier, and score as text content, not markup. When the resolved
abilities list is empty, the system SHALL NOT render the block.

#### Scenario: Abilities render in authored order

- **WHEN** a character lists abilities "Strength" (value 10), "Dexterity" (value 14), and "Wisdom" (value 18)
- **THEN** the sheet shows the three abilities in that order
- **AND** each shows its label, its modifier prominently, and its raw score as a small value

#### Scenario: Non-numeric value shows no raw score

- **WHEN** an ability entry has a label and a `value` that is not a finite number
- **THEN** the sheet shows no raw score for that entry

#### Scenario: Authored ability text renders as text, not markup

- **WHEN** an ability label is the string `<b>x</b>`, or a usable authored modifier is the string `<img src=x>`
- **THEN** the sheet shows that literal string as visible text
- **AND** the sheet creates no corresponding HTML element

#### Scenario: Empty resolved list hides the block

- **WHEN** a character has no valid abilities entries, whether the data is absent, not a list, or a list whose members are all invalid
- **THEN** the sheet renders no abilities block
- **AND** no error is raised

### Requirement: Ability modifier is a pure function of the score

The system SHALL compute an ability modifier as `floor((value - 10) / 2)` from a
finite numeric value, flooring toward negative infinity. It SHALL display the
modifier with a sign: "+" for zero or positive, "-" for negative. When the author
sets a usable `modifier` on an entry, the system SHALL display it verbatim in
place of the computed modifier; a usable `modifier` is a string with at least one
non-whitespace character. When an authored `modifier` is missing, not a string, or
whitespace-only, the system SHALL ignore it and use the computed modifier. When an
entry has no finite numeric value and no usable authored modifier, the system SHALL
show an em dash ("—") in place of the modifier. The function SHALL NOT throw on a
missing, null, or wrong-typed value.

#### Scenario: Modifier computed from a score

- **WHEN** the function receives a value of 14
- **THEN** it yields the modifier "+2"

#### Scenario: Zero score keeps a plus sign

- **WHEN** the function receives a value of 10
- **THEN** it yields the modifier "+0"

#### Scenario: Low score yields a negative modifier

- **WHEN** the function receives a value of 8
- **THEN** it yields the modifier "-1"

#### Scenario: Zero and low scores floor correctly

- **WHEN** the function receives a value of 0
- **THEN** it yields the modifier "-5"

#### Scenario: Fractional value floors toward negative infinity

- **WHEN** the function receives a value of 9.5
- **THEN** it yields the modifier "-1"

#### Scenario: Authored string modifier overrides the computed one

- **WHEN** an entry sets value 13 and modifier "+5"
- **THEN** the sheet shows the modifier "+5"
- **AND** the sheet shows the raw score 13 as the small value

#### Scenario: Non-string or blank modifier is ignored

- **WHEN** an entry sets value 14 and a modifier that is the number 3, an empty string, or whitespace
- **THEN** the sheet shows the computed modifier "+2"

#### Scenario: Missing score shows a dash

- **WHEN** an ability entry has a label but no finite numeric value and no usable authored modifier
- **THEN** the sheet shows an em dash in place of the modifier
- **AND** no error is raised

### Requirement: Combat block rendering

The system SHALL render a combat block from the valid combat entries. It SHALL
render each entry in the authored order, showing the label and the value. It SHALL
render a string value verbatim and a finite numeric value as its parsed number. It
SHALL render every label and value as text content, not markup. It SHALL NOT
compute a modifier for a combat entry, and it SHALL ignore any `modifier` field on
a combat entry. When a combat entry's value is missing, `null`, a boolean, a
non-finite number, an array, or an object, the system SHALL show an em dash ("—")
in place of the value. The combat block SHALL be a visual treatment distinct from
the abilities block. When the resolved combat list is empty, the system SHALL NOT
render the block.

#### Scenario: Combat values render by type

- **WHEN** a character lists combat entries "Armor Class" (value 16), "Speed" (value 30), and "Initiative" (value "+2")
- **THEN** the sheet shows "Armor Class" with 16, "Speed" with 30, and "Initiative" with "+2"
- **AND** the string value "+2" appears with no sign added or removed

#### Scenario: Non-renderable value shows a dash

- **WHEN** a combat entry has a label and a value that is missing, `null`, a boolean, `Infinity`, `NaN`, an array, or an object
- **THEN** the sheet shows the label with an em dash in place of the value
- **AND** no error is raised

#### Scenario: Authored text renders as text, not markup

- **WHEN** a combat value is the string `<img src=x>`
- **THEN** the sheet shows that literal string as visible text
- **AND** the sheet creates no corresponding HTML element

#### Scenario: Modifier field on a combat entry is ignored

- **WHEN** a combat entry sets value 16 and a modifier "+9"
- **THEN** the sheet shows the value 16
- **AND** the sheet does not show "+9"

#### Scenario: Empty resolved list hides the block

- **WHEN** a character has no valid combat entries, whether the data is absent, not a list, or a list whose members are all invalid
- **THEN** the sheet renders no combat block
- **AND** no error is raised

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
