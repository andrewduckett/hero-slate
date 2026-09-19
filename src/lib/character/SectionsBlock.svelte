<script lang="ts">
	import { resolveSections } from './sections';
	import RichText from '$lib/richtext/RichText.svelte';
	import { parse } from '$lib/richtext/parse';

	let { sections }: { sections: unknown } = $props();

	const resolved = $derived(resolveSections(sections));
</script>

{#if resolved.length > 0}
	<div class="sections" data-block="sections">
		{#each resolved as section}
			<section data-palette={section.palette}>
				<h2 class="section-heading">{section.title}</h2>
				<ul class="rows">
					{#each section.rows as row}
						<li class="row" data-palette={row.palette}>
							{#if row.title}
								<span class="row-title">{row.title}</span>
							{/if}
							<span class="row-body">
								<RichText nodes={parse(row.body)} />
							</span>
						</li>
					{/each}
				</ul>
			</section>
		{/each}
	</div>
{/if}

<style>
	.sections {
		display: grid;
		gap: var(--space-5);
	}

	/* A raised card whose top is the accent title strip. */
	section {
		background-color: var(--raised);
		border-radius: var(--radius-l);
		box-shadow: var(--shadow);
		overflow: hidden;
	}

	.section-heading {
		margin: 0;
		padding: var(--space-2) var(--space-4);
		font-size: 1.125rem;
		font-weight: 800;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		background-color: var(--accent);
		color: var(--on-accent);
	}

	.rows {
		list-style: none;
		margin: 0;
		padding: var(--space-3) var(--space-4) var(--space-4);
		display: grid;
		gap: var(--space-3);
	}

	/* On narrow screens a row stacks its title above its body. */
	.row {
		display: grid;
		gap: var(--space-1);
	}

	.row-title {
		font-family: var(--font-display);
		font-size: 1rem;
		font-weight: 800;
		line-height: 1.2;
		color: var(--accent);
	}

	.row-body {
		font-size: 1rem;
	}

	/* From about 30rem up, the title and body sit side by side. */
	@media (min-width: 30rem) {
		.row {
			grid-template-columns: 8rem 1fr;
			gap: var(--space-3);
			align-items: baseline;
		}

		/* A body-only row spans both tracks so its text starts at the title
		   gutter's left edge rather than auto-placing into the empty title
		   column. */
		.row-body:only-child {
			grid-column: 1 / -1;
		}
	}
</style>
