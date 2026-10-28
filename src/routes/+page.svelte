<script lang="ts">
	import { createYamlProvider } from '#lib/data/yaml';
	import CharacterPicker from '#lib/CharacterPicker.svelte';

	// The route wires only the concrete provider; the picker owns the listing.
	const provider = createYamlProvider();
</script>

<CharacterPicker {provider} />
