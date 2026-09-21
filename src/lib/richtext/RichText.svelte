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
	.pill {
		display: inline-block;
		padding: 0.1em 0.4em;
		border: 1px solid var(--deep);
		border-radius: 0.25em;
		font-size: 0.875em;
		font-weight: 600;
		background-color: var(--tint);
		color: var(--deep);
		white-space: nowrap;
	}
</style>
