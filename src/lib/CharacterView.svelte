<script lang="ts">
	import type { GetCharacterResult } from '$lib/data/provider';
	import type { JsonValue, StateStore } from '$lib/state/store';
	import { formatIdentity } from '$lib/format';
	import { resolvePalette } from '$lib/theme/resolve';
	import AbilitiesBlock from '$lib/character/AbilitiesBlock.svelte';
	import CombatBlock from '$lib/character/CombatBlock.svelte';
	import HitPointsBlock from '$lib/character/HitPointsBlock.svelte';
	import ResourcePoolsBlock from '$lib/character/ResourcePoolsBlock.svelte';

	type ViewState = GetCharacterResult | { status: 'loading' };

	// The route resolves the character and the "hp" state, then passes both here.
	// `storedHp`, `store`, and `id` support the tracker; a character with no hit
	// points to track renders none, so they are optional for state-free callers.
	let {
		result,
		storedHp = undefined,
		storedPools = undefined,
		store = undefined,
		id = ''
	}: { result: ViewState; storedHp?: JsonValue | undefined; storedPools?: JsonValue | undefined; store?: StateStore; id?: string } =
		$props();
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
		<HitPointsBlock
			hitPoints={result.character.hitPoints}
			storedCurrent={storedHp}
			{store}
			{id}
		/>
		<ResourcePoolsBlock pools={result.character.pools} {storedPools} {store} {id} />
		<AbilitiesBlock abilities={result.character.abilities} />
		<CombatBlock combat={result.character.combat} />
	</article>
{:else if result.status === 'error'}
	<p>Could not load this character. Try again.</p>
{:else}
	<!-- not-found and invalid share a fixed, id-free message. -->
	<p>Character not found</p>
{/if}
