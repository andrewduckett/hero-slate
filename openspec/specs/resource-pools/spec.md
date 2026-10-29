# resource-pools Specification

## Purpose

Resource pools let a player track limited character abilities with simple,
rules-agnostic, per-device counters that stay separate from authored character data.

## Requirements

### Requirement: Authored resource-pool definitions

The system SHALL read `pools` as an ordered list of pool definitions. A valid
definition SHALL be a non-array object with a unique, non-empty string `id`, a
non-empty string `label`, and an integer `max` from one through 100. `color` SHALL
be optional and, when present, SHALL be a string. The system SHALL keep valid
definitions in authored order. It SHALL ignore invalid definitions and later
definitions that repeat an earlier valid id. The system SHALL treat an unknown
color name as valid data and use the neutral palette when it renders that pool.

#### Scenario: Valid pools keep their authored order

- **WHEN** a character defines valid `wild-shape` and `magic` pools in that order
- **THEN** the system renders Wild Shape before Magic

#### Scenario: Invalid definitions do not render

- **WHEN** `pools` contains an invalid item beside one valid pool
- **THEN** the system renders only the valid pool
- **AND** no error is raised

#### Scenario: A maximum of 100 renders

- **WHEN** a pool definition sets `max` to 100
- **THEN** the system renders that pool

#### Scenario: A maximum above the supported dot limit does not render

- **WHEN** a pool definition sets `max` to 101
- **THEN** the system does not render that pool

#### Scenario: Duplicate pool ids do not share a counter

- **WHEN** a later pool definition repeats an earlier valid pool id
- **THEN** the system renders only the earlier definition

#### Scenario: Unknown colors fall back safely

- **WHEN** a valid pool uses an unknown color name
- **THEN** the system renders the pool with the neutral palette

### Requirement: Resource-pool state resolution

The system SHALL keep pool counts outside the character definition. It SHALL
read them from the state store for the character id and tracker key `pools`.
That value SHALL be a JSON object whose own string keys map pool ids to counts.
The system SHALL use own-key-safe reads and updates for every pool id. A pool with no
stored finite integer count SHALL start at its authored maximum. The system
SHALL clamp a stored integer count to the range from zero through that maximum.
It SHALL issue a write for a clamped count before a player can adjust the pool.
It SHALL keep the clamped controls usable if that write fails. A later player
adjustment SHALL win over that correction. A changed maximum SHALL not restore
uses that a player previously spent. When it saves pool state, the system SHALL
retain counts only for current valid pool ids.

#### Scenario: A new pool starts full

- **WHEN** a valid pool has maximum 3 and no stored count
- **THEN** the system shows 3 remaining uses

#### Scenario: Stored counts stay separate by pool id

- **WHEN** the stored map has `wild-shape: 1` and `magic: 4`
- **THEN** each pool shows its own stored count

#### Scenario: A lowered maximum clamps and persists the count

- **WHEN** a pool stores 4 uses and its author lowers the maximum to 2
- **THEN** the system shows 2 remaining uses
- **AND** it saves 2 under that pool's id

#### Scenario: A raised maximum does not restore uses

- **WHEN** a pool stores 2 uses, its maximum rises from 3 to 5, and the sheet loads
- **THEN** the system shows 2 remaining uses

#### Scenario: Retired pool state is removed on a save

- **WHEN** stored pool state contains an id absent from the current valid definitions
- **AND** the system saves pool state for that character
- **THEN** the saved map does not contain the absent id

#### Scenario: An inherited-looking pool id remains independent

- **WHEN** pools use ids `__proto__` and `magic`, and stored state sets each count
- **THEN** the system resolves, updates, saves, and reloads each count independently

#### Scenario: A failed correction write does not block a later adjustment

- **WHEN** a stored count is clamped after a lowered maximum and its correction write fails
- **THEN** the system shows the clamped count and enables the pool controls
- **AND** a later player adjustment is the final issued write

### Requirement: Tappable remaining-use dots

The system SHALL render each valid pool whose `max` is 12 or less as a labeled
row of dots, one dot per use. A filled dot SHALL represent one remaining use. An
empty dot SHALL represent one spent use. Each dot SHALL be an operable control
whose accessible name is the pool label and the dot's number, such as
"Magic: 3 remaining". When a player selects dot number `n`, the system SHALL set
the count to `n - 1` when that dot is filled. It SHALL set the count to `n` when
that dot is empty. The system SHALL persist the changed count through the `pools`
tracker key. It SHALL calculate every selection from the latest in-memory counts,
rather than from an earlier stored map. It SHALL not render reset or rest
controls.

