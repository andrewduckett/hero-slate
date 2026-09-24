<script lang="ts">
	import { resolveLinks } from './links';
	import type { PaletteName } from '$lib/theme/palette';

	let { links, palette }: { links: unknown; palette: PaletteName } = $props();

	const resolved = $derived(resolveLinks(links, palette));
</script>

{#if resolved.length > 0}
	<ul class="links" data-block="links">
		{#each resolved as link}
			<li data-palette={link.palette}>
				<a href={link.href} target="_blank" rel="noopener noreferrer">
					<span class="label">{link.label}</span>
					<span class="arrow" aria-hidden="true">↗</span>
					<span class="visually-hidden">(opens in a new tab)</span>
				</a>
			</li>
		{/each}
	</ul>
{/if}

<style>
	.links {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-3);
	}

	a {
		display: inline-flex;
		align-items: center;
		gap: var(--space-2);
		min-height: 44px;
		padding: var(--space-2) var(--space-4);
		border-radius: 999px;
		background-color: var(--tint);
		color: var(--deep);
		font-weight: 700;
		text-decoration: none;
	}

	a:focus-visible {
		outline: 3px solid var(--foreground);
		outline-offset: 2px;
	}

	.arrow {
		font-weight: 400;
	}

	/* Kept in the accessible name, hidden from the visual layout. */
	.visually-hidden {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border: 0;
	}
</style>
