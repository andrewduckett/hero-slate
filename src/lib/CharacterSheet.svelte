<script lang="ts">
	// The route container: it loads a character and its per-device state, then hands
	// both to the presentational CharacterView.
	//
	// It reads the character through the provider and the "hp" state through the
	// store side by side, and renders the sheet only after both resolve — so the
	// tracker's controls never appear while state is pending. It binds a result only
	// for the id it requested: when the route id changes while a read is in flight,
	// the late completion for the previous id is discarded, whether the character
	// read or the state read was the slow one. This guards the combined result, not
	// just the state read, so one character's data never lands on another's sheet.
	import type { CharacterProvider, GetCharacterResult } from '$lib/data/provider';
	import type { JsonValue, StateStore } from '$lib/state/store';
	import CharacterView from './CharacterView.svelte';

	let {
		id,
		provider,
		store
	}: { id: string; provider: CharacterProvider; store: StateStore } = $props();

	type ViewState = GetCharacterResult | { status: 'loading' };

	let result = $state<ViewState>({ status: 'loading' });
	let storedHp = $state<JsonValue | undefined>(undefined);
	let boundId = $state('');

	$effect(() => {
		const requestedId = id;
		result = { status: 'loading' };
		let cancelled = false;

		Promise.all([provider.getCharacter(requestedId), store.read(requestedId, 'hp')]).then(
			([characterResult, hp]) => {
				// Drop a completion for a superseded id: the cleanup below flips
				// `cancelled` before the next request starts.
				if (cancelled) return;
				storedHp = hp;
				boundId = requestedId;
				result = characterResult;
			}
		);

		return () => {
			cancelled = true;
		};
	});
</script>

<CharacterView {result} {storedHp} {store} id={boundId} />
