<script lang="ts">
	// The combat block: a plainer list of label-and-value pairs, distinct from the
	// abilities grid, with the value prominent. It resolves the loosely-typed
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
		display: flex;
		flex-direction: column;
		margin-block: 1rem;
	}

	.combat-entry {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: 1rem;
		padding-block: 0.5rem;
		border-bottom: 1px solid color-mix(in srgb, var(--foreground) 12%, transparent);
	}

	.combat-entry:last-child {
		border-bottom: none;
	}

	.label {
		opacity: 0.85;
	}

	.value {
		font-size: 1.25rem;
		font-weight: 700;
		color: var(--accent);
	}
</style>
