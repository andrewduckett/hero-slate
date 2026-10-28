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
		<div class="tiles">
			{#each entries as entry}
				<div class="ability">
					<span class="label">{entry.label}</span>
					<span class="modifier">{entry.modifier}</span>
					{#if entry.score !== null}
						<span class="score">{entry.score}</span>
					{/if}
				</div>
			{/each}
		</div>
	</section>
{/if}

<style>
	/* The tile count follows the block's own width, not the viewport's, so the
	   block needs no knowledge of the page's column breakpoint. */
	.abilities {
		container-type: inline-size;
	}

	/* 3 or 6 per row, never a count that leaves a short row. 40rem fits six
	   tiles of at least 6rem. */
	.tiles {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: var(--space-3);
	}

	@container (min-width: 40rem) {
		.tiles {
			grid-template-columns: repeat(6, minmax(0, 1fr));
		}
	}

	/* A raised tile with a structural top border. */
	.ability {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-1);
		padding: var(--space-3) var(--space-2);
		background-color: var(--raised);
		border-top: 0.3rem solid var(--structural);
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
		color: var(--deep);
	}

	.score {
		font-size: 0.875rem;
		font-weight: 700;
		color: var(--muted);
	}
</style>
