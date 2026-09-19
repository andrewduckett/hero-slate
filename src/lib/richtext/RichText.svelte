<script lang="ts">
	import type { Node } from './parse';
	import RichText from './RichText.svelte';

	let { nodes }: { nodes: Node[] } = $props();
</script>

{#each nodes as node (node)}
	{#if node.kind === 'text'}
		{node.text}
	{:else if node.kind === 'strong'}
		<strong><RichText nodes={node.children} /></strong>
	{:else if node.kind === 'em'}
		<em><RichText nodes={node.children} /></em>
	{:else if node.kind === 'pill'}
		<span class="pill" data-flavor={node.flavor}>{#if node.flavor === 'dice'}🎲 {/if}{node.text}</span>
	{/if}
{/each}

<style>
	/* The label keeps the untinted surface behind it: --accent as text on
	   --surface is the pair the theming suite enforces at WCAG AA. A tinted
	   fill would shift the background toward the accent and drop the ratio
	   below 4.5:1 for the darker light-mode palettes. */
	.pill {
		display: inline-block;
		padding: 0.1em 0.4em;
		border: 1px solid color-mix(in srgb, var(--accent) 45%, transparent);
		border-radius: 0.25em;
		font-size: 0.875em;
		font-weight: 600;
		background: transparent;
		color: var(--accent);
		white-space: nowrap;
	}
</style>
