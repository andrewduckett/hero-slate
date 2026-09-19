<script lang="ts">
	// The hit points tracker: a `current / max` readout, a slim progress bar, and
	// -5 / -1 / +1 / +5 controls. A 9-year-old restores hit points by tapping up,
	// so there is no reset control. It resolves the authored `hitPoints` against
	// the stored current and renders nothing when the character has none to track.
	//
	// Each tap adjusts current, clamps it to 0..max, and persists it through the
	// state store under the "hp" key. The write runs from the tap handler, never a
	// render effect, so persisting never re-triggers a render. A failed write never
	// blocks the on-screen change. At 0 the tracker enters a calm "down" state:
	// dimmed with reduced opacity, never a flash, shake, or alarm color.
	import { onMount, untrack } from 'svelte';
	import { resolveHitPoints } from './hitPoints';
	import type { StateStore } from '$lib/state/store';

	let {
		hitPoints,
		storedCurrent,
		store,
		id = ''
	}: {
		hitPoints: unknown;
		storedCurrent: unknown;
		store?: StateStore;
		id?: string;
	} = $props();

	// Resolve once per mount from the initial props. The route renders this only
	// after both the character and the stored current resolve, and passes through a
	// loading state on every id change, so a new character remounts the tracker
	// fresh — `untrack` states that once-capture intent and silences the warning.
	const resolved = untrack(() => resolveHitPoints(hitPoints, storedCurrent));

	// The controls only ever add or subtract whole hit points.
	const adjustments = [-5, -1, 1, 5];

	let current = $state(resolved?.current ?? 0);

	const max = resolved?.max ?? 0;
	const down = $derived(current === 0);

	function label(amount: number): string {
		return amount > 0 ? `+${amount}` : String(amount);
	}

	function persist(value: number): void {
		// Interface writes fail quietly, but guard defensively so a rejection never
		// surfaces as an unhandled error or blocks the on-screen change.
		store?.write(id, 'hp', value).catch(() => {});
	}

	function adjust(amount: number): void {
		current = Math.min(max, Math.max(0, current + amount));
		persist(current);
	}

	onMount(() => {
		// Reduced-max reconciliation: when a stored finite integer was clamped on
		// load, persist the clamped value so a later raised max cannot restore the
		// lost hit points. Issued before any tap, so under the store's single-instance
		// ordering a later tap wins over this write-back.
		if (
			resolved !== null &&
			typeof storedCurrent === 'number' &&
			Number.isInteger(storedCurrent) &&
			storedCurrent !== resolved.current
		) {
			persist(resolved.current);
		}
	});
</script>

{#if resolved !== null}
	<section
		class="hit-points"
		data-block="hit-points"
		aria-label="Hit points"
		data-hp-state={down ? 'down' : undefined}
		style:opacity={down ? 0.55 : 1}
	>
		<div class="readout"><span class="current">{current}</span> / {max}</div>
		<div
			class="bar"
			role="progressbar"
			aria-label="Hit points"
			aria-valuenow={current}
			aria-valuemin={0}
			aria-valuemax={max}
		>
			<div class="fill" style:width="{max > 0 ? (current / max) * 100 : 0}%"></div>
		</div>
		<div class="controls">
			{#each adjustments as amount}
				<button type="button" data-hp-adjust={label(amount)} onclick={() => adjust(amount)}>
					{label(amount)}
				</button>
			{/each}
		</div>
	</section>
{/if}

<style>
	.hit-points {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		margin-block: 1rem;
		/* A calm dim on the down state, eased so it never flashes. */
		transition: opacity 300ms ease;
	}

	.readout {
		font-size: 1.5rem;
		font-weight: 700;
	}

	.current {
		color: var(--accent);
	}

	.bar {
		height: 0.5rem;
		border-radius: 0.25rem;
		background-color: color-mix(in srgb, var(--foreground) 15%, transparent);
		overflow: hidden;
	}

	.fill {
		height: 100%;
		background-color: var(--accent);
	}

	.controls {
		display: flex;
		gap: 0.5rem;
	}

	.controls button {
		flex: 1;
		padding-block: 0.75rem;
		font-size: 1.125rem;
		font-weight: 700;
		color: var(--foreground);
		background-color: color-mix(in srgb, var(--foreground) 8%, transparent);
		border: 1px solid color-mix(in srgb, var(--foreground) 20%, transparent);
		border-radius: 0.5rem;
		cursor: pointer;
	}
</style>
