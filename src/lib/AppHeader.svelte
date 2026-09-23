<script lang="ts">
	import type { PaletteName } from '$lib/theme/palette';
	import ThemeToggle from '$lib/theme/ThemeToggle.svelte';

	let {
		title,
		subtitle,
		palette = 'neutral' as PaletteName
	}: { title: string; subtitle?: string; palette?: PaletteName } = $props();
</script>

<header
	data-block="header"
	data-palette={palette}
	style="background-color: var(--accent); color: var(--on-accent);"
>
	<div class="header-text">
		<h1>{title}</h1>
		{#if subtitle}
			<p>{subtitle}</p>
		{/if}
	</div>
	<ThemeToggle />
</header>

<style>
	header {
		display: flex;
		align-items: flex-start;
		gap: var(--space-4);
		padding: var(--space-5) var(--space-5) var(--space-4);
		border-radius: var(--radius-l);
		box-shadow: var(--shadow);
	}

	.header-text {
		flex: 1;
		min-width: 0;
	}

	h1 {
		margin: 0;
		font-size: clamp(2rem, 8vw, 2.75rem);
		font-weight: 800;
		letter-spacing: -0.01em;
	}

	p {
		margin: var(--space-1) 0 0;
		font-size: 1.125rem;
		font-weight: 700;
	}
</style>
