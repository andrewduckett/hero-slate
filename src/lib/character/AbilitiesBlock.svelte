<script lang="ts">
	// The abilities block: a grid of raised tiles, each with the modifier large and the
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
	/* Six tiles on one row at desktop widths; 3 by 2 at 360px. */
	.abilities {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(6.5rem, 1fr));
		gap: var(--space-3);
	}

	/* A raised tile with an accent top border. */
	.ability {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-1);
		padding: var(--space-3) var(--space-2);
		background-color: var(--raised);
		border-top: 0.3rem solid var(--accent);
		border-radius: var(--radius-m);
		box-shadow: var(--shadow);
		text-align: center;
	}

	.label {
		font-size: 0.75rem;
		font-weight: 800;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--muted);
	}

	.modifier {
		font-family: var(--font-display);
		font-size: 2.25rem;
		font-weight: 800;
		line-height: 1;
		color: var(--accent);
	}

	.score {
		font-size: 0.875rem;
		font-weight: 700;
		color: var(--muted);
	}
</style>
