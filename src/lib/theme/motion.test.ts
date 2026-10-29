import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { readStyles } from './style-source';

/**
 * These tests read the shipped stylesheet, because jsdom runs no transitions:
 * the shared motion timing can only be checked as written.
 */

const baseCss = readFileSync(resolve(process.cwd(), 'src/lib/theme/base.css'), 'utf8');

/** The body of the first top-level `:root { ... }` rule. */
const rootRule = baseCss.match(/^:root\s*\{([^}]*)\}/m)?.[1] ?? '';

describe('shared motion timing', () => {
	it('defines the shared motion duration as 200 ms', () => {
		expect(rootRule).toMatch(/--motion-duration:\s*200ms;/);
	});

	it('defines the shared motion easing as ease-out', () => {
		expect(rootRule).toMatch(/--motion-easing:\s*ease-out;/);
	});
});

describe('reduced motion', () => {
	it('sets the shared motion duration to 0 when the device asks for reduced motion', () => {
		const query = baseCss.match(
			/@media\s*\(\s*prefers-reduced-motion:\s*reduce\s*\)\s*\{\s*:root\s*\{([^}]*)\}/
		);
		expect(query?.[1]).toMatch(/--motion-duration:\s*0m?s;/);
	});
});

describe('motion timing across the app', () => {
	/** Every `.svelte` and `.css` file under `src/`, relative to the repo root. */
	const styledFiles = readdirSync(resolve(process.cwd(), 'src'), { recursive: true, encoding: 'utf8' })
		.filter((file) => file.endsWith('.svelte') || file.endsWith('.css'))
		.map((file) => `src/${file}`);

	it('names no literal duration in any transition', () => {
		const literal = styledFiles.flatMap((file) =>
			[...readStyles(file).matchAll(/transition(?:-duration)?:\s*([^;]+)/g)]
				.filter(([, value]) => /(^|[\s,])[\d.]+m?s\b/.test(value))
				.map(([declaration]) => `${file}: ${declaration.trim()}`)
		);
		expect(literal).toEqual([]);
	});
});
