<script lang="ts">
	// The combat block: solid accent tiles of label-and-value pairs, distinct from
	// the raised abilities tiles, with the value prominent. It resolves the loosely-typed
	// `combat` field itself and renders nothing when no valid entry remains. All
	// text comes from Svelte text bindings, so authored values can never inject markup.
	import { resolveCombat, type ResolvedCombat } from './combat';

	let { combat }: { combat: unknown } = $props();

	const entries: ResolvedCombat[] = $derived(resolveCombat(combat));
</script>

{#if entries.length > 0}
	<section class="combat" aria-label="Combat" data-block="combat">
		{#each entries as entry}
			<div class="combat-entry">
				<span class="label">{entry.label}</span>
				<span class="value">{entry.value}</span>
			</div>
		{/each}
	</section>
{/if}

<style>
	.combat {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(6.5rem, 1fr));
		gap: var(--space-3);
	}

	/* A solid accent tile. Text uses on-accent, the contrast-checked pairing. */
	.combat-entry {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-1);
		padding: var(--space-3) var(--space-2);
		background-color: var(--accent);
		color: var(--on-accent);
		border-radius: var(--radius-m);
		box-shadow: var(--shadow);
		text-align: center;
	}

	.label {
		font-size: 0.75rem;
		font-weight: 800;
		text-transform: uppercase;
		letter-spacing: 0.08em;
	}

	.value {
		font-family: var(--font-display);
		font-size: 2rem;
		font-weight: 800;
		line-height: 1;
	}
</style>
