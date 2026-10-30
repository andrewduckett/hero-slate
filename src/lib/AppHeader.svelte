<script lang="ts">
	import type { PaletteName } from '#lib/theme/palette';
	import ThemeToggle from '#lib/theme/ThemeToggle.svelte';
	import AvatarArt from '#lib/AvatarArt.svelte';

	let {
		title,
		subtitle,
		palette = 'neutral' as PaletteName,
		avatar,
		homeLink = false
	}: { title: string; subtitle?: string; palette?: PaletteName; avatar?: string; homeLink?: boolean } =
		$props();

	let avatarShowing = $state(false);
</script>

<header
	data-block="header"
	data-palette={palette}
	data-avatar={avatarShowing || undefined}
	style="background-color: var(--accent); color: var(--on-accent);"
>
	<div class="text">
		<h1>{title}</h1>
		{#if subtitle}
			<p>{subtitle}</p>
		{/if}
	</div>
	<AvatarArt src={avatar} bind:showing={avatarShowing} />
	<!-- Opaque so the icon keeps the contrast-checked accent pairing over any art. -->
	<span data-toggle-backing style="background-color: var(--accent);">
		<ThemeToggle />
		{#if homeLink}
			<a href="/"><span aria-hidden="true">←</span> All heroes</a>
		{/if}
	</span>
</header>

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

	/* Above the art, with the toggle's own corners, so it never shows as a box.
	   The way back stacks under the toggle, so the name keeps its width. */
	[data-toggle-backing] {
		position: relative;
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		flex-shrink: 0;
		border-radius: var(--radius-s);
	}

	/* Matches ThemeToggle's button, so the two read as one control set. */
	a {
		display: flex;
		align-items: center;
		justify-content: center;
		min-width: 2.75rem;
		min-height: 2.75rem;
		padding: var(--space-2);
		font-size: 1.25rem;
		line-height: 1;
		border: 2px solid currentColor;
		border-radius: var(--radius-s);
		color: inherit;
		text-decoration: none;
	}

	a:focus-visible {
		outline: 2px solid currentColor;
		outline-offset: 2px;
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
