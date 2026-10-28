<script lang="ts">
	// The home route container: it lists the roster through the provider and
	// shows one card per character, in the order the provider returns them.
	import type { CharacterProvider, ListCharactersResult } from '#lib/data/provider';
	import { formatIdentity } from '#lib/format';
	import { resolvePalette } from '#lib/theme/resolve';
	import AppHeader from '#lib/AppHeader.svelte';

	let { provider }: { provider: CharacterProvider } = $props();

	let result = $state<ListCharactersResult | { status: 'loading' }>({ status: 'loading' });

	$effect(() => {
		let cancelled = false;
		provider.listCharacters().then((listed) => {
			if (!cancelled) result = listed;
		});
		return () => {
			cancelled = true;
		};
	});
</script>

<div class="picker">
	<AppHeader title="Hero Slate" subtitle="Choose your hero" />

	{#if result.status === 'loading'}
		<p>Loading…</p>
	{:else if result.status === 'found'}
		<ul data-block="picker">
			{#each result.characters as summary (summary.id)}
				{@const descriptor = formatIdentity(summary)}
				<!-- The anchor wraps the card's text, so that text is its accessible name. -->
				<li data-palette={resolvePalette(summary.color)}>
					<a href="/{summary.id}">
						<span class="name" data-card-name>{summary.name}</span>
						{#if descriptor}
							<span class="descriptor" data-card-descriptor>{descriptor}</span>
						{/if}
					</a>
				</li>
			{/each}
		</ul>
	{/if}
</div>

<style>
	.picker {
		display: grid;
		gap: var(--space-5);
	}

	/* min() keeps one column from overflowing a screen narrower than 16rem. */
	ul {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(min(16rem, 100%), 1fr));
		gap: var(--space-4);
		margin: 0;
		padding: 0;
		list-style: none;
	}

	/* A card is a mini sheet header: it stands for the sheet it opens. */
	a {
		display: flex;
		flex-direction: column;
		justify-content: center;
		height: 100%;
		min-height: 44px;
		padding: var(--space-4) var(--space-5);
		border-radius: var(--radius-l);
		box-shadow: var(--shadow);
		background-color: var(--accent);
		color: var(--on-accent);
		text-decoration: none;
	}

	a:focus-visible {
		outline: 3px solid var(--foreground);
		outline-offset: 2px;
	}

	.name {
		font-family: var(--font-display);
		font-size: 1.5rem;
		font-weight: 800;
		line-height: 1.15;
	}

	.descriptor {
		margin-top: var(--space-1);
		font-weight: 700;
	}
</style>
