# 0003. Per-device state behind a key-value store interface

- Status: accepted
- Date: 2026-09-19
- Supersedes: none
- Superseded by: none

## Context

The app renders character sheets. Until now every value was authored and read-only.
Tracking hit points introduces the first value a player changes during play, and
resource pools will soon add more. This state is mutable, per-device, and separate
from the authored character.

A later phase may add accounts and sync this state across a player's devices
through a hosted database. We want that move to swap one component, not ripple
through every tracker — the same goal the data provider already meets for authored
data.

Two constraints pull against each other. First, definition data and state data must
stay separate. A character's maximum hit points are definition; the current hit
points are state. If state leaks into the definition, the future database inherits
the mix and cannot split it cleanly. Second, the persistence shape must survive the
move to a database that syncs across devices, where two devices can write at once.

## Decision

We put all per-device state behind a small store interface. It reads and writes a
value by two coordinates: the character's stable logical id and a caller-chosen
tracker key, such as the key for hit points. The value is opaque JSON that the
store never interprets. Reads and writes are asynchronous, so a network-backed
implementation later does not change any caller.

We chose a key-value shape — one value per id and key — over two alternatives:

- **One combined document per character.** We rejected it. It makes the whole
  character's state a single write unit, so one tracker's save would overwrite
  another tracker's concurrent save once devices sync. Two trackers in one session
  would also contend on the same document.
- **A typed record per tracker.** We rejected it. It would teach the store what hit
  points and pools are, which puts domain meaning in the persistence layer. We keep
  the store free of that meaning, as the provider carries a color name through
  without resolving it.

A separate domain layer owns meaning. For hit points, a resolver combines the
authored maximum with the stored value, clamps it to the valid range, and starts a
new character at full health. The store only reads and writes values; the resolver
stays a pure function we can test in isolation.

Current state lives only in the store, never in the authored definition. A new
character starts at full health rather than reading a starting value from its file.

## Consequences

- Moving to a hosted, syncing backend swaps the store implementation; trackers stay
  unchanged, just as screens stayed unchanged when the provider was introduced.
- Each tracker writes its own key, so one tracker's save never overwrites another's
  when devices sync later. New trackers reuse the interface under new keys.
- Definition and state stay cleanly split, so the future database holds state
  without absorbing the authored character.
- The store keeps no notion of an account or another device this release; state is
  per-device until a later change adds the syncing implementation.
- We accept one layer of indirection over reading storage directly. The cost is
  small, and this indirection is the whole reason the interface exists.
