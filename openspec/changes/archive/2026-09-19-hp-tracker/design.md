## Context

See proposal.md — Why. Hit points are the first mutable value in the app, so this
change sets the state pattern that resource pools (story 5) reuse.

Two durable constraints shape the approach:

- Keep definition data separate from per-device state.
- Route state through an interface, so a future hosted database is an
  implementation swap — the discipline the data provider already follows.

## Goals / Non-Goals

**Goals:**

- Define a state store interface whose shape swaps cleanly into a hosted database.
- Give the hit-points resolver the reconciliation logic, so the store stays a plain
  key-value component.
- Let a 9-year-old operate the tracker by tapping, with no reset step to learn.

**Non-Goals:**

- Accounts, cross-device sync, or the database itself. The interface only leaves
  room for them.
- Pools, temporary hit points, and death saves. Later stories own those.
- A tracker-aware storage schema. The store never learns what hit points or a pool
  are.

## Decisions

### Store shape: one JSON value per id and key

We chose an interface of `read(id, key)` and `write(id, key, value)`, where the
value is JSON the store never interprets. We reasoned from the future database and
compared three shapes:

1. **One JSON document per character.** We rejected it. It makes the whole
   character's state one write unit, so one tracker's save overwrites another
   tracker's concurrent save once devices sync. Two trackers in one session also
   contend on the same document.
2. **A key-value record per `(owner, character_id, key)`.** We chose this. Hit
   points and pools become separate records, so their writes never collide. The
   value stays opaque.
3. **A typed column per tracker.** We rejected it. It teaches the store what hit
   points and pools are, which puts meaning in the persistence layer.

Shape 2 follows the pattern the provider already sets: the provider carries a color
name through without resolving it, and the theming layer resolves it. Here the store
carries the hit-points value through, and the resolver interprets it.

The caller chooses the key — `"hp"` now, `"pool:<id>"` later — so pools gain
per-pool records under the same interface.

### Asynchronous reads and writes

We made the interface return promises, even though localStorage is synchronous. The
data provider is already asynchronous, so callers await state as they await a
character. A network-backed store then swaps in without changing a call site.

### Later-issued write wins within one store instance

We defined the store to persist writes to one id and key in issue order. The
later-issued write survives even if it completes first. localStorage meets this for
free, because it writes synchronously. This closes the rapid-tap race in one
session: the value on reload matches the player's last tap.

We scoped the guarantee to a single store instance on purpose. The interface passes
only an id, a key, and a value. It carries no sequence number, so two tabs or two
devices cannot establish which write was issued later. Ordering concurrent writers is
a job for the future syncing store, which will add its own versioning. We do not
promise it here.

### The resolver owns reconciliation; the value type is JSON

The store never interprets a value. A separate hit-points resolver takes the
authored `max` and the stored current, clamps current to `0..max`, and starts a new
character at `max`. It is a pure function we test like `abilities` and `combat`.

We type the stored value as a JSON value at the interface boundary. A type alone
cannot protect a JavaScript caller, an `any`, or a cast, so the store also validates
at runtime before writing. It rejects a value that is not a JSON value — a
non-finite number, `undefined`, a function, a `Date`, a symbol, or a circular
reference. Serialization would silently change such values: `NaN` becomes `null`, a
`Date` becomes a string, and an `undefined` property drops. A rejected write fails
quietly and leaves any existing stored value in place, so a read still returns the
value last written.

### Loading state and the async lifecycle

The route loads state, not the tracker component. The existing route already reads
the character through the provider. It reads the "hp" state next to it, and it
renders the tracker only after both resolve. The resolver then runs over values
already in hand, and no control appears while state is pending.

A load binds a result only for the id it requested. When the route id changes while
a read is in flight, the store's late read for the old id is discarded. This mirrors
the provider's own load and stops one character's state showing on another's sheet.

The tracker issues the reduced-max write-back before its controls accept taps. Under
the single-instance ordering guarantee, a later tap is issued after that write-back
and therefore wins. So a load never overwrites a player's tap. These rules keep the
stale-read, route-change, and write-back-versus-tap cases correct, including under a
future store whose reads and writes resolve slowly.

### Hit points are integers

We require `max` to be an integer greater than 0. A non-integer max means the
character has no hit points to track. We accept a stored current when it is any
finite integer, then clamp it to `0..max`. A stored `-1` resolves to 0, and a stored
value above max resolves to max. Only a non-integer or non-finite stored current
falls back to full health. Whole hit points match Dungeons & Dragons, and the
controls only ever add or subtract 1 or 5.

### A reduced max persists its clamp

When the author lowers `max` below the stored current, the resolver clamps current
on load, and the tracker persists that clamped value. Without the write-back, the
old higher current would survive in the store. A later raised max would then hand
back the lost hit points and break the "a raised max does not heal" rule. If the
write-back fails, the tracker shows the clamped value for the session. The store may
reappear higher on a later load. We accept that fallback for a per-device tracker.

### Current is store-only; the definition supplies max

The definition supplies `max`; current hit points are store state under key `"hp"`.
We do not read a `current` field from the file. Storing current in the definition
would mix state into definition data — the future-database trap we avoid. A new
character therefore starts at full health.

We considered treating an authored `current` as a first-load seed and rejected it.
It re-couples state to the definition for a rare need. Full health on first load also
matches how a character enters play. We will remove the now-unused `current` from
`sunny.yaml` in this change.

### Testable rendering

We render the bar as an element with an accessible progress role that exposes the
current value, a minimum of 0, and the maximum. A test asserts those values rather
than pixel geometry. We mark the zero state with a named state on the tracker, so a
test asserts its presence at 0 and its absence above 0. Visual review confirms the
resting appearance; the named state makes the behavior assertable.

## Risks / Trade-offs

- **Corrupt or unavailable localStorage** → the store returns `undefined` and treats
  non-JSON as absent, so a read never throws. A character then falls back to full
  health rather than breaking the sheet.
- **Persist-on-every-tap could loop with reactive state** → the tap handler writes,
  not a render effect, so a write never re-triggers a render.
- **A silent failed write loses the change on reload** → we accept this for a
  per-device, low-stakes tracker. The on-screen change still succeeds, and the future
  durable store is why the interface exists.
- **No authored starting current** → an author cannot start a character wounded; we
  judged that not worth coupling state into the definition.
