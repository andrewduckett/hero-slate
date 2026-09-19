## Purpose

The state store holds a character's per-device state behind an interface. It
keys each value by the character's logical id and a tracker key. It keeps that state
apart from the authored definition, so a future hosted database is an
implementation swap.

## ADDED Requirements

### Requirement: State store interface

The state store SHALL read and write a value by a character's logical id and a
tracker key. A read SHALL return the value last written for that id and key. A read
with nothing written SHALL return `undefined`. A stored value SHALL be a JSON value.
A JSON value is `null`, a boolean, a finite number, a string, or an array or object
built from JSON values. Object keys SHALL be strings. This type disallows
`undefined`, so no typed caller stores a value that serialization would drop. The
store SHALL carry the value through without interpreting it. Reads and writes SHALL
be asynchronous, so a later network-backed store does not change callers. The
interface SHALL NOT expose a storage location. Callers depend only on the id and the
key.

#### Scenario: A written value reads back

- **WHEN** a caller writes a value for id "sunny" and key "hp", then reads the same id and key
- **THEN** the read returns the written value

#### Scenario: Nothing written reads as undefined

- **WHEN** a caller reads id "sunny" and key "hp" and nothing was ever written
- **THEN** the read returns `undefined`

#### Scenario: Keys and ids never collide

- **WHEN** a caller writes one value for id "sunny" key "hp", another for id "sunny" key "pools", and another for id "ash" key "hp"
- **THEN** each read returns only the value written for that exact id and key

### Requirement: Later-issued write wins within one store instance

The store SHALL apply writes to one id and key in the order the caller issued them.
The later-issued write SHALL survive, even when it completes first. This holds within
a single store instance, so rapid taps in one session agree with the next read. The
interface SHALL make no ordering promise across store instances, tabs, or devices.
A future syncing store will need its own sequencing to order concurrent devices.

#### Scenario: The last issued write is the one kept

- **WHEN** a caller issues a write of 29 then a write of 28 for id "sunny" key "hp", and the two writes complete in reverse order
- **THEN** a later read for that id and key returns 28

### Requirement: Per-device localStorage store

The system SHALL provide a localStorage store that meets the interface. It SHALL
persist each value, so a read after a page reload returns it. It SHALL map each id
and key to a storage key by an injective, application-scoped layout. Distinct id and
key pairs SHALL never share a storage key, whatever characters the id or key
contains. The layout SHALL match a future `(owner, character_id, key)` database
record. The future store supplies the owner from the signed-in account, and no owner
passes through the interface. This store is per-device: it holds no account and no
other device.

#### Scenario: State survives a reload

- **WHEN** a value is written for id "sunny" key "hp", the page reloads, and the same id and key are read
- **THEN** the read returns the written value

#### Scenario: Delimiter-bearing coordinates do not collide

- **WHEN** a caller writes for an id and key whose text could run together with a delimiter, then writes a different pair that would share a naive combined key
- **THEN** each read returns only the value written for that exact id and key

### Requirement: Storage failures never break a read

The store SHALL tolerate a missing, blocked, full, or corrupt localStorage. A read
that cannot reach a stored value SHALL return `undefined` rather than raise. A write
that cannot persist SHALL fail quietly rather than raise. A stored value that is not
valid JSON SHALL be treated as absent.

#### Scenario: Unavailable storage reads as undefined

- **WHEN** localStorage cannot be read, whether blocked or absent
- **THEN** a read returns `undefined`
- **AND** no error is raised

#### Scenario: Corrupt stored value is treated as absent

- **WHEN** the stored value for an id and key is not valid JSON
- **THEN** a read returns `undefined`
- **AND** no error is raised

#### Scenario: Failed write does not raise

- **WHEN** a write cannot persist, whether storage is full or blocked
- **THEN** the write fails quietly
- **AND** no error is raised

### Requirement: The store rejects values that are not JSON

The store SHALL check a value at runtime before it writes. A type alone cannot guard
a JavaScript caller, an `any`, or a cast. The store SHALL reject a value that is not
a JSON value, including a non-finite number, `undefined`, a function, a symbol, a
`Date`, and a value with a circular reference. Serialization would silently change
such values rather than store them faithfully. A rejected write SHALL fail quietly.
It SHALL leave any existing stored value in place, so a read still returns the value
last written.

#### Scenario: A non-JSON value is rejected and the prior value stays

- **WHEN** a caller writes 30 for id "sunny" key "hp", then writes `NaN` for the same id and key
- **THEN** the second write fails quietly
- **AND** a read for that id and key returns 30

#### Scenario: A Date is rejected

- **WHEN** a caller writes a `Date` for an id and key that hold no value
- **THEN** nothing is persisted for that id and key
- **AND** no error is raised

### Requirement: The localStorage store is safe to construct without a window

The localStorage store SHALL import and construct without a `window` or a working
localStorage. It SHALL defer and guard every localStorage access until a read or
write runs. This keeps it safe in a no-window test environment and under the app's
disabled server-side rendering.

#### Scenario: Construction never touches storage

- **WHEN** the store is imported and constructed with no `window`, or with a localStorage getter that throws
- **THEN** construction does not raise
- **AND** a later read resolves `undefined`
- **AND** a later write resolves quietly
