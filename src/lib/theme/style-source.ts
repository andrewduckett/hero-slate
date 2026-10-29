// Test support: read a component's or stylesheet's CSS as written. jsdom applies
// no component styles and runs no transitions, so motion is checked in source.
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

/** The CSS of a `.css` file, or of a `.svelte` file's `<style>` block. */
export function readStyles(path: string): string {
	const source = readFileSync(resolve(process.cwd(), path), 'utf8');
	if (!path.endsWith('.svelte')) return source;
	return source.match(/<style[^>]*>([\s\S]*?)<\/style>/)?.[1] ?? '';
}

/** The `transition` value of the rule whose selector list names `selector`, or ''. */
export function transitionOf(css: string, selector: string): string {
	const withoutComments = css.replace(/\/\*[\s\S]*?\*\//g, '');
	for (const [, selectors, body] of withoutComments.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
		const names = selectors.split(',').map((name) => name.trim());
		if (!names.includes(selector)) continue;
		const value = body.match(/(?:^|;)\s*transition:\s*([^;]+)/)?.[1];
		if (value) return value.replace(/\s+/g, ' ').trim();
	}
	return '';
}

/** One `transition` entry that takes the shared motion timing. */
export function eased(property: string): string {
	return `${property} var(--motion-duration) var(--motion-easing)`;
}
