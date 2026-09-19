<script lang="ts">
	import { onMount, untrack } from 'svelte';
	import type { StateStore } from '$lib/state/store';
	import { resolvePalette } from '$lib/theme/resolve';
	import { resolvePools } from './pools';

	let { pools, storedPools, store, id = '' }: { pools: unknown; storedPools: unknown; store?: StateStore; id?: string } = $props();
	const resolved = untrack(() => resolvePools(pools, storedPools));
	let counts = $state<Record<string, number>>(Object.fromEntries(resolved.map((pool) => [pool.id, pool.current])));

	function snapshot(): Record<string, number> {
		const next = Object.create(null) as Record<string, number>;
		for (const pool of resolved) next[pool.id] = counts[pool.id];
		return next;
	}

	function persist(): void {
		store?.write(id, 'pools', snapshot()).catch(() => {});
	}

	function select(poolId: string, dot: number): void {
		const current = counts[poolId];
		const next = Object.assign(Object.create(null), counts) as Record<string, number>;
		next[poolId] = dot <= current ? dot - 1 : dot;
		counts = next;
		persist();
	}

	onMount(() => persist());
</script>

{#if resolved.length > 0}
	<section class="resource-pools" aria-label="Resource pools" data-block="pools">
		{#each resolved as pool (pool.id)}
			<div class="pool" data-palette={resolvePalette(pool.color)}>
				<h3>{pool.label}</h3>
				<div class="dots" aria-label={`${pool.label}: ${counts[pool.id]} remaining`}>
					{#each Array(pool.max) as _, index}
						{@const dot = index + 1}
						<button
							type="button"
							data-pool-dot={dot <= counts[pool.id] ? 'filled' : 'empty'}
							aria-label={`${pool.label}: ${dot} remaining`}
							onclick={() => select(pool.id, dot)}
						></button>
					{/each}
				</div>
			</div>
		{/each}
	</section>
{/if}

<style>
	.resource-pools {
		display: grid;
		gap: var(--space-3);
	}

	/* Each pool is a raised card with its own palette. */
	.pool {
		display: grid;
		gap: var(--space-3);
		padding: var(--space-4);
		background-color: var(--raised);
		border-radius: var(--radius-l);
		box-shadow: var(--shadow);
	}

	h3 {
		margin: 0;
		font-size: 1.25rem;
		font-weight: 800;
	}

	.dots {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
	}

	/* A chunky dot that is its own tap target: 2.75rem is 44 CSS pixels. */
	button {
		inline-size: 2.75rem;
		block-size: 2.75rem;
		padding: 0;
		border: 4px solid var(--accent);
		border-radius: 50%;
		cursor: pointer;
	}

	button[data-pool-dot='filled'] {
		background-color: var(--accent);
	}

	button[data-pool-dot='empty'] {
		background-color: var(--raised);
	}

	button:focus-visible {
		outline: 3px solid var(--foreground);
		outline-offset: 2px;
	}
</style>
