<script lang="ts">
	import type { GetCharacterResult } from '$lib/data/provider';
	import { formatIdentity } from '$lib/format';

	type ViewState = GetCharacterResult | { status: 'loading' };

	let { result }: { result: ViewState } = $props();
</script>

{#if result.status === 'loading'}
	<p>Loading…</p>
{:else if result.status === 'found'}
	<header>
		<h1>{result.character.name}</h1>
		{#if formatIdentity(result.character)}
			<p>{formatIdentity(result.character)}</p>
		{/if}
	</header>
{:else if result.status === 'error'}
	<p>Could not load this character. Try again.</p>
{:else}
	<!-- not-found and invalid share a fixed, id-free message. -->
	<p>Character not found</p>
{/if}
