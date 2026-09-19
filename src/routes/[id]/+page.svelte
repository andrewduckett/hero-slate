<script lang="ts">
	import { page } from '$app/state';
	import { createYamlProvider } from '$lib/data/yaml';
	import { createLocalStorageStore } from '$lib/state/localStorage';
	import CharacterSheet from '$lib/CharacterSheet.svelte';

	// The route wires only the logical id and the concrete provider and store into
	// the sheet container. The container owns the load lifecycle; it never learns a
	// file path or a storage location.
	const provider = createYamlProvider();
	const store = createLocalStorageStore();

	const id = $derived(page.params.id ?? '');
</script>

<CharacterSheet {id} {provider} {store} />