#### Scenario: Selecting a filled dot spends uses

- **WHEN** a pool has 4 remaining uses and a player selects its third filled dot
- **THEN** the pool shows 2 remaining uses
- **AND** the system saves 2 for that pool id

#### Scenario: Selecting an empty dot restores uses

- **WHEN** a pool has 2 remaining uses and a player selects its fourth empty dot
- **THEN** the pool shows 4 remaining uses
- **AND** the system saves 4 for that pool id

#### Scenario: A pool of 12 uses shows dots

- **WHEN** a valid pool has `max` 12
- **THEN** the system renders 12 dot controls for that pool
- **AND** it renders no counter for that pool

#### Scenario: Rapid changes to different pools both persist

- **WHEN** a player changes two different pools before either save finishes
- **THEN** the saved map contains both changed counts

#### Scenario: No pools hide the tracker

- **WHEN** a character has no valid pool definitions
- **THEN** the system renders no resource-pool tracker

#### Scenario: Reset and rest controls are absent

- **WHEN** a player views a resource-pool tracker
- **THEN** it has no reset or rest control

### Requirement: Pool state loads before controls appear

The system SHALL load pool state before it shows interactive pool controls. It
SHALL bind loaded pool state only to the current character route. When the route
changes during a load, the system SHALL discard the earlier route's result.

#### Scenario: Late state does not appear on another sheet

- **WHEN** a player changes character routes before the first pool-state read finishes
- **THEN** the system does not show the first character's pool count on the second sheet

### Requirement: Remaining-use counter for large pools

The system SHALL render each valid pool whose `max` is from 13 through 100 as a
labeled counter instead of dots. The counter SHALL be a group whose accessible
name is the pool label and the remaining uses, such as "Lay On Hands: 35
remaining". It SHALL show the remaining uses as `current / max` and as a
progress bar. The bar's accessible name SHALL be the
pool label, and it SHALL report the remaining uses as its value, from 0 through
`max`. The counter SHALL offer four controls in the order -5, -1, +1, +5. Each
control's accessible name SHALL be the pool label and its step, such as
"Lay On Hands: -5". When a player selects a control, the system SHALL add its
step to the count and clamp the result to the range from zero through `max`. The
system SHALL persist the changed count through the `pools` tracker key, under the
pool's id. It SHALL calculate every change from the latest in-memory counts. A
counter at zero SHALL look the same as a counter with uses left, apart from its
readout and bar. The counter SHALL not offer reset or rest controls.

#### Scenario: A pool of 13 uses shows a counter

- **WHEN** a valid pool labelled `Lay On Hands` has `max` 13 and no stored count
- **THEN** the system shows `13 / 13` for that pool
- **AND** it renders no dot controls for that pool

#### Scenario: Controls appear in order and name the pool

- **WHEN** a valid pool labelled `Lay On Hands` has `max` 35
- **THEN** the counter is a group named "Lay On Hands: 35 remaining"
- **AND** its controls are named "Lay On Hands: -5", "Lay On Hands: -1", "Lay On Hands: +1" and "Lay On Hands: +5", in that order
- **AND** its progress bar is named "Lay On Hands" with value 35 of 35

#### Scenario: Spending uses lowers the count

- **WHEN** a pool with `max` 35 has 35 remaining uses and a player selects -5
- **THEN** the pool shows `30 / 35`
- **AND** the system saves 30 for that pool id

#### Scenario: Spending below zero stops at zero

- **WHEN** a pool with `max` 35 has 3 remaining uses and a player selects -5
- **THEN** the pool shows `0 / 35`
- **AND** the system saves 0 for that pool id

#### Scenario: Restoring above the maximum stops at the maximum

- **WHEN** a pool with `max` 35 has 33 remaining uses and a player selects +5
- **THEN** the pool shows `35 / 35`
- **AND** the system saves 35 for that pool id

#### Scenario: An empty counter does not dim

- **WHEN** a counter pool reaches 0 remaining uses
- **THEN** the system does not mark the pool as down and does not reduce its opacity

#### Scenario: A counter and a dot pool both persist

- **WHEN** a player changes a counter pool and a dot pool before either save finishes
- **THEN** the saved map contains both changed counts

#### Scenario: A maximum that crosses 12 keeps the stored count

- **WHEN** a pool stores 8 uses and its author raises the maximum from 10 to 20
- **THEN** the system shows the pool as a counter reading `8 / 20`

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
