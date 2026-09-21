<script lang="ts">
	// The hit points tracker: a `current / max` readout, a thick progress bar, and
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
	import { ROLE_PALETTE } from '$lib/theme/roles';

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

	// The controls only ever add or subtract whole hit points. Damage comes first
	// and healing last, so one side lowers hit points and the other raises them.
	const damage = [-5, -1];
	const heal = [1, 5];

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
		data-palette={ROLE_PALETTE.health}
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
			<div class="control-group damage">
				{#each damage as amount}
					<button type="button" data-hp-adjust={label(amount)} onclick={() => adjust(amount)}>
						{label(amount)}
					</button>
				{/each}
			</div>
			<div class="control-group heal">
				{#each heal as amount}
					<button type="button" data-hp-adjust={label(amount)} onclick={() => adjust(amount)}>
						{label(amount)}
					</button>
				{/each}
			</div>
		</div>
	</section>
{/if}

<style>
	/* A raised card. */
	.hit-points {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
		padding: var(--space-4);
		background-color: var(--raised);
		border-radius: var(--radius-l);
		box-shadow: var(--shadow);
		/* A calm dim on the down state, eased so it never flashes. */
		transition: opacity 300ms ease;
	}

	/* The max reads smaller than the current value. */
	.readout {
		font-family: var(--font-display);
		font-size: 1.5rem;
		font-weight: 700;
		line-height: 1;
		color: var(--muted);
	}

	.current {
		font-size: 3.25rem;
		font-weight: 800;
		color: var(--accent);
	}

	/* A thick bar with fully rounded ends. */
	.bar {
		height: 1rem;
		border: 2px solid var(--accent);
		border-radius: 999px;
		background-color: var(--surface);
		overflow: hidden;
	}

	.fill {
		height: 100%;
		border-radius: 999px;
		background-color: var(--accent);
	}

	/* Damage on the left, healing on the right, with a flexible gap between. */
	.controls {
		display: flex;
		justify-content: space-between;
		gap: var(--space-4);
	}

	.control-group {
		display: flex;
		gap: var(--space-3);
	}

	.controls button {
		inline-size: 3.25rem;
		block-size: 3.25rem;
		padding: 0;
		font-family: var(--font-display);
		font-size: 1.25rem;
		font-weight: 800;
		border: 3px solid var(--accent);
		border-radius: 50%;
		cursor: pointer;
	}

	/* Damage buttons are outlined. */
	.damage button {
		color: var(--accent);
		background-color: var(--raised);
	}

	/* Heal buttons are filled with accent. */
	.heal button {
		color: var(--on-accent);
		background-color: var(--accent);
	}

	.controls button:focus-visible {
		outline: 3px solid var(--foreground);
		outline-offset: 2px;
	}
</style>
