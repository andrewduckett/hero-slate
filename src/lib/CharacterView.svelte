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
	import { resolveAbilities } from '$lib/character/abilities';
	import { resolveCombat } from '$lib/character/combat';
	import { resolveHitPoints } from '$lib/character/hitPoints';
	import { resolvePools } from '$lib/character/pools';

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
</script>

{#if result.status === 'loading'}
	<p>Loading…</p>
{:else if result.status === 'found'}
	<!-- The sheet root carries the resolved palette; the CSS maps it to a single
	     --accent / --on-accent for the active light or dark mode. -->
	<article data-palette={resolvePalette(result.character.color)}>
		<header data-block="header" style="background-color: var(--accent); color: var(--on-accent);">
			<h1>{result.character.name}</h1>
			{#if formatIdentity(result.character)}
				<p>{formatIdentity(result.character)}</p>
			{/if}
		</header>
		<!-- Blocks render in one fixed order: stats, hit points, pools, then the
		     authored sections. Each group heading sits directly before its blocks. -->
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

	/* The identity header: a rounded accent card. Its colors come from the
	   inline accent / on-accent style above. */
	header {
		padding: var(--space-5) var(--space-5) var(--space-4);
		border-radius: var(--radius-l);
		box-shadow: var(--shadow);
	}

	h1 {
		margin: 0;
		font-size: clamp(2rem, 8vw, 2.75rem);
		font-weight: 800;
		letter-spacing: -0.01em;
	}

	header p {
		margin: var(--space-1) 0 0;
		font-size: 1.125rem;
		font-weight: 700;
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
