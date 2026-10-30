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

<div class="masthead" data-masthead>
	<!-- Off the card, so no control ever covers the avatar. -->
	<div class="bar" data-bar>
		{#if homeLink}
			<a href="/"><span aria-hidden="true">←</span> All heroes</a>
		{/if}
		<ThemeToggle />
	</div>
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
	</header>
</div>

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

	/* The bar stands in for the page's top padding (.page in base.css), so it
	   adds as little height as it can above the card. */
	.masthead {
		display: grid;
		gap: var(--space-2);
		margin-top: calc(-1 * var(--space-4));
	}

	.bar {
		display: flex;
		align-items: center;
		min-height: 2.75rem;
		color: var(--foreground);
	}

	/* The toggle keeps the end of the bar even when it is alone, and drops its
	   border so the rarely used control stays quiet beside the way back. */
	.bar :global(button) {
		margin-inline-start: auto;
		border-color: transparent;
	}

	a {
		display: inline-flex;
		align-items: center;
		gap: var(--space-1);
		min-height: 2.75rem;
		padding: 0 var(--space-3);
		font-weight: 800;
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
