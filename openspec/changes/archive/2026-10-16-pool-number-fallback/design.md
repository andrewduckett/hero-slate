## Context

- `ResourcePoolsBlock.svelte` draws every pool as dots. It keeps one `counts` map in `$state`, and each tap writes a full snapshot of that map under the `pools` key. When `max > 5`, it sets `data-pool-size="large"`, which shrinks dots to 1.75rem (28 px).
- `pools.ts` resolves definitions and clamps stored counts. `MAX_POOL_DOTS = 100` is the upper bound, and `validate.ts` imports it for the ingest warning.
- `HitPointsBlock.svelte` holds the counter pattern: a readout, a progress bar, and -5 / -1 / +1 / +5 buttons that clamp to 0..max. It writes one number under `hp`, uses the fixed health palette, uses 52 px buttons, and dims at 0.
- Each pool card sets `data-palette`, which gives it `--tint`, `--deep`, `--accent` and `--on-accent`. `emitted-css.test.ts` proves that `--deep` meets WCAG AA as text on `--tint` and on `--raised`.
- jsdom does not compute layout. Size and wrapping are checked by a reviewer at 360 px, as the character-sheet spec says.

## Goals / Non-Goals

**Goals:**
- Choose dots or a counter per pool from its `max` alone, at render time.
- Keep one `counts` map and one write path for both forms.
- Make the counter look like a pool card, not like the hit-points tracker.

**Non-Goals:**
- Changing `HitPointsBlock.svelte` or its tests.
- Changing the `pools` state shape or how stored counts are resolved.
- An authored display mode, per-pool step sizes, or ±10 steps.

## Test Seams

- **Primary test seam:** the `ResourcePoolsBlock` component harness in `src/lib/character/ResourcePoolsBlock.test.ts`, with a mock `StateStore`. It covers the dots-vs-counter split, the counter's names and order, clamping, the empty state, and writes to the shared map.
- **Existing seams reused:** `src/lib/ingest/ddb/validate.test.ts` for the warning wording, and `src/lib/character/pools.test.ts` for the constants. A reviewer in a browser at 360 px checks tap-target size and wrapping.

## Scrutiny Tier & Blast Radius

- **Tier:** low
- **Blast radius:** the resource-pools block and its stylesheet, two constants in `pools.ts`, one warning string in the ingest validator, and the `dndbeyond-to-slate` skill text. No state, provider or theme change.

## Decisions

**D-a. The break point is a named constant in `pools.ts`.** Add `POOL_DOT_LIMIT = 12` and rename `MAX_POOL_DOTS` to `MAX_POOL_USES`, since pools over 12 no longer draw dots. Update the one import in `validate.ts`. *Alternatives:* a literal `12` in the component, which hides the rule from the ingest code and tests; or keep the old name, which now says the wrong thing.

**D-b. The counter lives inside `ResourcePoolsBlock`, not in a shared component.** Each pool in the `#each` branches on `pool.max <= POOL_DOT_LIMIT`. The counter branch calls a new `adjust(poolId, step)`. It clamps the new count, then reuses `snapshot()` and `persist()`. So a count survives a change of form, and rapid taps on mixed pools all land in one map. *Alternative:* extract a `StepCounter` from `HitPointsBlock`. They differ in size, palette source, dimming and storage, so a shared component would need props for each difference, and it would put the hit-points tracker inside this change's blast radius. The cost of not sharing is a repeated `[-5, -1]` / `[1, 5]` step list and a sign-formatting helper, a few lines.

**D-c. The markup marks the form, not a size.** Each card gets `data-pool-form="dots"` or `"counter"`. Remove `data-pool-size` and both of its `large` CSS rules, so every dot is 2.75rem (44 px) with the `--space-2` gap. Counter buttons get `data-pool-adjust="-5"` (and so on), following `data-hp-adjust`.

**D-d. Counter buttons look like dots.** Each is a 2.75rem round button with a 4px border, labelled with its step in the display font. Spend (-5, -1) is outlined, like an empty dot: transparent fill, `--structural` border, `--deep` text. Restore (+1, +5) is filled, like a full dot: `--tint` fill, `--deep` border and text. Both text pairs are already AA-tested. Spend sits on the left and restore on the right, with `justify-content: space-between`, as on hit points. The focus outline matches the dots.

**D-e. The readout and bar are scaled to the pool card.** The current value is 2rem at weight 800 in `--deep`, then `/ max` at 1.25rem in `--muted`, which matches the card's 1.25rem heading. The bar is 0.75rem thick, with a `--deep` border, a `--tint` track and an `--accent` fill, the same structure as the hit-points bar. It has `role="progressbar"`, `aria-label` set to the pool label, and `aria-valuenow`/`min`/`max`. Each button's `aria-label` is `"<label>: <step>"`, which contains its visible text. The counter card has `role="group"` and an `aria-label` of `"<label>: <current> remaining"`, the same wording as the dots' label, so a screen reader hears which pool a readout belongs to.

**D-f. The counter card fills its row.** Dot cards stay `flex: 0 1 auto`. The counter card is `flex: 1 1 16rem`. It is wide enough for four 44 px buttons and a gap on a 360 px phone (296 px inside the card), and it grows so the bar has room. On a wide page it can sit beside small dot cards. No opacity or `data-*-state` change at 0 (spec: an empty counter does not dim).

## Risks / Trade-offs

- [A 12-dot pool takes three rows on a phone] → Accepted in the brainstorm (D1). Each dot stays a 44 px target. No shipped character has a 12-use pool, so the 360 px browser check also loads a temporary local copy of a character with a pool of `max: 12`, measures its dots and checks for sideways scroll. That copy is not committed.
- [jsdom cannot prove 44 px or no sideways scroll] → The character-sheet scenarios name `/urven` and `/gimdak` at 360 px for a browser check before archive.
- [The step list and sign helper are repeated in two components] → Kept small on purpose (D-b). If a third counter appears, extract it then.
- [Renaming `MAX_POOL_DOTS` breaks an import] → It has one importer, `validate.ts`, and the type-check and tests catch a miss.

## Migration & Rollback

N/A. Stored `pools` counts keep their shape and meaning, and no character file changes. Rolling back the commit brings back dots for every pool.
