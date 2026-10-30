<script lang="ts">
	import type { PaletteName } from '#lib/theme/palette';
	import ThemeToggle from '#lib/theme/ThemeToggle.svelte';
	import AvatarArt from '#lib/AvatarArt.svelte';

	let {
		title,
		subtitle,
		palette = 'neutral' as PaletteName,
		avatar,
		homeLink = false,
		themeToggle = false
	}: {
		title: string;
		subtitle?: string;
		palette?: PaletteName;
		avatar?: string;
		homeLink?: boolean;
		themeToggle?: boolean;
	} = $props();

	let avatarShowing = $state(false);
</script>

{#snippet card()}
	<header
		data-block="header"
		data-palette={palette}
		data-avatar={avatarShowing || undefined}
		style="background-color: var(--accent); color: var(--on-accent);"
	>
		<div class="text">
			{#if homeLink}
				<span class="caption">‹ All heroes</span>
			{/if}
			<h1>{title}</h1>
			{#if subtitle}
				<p>{subtitle}</p>
			{/if}
		</div>
		<AvatarArt src={avatar} bind:showing={avatarShowing} />
		{#if themeToggle}
			<ThemeToggle />
		{/if}
	</header>
{/snippet}

<!-- The whole card is the tap target, so a child cannot miss it; the caption
     says what a tap does. -->
{#if homeLink}
	<a href="/" aria-label="All heroes" data-way-back>{@render card()}</a>
{:else}
	{@render card()}
{/if}

<style>
	header {
		--avatar-width: min(40%, 14rem);
		position: relative;
		overflow: hidden;
		display: flex;
		align-items: flex-start;
		gap: var(--space-4);
		padding: var(--space-5) var(--space-5) var(--space-4);
		border-radius: var(--radius-l);
		box-shadow: var(--shadow);
	}

	.text {
		flex: 1;
		min-width: 0;
	}

	/* Only while art shows, so a header without it lays out as before. The whole
	   width, fade zone included, keeps the text on solid accent. */
	header[data-avatar] .text {
		padding-right: var(--avatar-width);
	}

	a {
		display: block;
		border-radius: var(--radius-l);
		color: inherit;
		text-decoration: none;
	}

	a:focus-visible {
		outline: 3px solid var(--foreground);
		outline-offset: 2px;
	}

	.caption {
		display: block;
		margin-bottom: var(--space-1);
		font-size: 0.8125rem;
		font-weight: 800;
		letter-spacing: 0.08em;
		text-transform: uppercase;
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
