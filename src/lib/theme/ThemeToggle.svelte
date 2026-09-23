<script lang="ts">
	import { onMount } from 'svelte';
	import { getEffectiveMode, writePreference, readPreference } from './preference';

	let mode = $state<'light' | 'dark'>('dark');

	onMount(() => {
		mode = getEffectiveMode();

		const mq = matchMedia('(prefers-color-scheme: dark)');
		function onDeviceChange() {
			// Only update displayed state if no choice is stored.
			if (readPreference() === null) {
				mode = mq.matches ? 'dark' : 'light';
			}
		}
		mq.addEventListener('change', onDeviceChange);
		return () => mq.removeEventListener('change', onDeviceChange);
	});

	function toggle() {
		const next: 'light' | 'dark' = mode === 'dark' ? 'light' : 'dark';
		writePreference(next);
		document.documentElement.dataset.theme = next;
		mode = next;
	}
</script>

<button
	aria-label="{mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}"
	aria-pressed={mode === 'dark'}
	onclick={toggle}
>
	{mode === 'dark' ? '☀' : '🌙'}
</button>
