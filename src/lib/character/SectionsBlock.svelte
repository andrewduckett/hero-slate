<script lang="ts">
	import { resolveSections } from './sections';
	import RichText from '$lib/richtext/RichText.svelte';
	import { parse } from '$lib/richtext/parse';

	let { sections }: { sections: unknown } = $props();

	const resolved = $derived(resolveSections(sections));
</script>

{#if resolved.length > 0}
	<div class="sections">
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
		gap: 1.5rem;
		margin-block: 1rem;
	}

	section {
		border-radius: 0.5rem;
		overflow: hidden;
	}

	.section-heading {
		margin: 0;
		padding: 0.4rem 0.75rem;
		font-size: 0.875rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		background-color: var(--accent);
		color: var(--on-accent);
	}

	.rows {
		list-style: none;
		margin: 0;
		padding: 0.5rem 0.75rem;
		display: grid;
		gap: 0.375rem;
	}

	.row {
		display: grid;
		grid-template-columns: auto 1fr;
		gap: 0.5rem;
		align-items: baseline;
	}

	.row-title {
		font-size: 0.8125rem;
		font-weight: 600;
		color: var(--accent);
	}

	.row-body {
		font-size: 0.9375rem;
	}

	/* A body-only row spans both tracks so its text starts at the title gutter's
	   left edge rather than auto-placing into the empty title column. */
	.row-body:only-child {
		grid-column: 1 / -1;
	}
</style>
