<script lang="ts">
	import '$lib/theme/palette.css';
	import '$lib/theme/fonts.css';
	import '$lib/theme/base.css';
	import ThemeToggle from '$lib/theme/ThemeToggle.svelte';

	let { children } = $props();
</script>

<nav class="theme-controls">
	<ThemeToggle />
</nav>
<main class="page">
	{@render children?.()}
</main>
