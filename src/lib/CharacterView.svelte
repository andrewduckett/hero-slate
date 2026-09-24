<script lang="ts">
	import type { GetCharacterResult } from '$lib/data/provider';
	import type { JsonValue, StateStore } from '$lib/state/store';
	import { formatIdentity } from '$lib/format';
	import { resolvePalette } from '$lib/theme/resolve';
	import AbilitiesBlock from '$lib/character/AbilitiesBlock.svelte';
	import CombatBlock from '$lib/character/CombatBlock.svelte';
	import HitPointsBlock from '$lib/character/HitPointsBlock.svelte';
	import ResourcePoolsBlock from '$lib/character/ResourcePoolsBlock.svelte';
	import SectionsBlock from '$lib/character/SectionsBlock.svelte';
	import LinksBlock from '$lib/character/LinksBlock.svelte';
	import { resolveAbilities } from '$lib/character/abilities';
	import { resolveCombat } from '$lib/character/combat';
	import { resolveHitPoints } from '$lib/character/hitPoints';
	import { resolvePools } from '$lib/character/pools';
	import { resolveLinks } from '$lib/character/links';
	import AppHeader from '$lib/AppHeader.svelte';

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

	const character = $derived(result.status === 'found' ? result.character : null);

	// A group heading renders only when a block in its group renders, so each
	// check uses the same resolver its block uses to decide whether to render.
	const hasStats = $derived(
		character !== null &&
			(resolveAbilities(character.abilities).length > 0 || resolveCombat(character.combat).length > 0)
	);
	const hasHealth = $derived(character !== null && resolveHitPoints(character.hitPoints, storedHp) !== null);
	const hasPools = $derived(character !== null && resolvePools(character.pools, storedPools).length > 0);
	const hasLinks = $derived(
		character !== null && resolveLinks(character.links, resolvePalette(character.color)).length > 0
	);
</script>

{#if result.status === 'loading'}
	<p>Loading…</p>
{:else if result.status === 'found'}
	<!-- The sheet root carries the resolved palette; the CSS maps it to a single
	     --accent / --on-accent for the active light or dark mode. -->
	<article data-palette={resolvePalette(result.character.color)}>
		<AppHeader
			title={result.character.name}
			subtitle={formatIdentity(result.character) || undefined}
			palette={resolvePalette(result.character.color)}
		/>
		<!-- Blocks render in one fixed order: stats, hit points, pools, the
		     authored sections, then the links. Each group heading sits directly
		     before its blocks. -->
		{#if hasStats}
			<div class="group">
				<h2 class="group-heading" data-group-heading>Stats</h2>
				<AbilitiesBlock abilities={result.character.abilities} />
				<CombatBlock combat={result.character.combat} palette={result.character.color} />
			</div>
		{/if}
		{#if hasHealth}
			<div class="group">
				<h2 class="group-heading" data-group-heading>Health</h2>
				<HitPointsBlock
					hitPoints={result.character.hitPoints}
					storedCurrent={storedHp}
					{store}
					{id}
				/>
			</div>
		{/if}
		{#if hasPools}
			<div class="group">
				<h2 class="group-heading" data-group-heading>Pools</h2>
				<ResourcePoolsBlock pools={result.character.pools} {storedPools} {store} {id} />
			</div>
		{/if}
		<SectionsBlock sections={result.character.sections} />
		{#if hasLinks}
			<div class="group">
				<h2 class="group-heading" data-group-heading>Links</h2>
				<LinksBlock links={result.character.links} palette={resolvePalette(result.character.color)} />
			</div>
		{/if}
	</article>
{:else if result.status === 'error'}
	<p>Could not load this character. Try again.</p>
{:else}
	<!-- not-found and invalid share a fixed, id-free message. -->
	<p>Character not found</p>
{/if}

<style>
	article {
		display: grid;
		gap: var(--space-5);
	}

	.group {
		display: grid;
		gap: var(--space-3);
	}

	/* Fixed group labels: small, uppercase, in muted text. */
	.group-heading {
		margin: 0;
		font-family: var(--font-body);
		font-size: 0.8125rem;
		font-weight: 800;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--muted);
	}
</style>
