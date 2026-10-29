<script lang="ts">
	// The one place an avatar becomes an image, shared by the sheet header and the
	// picker card so the site-path rule, the failure handling and the fade agree.
	import { resolveAvatar } from '#lib/avatar';

	let { avatar, showing = $bindable(false) }: { avatar: unknown; showing?: boolean } = $props();

	const src = $derived(resolveAvatar(avatar));
	// Keyed to the source, so a new avatar gets its own chance to load.
	let failedSrc = $state<string | undefined>();
	const visible = $derived(src !== undefined && src !== failedSrc);

	$effect(() => {
		showing = visible;
	});
</script>

{#if visible}
	<img {src} alt="" decoding="async" onerror={() => (failedSrc = src)} />
{/if}

