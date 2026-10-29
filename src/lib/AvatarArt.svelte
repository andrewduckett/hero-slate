<script lang="ts">
	// The one place an avatar becomes an image, shared by the sheet header and the
	// picker card so the failure handling and the fade agree. The provider owns
	// the URL; a character with no art is just an image that fails to load.
	let { src, showing = $bindable() }: { src?: string; showing?: boolean } = $props();

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

<style>
	/* The containing card or header sets --avatar-width, is position: relative,
	   and clips to its own corners. The mask needs no colour, so one image fades
	   into either mode's accent. */
	img {
		position: absolute;
		inset: 0 0 0 auto;
		width: var(--avatar-width);
		height: 100%;
		object-fit: cover;
		object-position: center top;
		-webkit-mask-image: linear-gradient(to right, transparent, black 45%);
		mask-image: linear-gradient(to right, transparent, black 45%);
		pointer-events: none;
	}
</style>
