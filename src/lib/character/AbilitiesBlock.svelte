<script lang="ts">
	// The abilities block: a grid of cells, each with the modifier large and the
	// raw score small beneath it. It resolves the loosely-typed `abilities` field
	// itself and renders nothing when no valid entry remains. All text comes from
	// Svelte text bindings, so authored labels and modifiers can never inject markup.
	import { resolveAbilities, type ResolvedAbility } from './abilities';

	let { abilities }: { abilities: unknown } = $props();

	const entries: ResolvedAbility[] = $derived(resolveAbilities(abilities));
</script>

{#if entries.length > 0}
	<section class="abilities" aria-label="Abilities" data-block="abilities">
		{#each entries as entry}
			<div class="ability">
				<span class="label">{entry.label}</span>
				<span class="modifier">{entry.modifier}</span>
				{#if entry.score !== null}
					<span class="score">{entry.score}</span>
				{/if}
			</div>
		{/each}
	</section>
{/if}

<style>
	.abilities {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(5rem, 1fr));
		gap: 0.5rem;
		margin-block: 1rem;
	}

	.ability {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.125rem;
		padding: 0.5rem;
		border: 1px solid color-mix(in srgb, var(--foreground) 20%, transparent);
		border-radius: 0.5rem;
		text-align: center;
	}

	.label {
		font-size: 0.75rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		opacity: 0.75;
	}

	.modifier {
		font-size: 1.75rem;
		font-weight: 700;
		line-height: 1.1;
		color: var(--accent);
	}

	.score {
		font-size: 0.875rem;
		opacity: 0.75;
	}
</style>
