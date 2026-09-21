import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { generatePaletteCss } from './generate';
import { PALETTE_NAMES } from './palette';

const cssPath = resolve(process.cwd(), 'src/lib/theme/palette.css');

describe('palette.css generation', () => {
	it('emits a [data-palette] rule for every name', () => {
		const css = generatePaletteCss();
		for (const name of PALETTE_NAMES) {
			expect(css, name).toContain(`[data-palette="${name}"]`);
		}
	});

	it('emits a dark-mode media block', () => {
		expect(generatePaletteCss()).toContain('@media (prefers-color-scheme: dark)');
	});

	it('emits --tint and --deep in both the light and dark blocks for every name', () => {
		const css = generatePaletteCss();
		const darkMarker = '@media (prefers-color-scheme: dark) {';
		const darkAt = css.indexOf(darkMarker);
		const light = css.slice(0, darkAt);
		const dark = css.slice(darkAt + darkMarker.length);
		for (const name of PALETTE_NAMES) {
			const selector = `[data-palette="${name}"]`;
			for (const block of [light, dark]) {
				const match = new RegExp(`${selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\{([^}]*)\\}`).exec(block);
				expect(match, `${name} block present`).not.toBeNull();
				expect(match![1], `${name} --tint`).toContain('--tint:');
				expect(match![1], `${name} --deep`).toContain('--deep:');
			}
		}
	});

	it('emits --structural in both the light and dark :root blocks', () => {
		const css = generatePaletteCss();
		const darkMarker = '@media (prefers-color-scheme: dark) {';
		const darkAt = css.indexOf(darkMarker);
		const light = css.slice(0, darkAt);
		const dark = css.slice(darkAt + darkMarker.length);
		for (const [label, block] of [['light', light], ['dark', dark]] as const) {
			const match = /:root\s*\{([^}]*)\}/.exec(block);
			expect(match, `${label} :root present`).not.toBeNull();
			expect(match![1], `${label} --structural`).toContain('--structural:');
		}
	});

	it('matches the committed palette.css (regenerate if this fails)', () => {
		const committed = readFileSync(cssPath, 'utf8');
		expect(committed).toBe(generatePaletteCss());
	});
});
