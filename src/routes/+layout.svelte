<script lang="ts">
	// Import the generated palette tokens once, site-wide. The stylesheet sets
	// the surface as the page background and the foreground as body text, and
	// carries the dark-mode media query, so every route follows the device's
	// light/dark preference with no script. The per-character accent is scoped
	// to the sheet (CharacterView sets `data-palette`); a route with no
	// character, such as `/`, renders in the neutral default.
	import '$lib/theme/palette.css';

	let { children } = $props();
</script>

{@render children()}
