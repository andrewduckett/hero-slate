<script lang="ts">
	import { page } from '$app/state';
	import { createYamlProvider } from '$lib/data/yaml';
	import type { GetCharacterResult } from '$lib/data/provider';
	import CharacterView from '$lib/CharacterView.svelte';

	const provider = createYamlProvider();

	let result = $state<GetCharacterResult | { status: 'loading' }>({ status: 'loading' });

	// Resolve the route's logical id through the provider whenever it changes.
	// The route passes only the id; it never names a file.
	$effect(() => {
		const id = page.params.id;
		result = { status: 'loading' };
		provider.getCharacter(id).then((r) => {
			result = r;
		});
	});
</script>

<CharacterView {result} />
