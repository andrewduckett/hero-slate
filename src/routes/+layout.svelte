<script lang="ts">
	import '$lib/theme/palette.css';
	import '$lib/theme/fonts.css';
	import '$lib/theme/base.css';

	let { children } = $props();
</script>

<main class="page">
	{@render children?.()}
</main>
