## Context

The sheet already tracks hit points through a character-id and tracker-key state
store. The `pools` definition field remains provisional. See `proposal.md` for
the reason to define it now.

## Goals / Non-Goals

**Goals:**

- Define a stable authoring shape for several independent resource counters.
- Reuse the existing per-device state-store boundary.
- Make pool changes clear with direct, bidirectional dot selection.
- Preserve spent uses when authors edit labels, order, or maximums.

**Non-Goals:**

- Add rest actions, reset actions, or D&D-specific rules.
- Add a numeric control for pools above twelve uses.
- Add cross-device synchronization or change the store interface.

## Decisions

### Use ordered definitions with stable pool ids

Each pool uses `{ id, label, color, max }`. The id identifies state. The label
and list position only control presentation. This lets authors rename and reorder
pools without resetting a player's uses.

This story accepts maxima from one through twelve. Twelve keeps the dot control
bounded for touch, keyboard, and rendering. A later story can add a different,
accessible control for larger pools.

The resolver accepts a valid definition only once per id. It keeps the first
valid occurrence and ignores later duplicates. This prevents two displayed rows
from writing the same state entry.

We rejected deriving ids from labels or list indexes. Labels change, and indexes
change when an author inserts or reorders rows.

### Resolve pool state in a pure domain layer

A resolver will combine authored definitions with the opaque stored `pools` value.
It will return render-ready pools and any count corrections needed after maximums
fall. It will reject malformed definitions and stored values without throwing.

The map adapter will use own-key-safe reads and writes. An id such as `__proto__`
will remain an ordinary pool id, not an inherited object property.

This mirrors hit-point resolution. It keeps validation and reconciliation out of
the generic store, which must remain unaware of pool meaning.

### Store one map under the `pools` tracker key

The store value will be a JSON object such as `{ "wild-shape": 1, "magic": 4 }`.
One tracker component will own one reactive in-memory map for its full lifetime.
Each tap will update that map before it issues a write. Every later tap will clone
the latest map, so it cannot restore a stale count from another pool.

Before each write, the component will project its map onto current valid pool ids.
This removes retired ids instead of accumulating unused state. A removed pool that
returns with the same id starts full after a save removed its earlier count.

This is one tracker record, separate from `hp`. It gives the sheet one pool-state
read while stable pool ids keep each counter distinct. The store's existing
single-instance ordering protects rapid taps.

We rejected one dynamic store key per pool. It would add key construction and
many route-load reads without improving the player experience in this release.

### Use direct, contiguous dot selection

Dots show remaining uses from left to right. Selecting a filled dot spends down
to the dot before it. Selecting an empty dot restores through that dot. Buttons
will provide the same interaction to touch and keyboard users.

We rejected individually toggleable dots. Gaps would make the remaining count
harder to read. We also rejected increment-only controls because they require
more taps during play.

### Load HP and pool state as one route result

The sheet container will request `hp` and `pools` with the character definition.
It will publish the result only when all three reads belong to the current route.
The view will then mount both trackers with settled state.

This extends the existing route guard. It prevents a late pool read from another
character from enabling controls with the wrong count.

## Risks / Trade-offs

- [A map is one write unit for all pools] -> One reactive map supplies every tap, and each save uses its latest complete snapshot. Cross-device merging remains future work.
- [Retired pool ids collect in localStorage] -> Each save keeps only current valid ids. An intentionally removed pool therefore loses its prior count after the next save.
- [A pool maximum falls] -> The resolver issues a correction before input. A failed write leaves the clamped controls usable, and a later tap writes last.
- [An author makes a malformed edit] -> The resolver ignores invalid definitions and starts invalid stored values at the authored maximum.
- [Many dots become hard to scan] -> This story limits dot pools to twelve. A later story can add a numeric control above twelve.

## Migration Plan

1. Add the resolver, tracker component, and focused tests before changing the view.
2. Replace the provisional sample pool data with the defined list shape.
3. Load and pass the `pools` state with the existing HP state.
4. Deploy as a static client-side change. Existing devices have no `pools` map and start each pool full.
5. Roll back by removing the pool tracker. The opaque stored map is harmless and ignored by earlier builds.
