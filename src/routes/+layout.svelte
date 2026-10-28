<script lang="ts">
	import { page } from '$app/state';
	import '#lib/theme/palette.css';
	import '#lib/theme/fonts.css';
	import '#lib/theme/base.css';

	let { children } = $props();
</script>

<main class={['page', page.route.id === '/[id]' && 'page--sheet']}>
	{@render children?.()}
</main>
