## Purpose

Resource pools let a player track limited character abilities with simple,
rules-agnostic, per-device counters that stay separate from authored character data.

## ADDED Requirements

### Requirement: Authored resource-pool definitions

The system SHALL read `pools` as an ordered list of pool definitions. A valid
definition SHALL be a non-array object with a unique, non-empty string `id`, a
non-empty string `label`, and an integer `max` greater than zero. `color` SHALL
be optional and, when present, SHALL be a string. The system SHALL keep valid
definitions in authored order. It SHALL ignore invalid definitions and later
definitions that repeat an earlier valid id. The system SHALL treat an unknown
color name as valid data and use the neutral palette when it renders that pool.
This story SHALL accept a maximum no greater than 12. It SHALL ignore a larger
maximum rather than render an unbounded row of controls.

#### Scenario: Valid pools keep their authored order

- **WHEN** a character defines valid `wild-shape` and `magic` pools in that order
- **THEN** the system renders Wild Shape before Magic

#### Scenario: Invalid definitions do not render

- **WHEN** `pools` contains an invalid item beside one valid pool
- **THEN** the system renders only the valid pool
- **AND** no error is raised

#### Scenario: A maximum above the supported dot limit does not render

- **WHEN** a pool definition sets `max` to 13
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
uses that a player previously spent. When it saves
pool state, the system SHALL retain counts only for current valid pool ids.

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

The system SHALL render each valid pool as a labeled row of dots. A filled dot
SHALL represent one remaining use. An empty dot SHALL represent one spent use.
Each dot SHALL be an operable control. When a player selects dot number `n`,
the system SHALL set the count to `n - 1` when that dot is filled. It SHALL set
the count to `n` when that dot is empty. The system SHALL persist the changed
count through the `pools` tracker key. It SHALL calculate every selection from
the latest in-memory counts, rather than from an earlier stored map. It SHALL
not render reset or rest controls.

#### Scenario: Selecting a filled dot spends uses

- **WHEN** a pool has 4 remaining uses and a player selects its third filled dot
- **THEN** the pool shows 2 remaining uses
- **AND** the system saves 2 for that pool id

#### Scenario: Selecting an empty dot restores uses

- **WHEN** a pool has 2 remaining uses and a player selects its fourth empty dot
- **THEN** the pool shows 4 remaining uses
- **AND** the system saves 4 for that pool id

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
