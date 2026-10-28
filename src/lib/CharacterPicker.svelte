<script lang="ts">
	// The home route container: it lists the roster through the provider and
	// shows one card per character, in the order the provider returns them.
	import type { CharacterProvider, ListCharactersResult } from '#lib/data/provider';
	import { formatIdentity } from '#lib/format';
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
				<li>
					<span class="name" data-card-name>{summary.name}</span>
					{#if descriptor}
						<span class="descriptor" data-card-descriptor>{descriptor}</span>
					{/if}
				</li>
			{/each}
		</ul>
	{/if}
</div>
