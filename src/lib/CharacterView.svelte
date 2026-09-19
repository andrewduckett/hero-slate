<script lang="ts">
	import type { GetCharacterResult } from '$lib/data/provider';
	import { formatIdentity } from '$lib/format';
	import { resolvePalette } from '$lib/theme/resolve';

	type ViewState = GetCharacterResult | { status: 'loading' };

	let { result }: { result: ViewState } = $props();
</script>

{#if result.status === 'loading'}
	<p>Loading…</p>
{:else if result.status === 'found'}
	<!-- The sheet root carries the resolved palette; the CSS maps it to a single
	     --accent / --on-accent for the active light or dark mode. -->
	<article data-palette={resolvePalette(result.character.color)}>
		<header style="background-color: var(--accent); color: var(--on-accent);">
			<h1>{result.character.name}</h1>
			{#if formatIdentity(result.character)}
				<p>{formatIdentity(result.character)}</p>
			{/if}
		</header>
	</article>
{:else if result.status === 'error'}
	<p>Could not load this character. Try again.</p>
{:else}
	<!-- not-found and invalid share a fixed, id-free message. -->
	<p>Character not found</p>
{/if}
