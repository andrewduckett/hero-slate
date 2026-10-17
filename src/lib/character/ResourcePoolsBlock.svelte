<script lang="ts">
	import { onMount, untrack } from 'svelte';
	import type { StateStore } from '#lib/state/store';
	import { resolvePalette } from '#lib/theme/resolve';
	import { POOL_DOT_LIMIT, resolvePools } from './pools';

	let { pools, storedPools, store, id = '' }: { pools: unknown; storedPools: unknown; store?: StateStore; id?: string } = $props();
	const resolved = untrack(() => resolvePools(pools, storedPools));
	// Spend steps come first and restore steps last, as on the hit points tracker.
	const spend = [-5, -1];
	const restore = [1, 5];
	let counts = $state<Record<string, number>>(Object.fromEntries(resolved.map((pool) => [pool.id, pool.current])));

	function snapshot(): Record<string, number> {
		const next = Object.create(null) as Record<string, number>;
		for (const pool of resolved) next[pool.id] = counts[pool.id];
		return next;
	}

	function step(amount: number): string {
		return amount > 0 ? `+${amount}` : String(amount);
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

	function adjust(poolId: string, max: number, amount: number): void {
		const next = Object.assign(Object.create(null), counts) as Record<string, number>;
		next[poolId] = Math.min(max, Math.max(0, counts[poolId] + amount));
		counts = next;
		persist();
	}

	onMount(() => persist());
</script>

{#if resolved.length > 0}
	<section class="resource-pools" aria-label="Resource pools" data-block="pools">
		{#each resolved as pool (pool.id)}
			{#if pool.max <= POOL_DOT_LIMIT}
				<div class="pool" data-palette={resolvePalette(pool.color)} data-pool-form="dots">
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
			{:else}
				<div
					class="pool"
					data-palette={resolvePalette(pool.color)}
					data-pool-form="counter"
					role="group"
					aria-label={`${pool.label}: ${counts[pool.id]} remaining`}
				>
					<h3>{pool.label}</h3>
					<div class="readout"><span class="current">{counts[pool.id]}</span> / {pool.max}</div>
					<div
						class="bar"
						role="progressbar"
						aria-label={pool.label}
						aria-valuenow={counts[pool.id]}
						aria-valuemin={0}
						aria-valuemax={pool.max}
					>
						<div class="fill" style:width="{(counts[pool.id] / pool.max) * 100}%"></div>
					</div>
					<div class="controls">
						<div class="spend">
							{#each spend as amount}
								<button
									type="button"
									data-pool-adjust={step(amount)}
									aria-label={`${pool.label}: ${step(amount)}`}
									onclick={() => adjust(pool.id, pool.max, amount)}
								>
									{step(amount)}
								</button>
							{/each}
						</div>
						<div class="restore">
							{#each restore as amount}
								<button
									type="button"
									data-pool-adjust={step(amount)}
									aria-label={`${pool.label}: ${step(amount)}`}
									onclick={() => adjust(pool.id, pool.max, amount)}
								>
									{step(amount)}
								</button>
							{/each}
						</div>
					</div>
				</div>
			{/if}
		{/each}
	</section>
{/if}

<style>
	/* Cards sit side by side, a dot card only as wide as its dots, and wrap. */
	.resource-pools {
		display: flex;
		flex-wrap: wrap;
		align-items: start;
		gap: var(--space-3);
	}

	/* Each pool is a raised card with its own palette. */
	.pool {
		flex: 0 1 auto;
		max-inline-size: 100%;
		display: grid;
		gap: var(--space-3);
		padding: var(--space-4);
		background-color: var(--raised);
		border-radius: var(--radius-l);
		box-shadow: var(--shadow);
	}

	/* A counter card fills its row, with room for four buttons on a phone. */
	[data-pool-form='counter'] {
		flex: 1 1 16rem;
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

	/* The max reads at the heading's size, smaller than the current value. */
	.readout {
		font-family: var(--font-display);
		font-size: 1.25rem;
		font-weight: 700;
		line-height: 1;
		color: var(--muted);
	}

	.current {
		font-size: 2rem;
		font-weight: 800;
		color: var(--deep);
	}

	.bar {
		height: 0.75rem;
		border: 2px solid var(--deep);
		border-radius: 999px;
		background-color: var(--tint);
		overflow: hidden;
	}

	.fill {
		height: 100%;
		border-radius: 999px;
		background-color: var(--accent);
	}

	/* Spend on the left, restore on the right, with a flexible gap between. */
	.controls {
		display: flex;
		justify-content: space-between;
		gap: var(--space-2);
	}

	.spend,
	.restore {
		display: flex;
		gap: var(--space-2);
	}

	/* A chunky dot or step button that is its own tap target: 2.75rem is 44 CSS pixels. */
	button {
		inline-size: 2.75rem;
		block-size: 2.75rem;
		padding: 0;
		border-radius: 50%;
		cursor: pointer;
	}

	/* A filled dot and a restore button share one look. */
	button[data-pool-dot='filled'],
	.restore button {
		background-color: var(--tint);
		border: 4px solid var(--deep);
	}

	/* An empty dot and a spend button share the other. */
	button[data-pool-dot='empty'],
	.spend button {
		background-color: transparent;
		border: 4px solid var(--structural);
	}

	[data-pool-adjust] {
		font-family: var(--font-display);
		font-size: 1rem;
		font-weight: 800;
		color: var(--deep);
	}

	button:focus-visible {
		outline: 3px solid var(--foreground);
		outline-offset: 2px;
	}
</style>
