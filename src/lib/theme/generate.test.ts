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

	it('emits a light-mode media block (@media prefers-color-scheme: light)', () => {
		expect(generatePaletteCss()).toContain('@media (prefers-color-scheme: light)');
	});

	it('emits --tint and --deep in both the dark base and light media blocks for every name', () => {
		const css = generatePaletteCss();
		const lightMarker = '@media (prefers-color-scheme: light) {';
		const lightAt = css.indexOf(lightMarker);
		const dark = css.slice(0, lightAt);
		const light = css.slice(lightAt + lightMarker.length);
		for (const name of PALETTE_NAMES) {
			const selector = `[data-palette="${name}"]`;
			for (const [label, block] of [['dark base', dark], ['light media', light]] as const) {
				const match = new RegExp(`${selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\{([^}]*)\\}`).exec(block);
				expect(match, `${name} ${label} block present`).not.toBeNull();
				expect(match![1], `${name} ${label} --tint`).toContain('--tint:');
				expect(match![1], `${name} ${label} --deep`).toContain('--deep:');
			}
		}
	});

	it('emits --structural in both the dark base :root and the light media :root blocks', () => {
		const css = generatePaletteCss();
		const lightMarker = '@media (prefers-color-scheme: light) {';
		const lightAt = css.indexOf(lightMarker);
		const dark = css.slice(0, lightAt);
		const light = css.slice(lightAt + lightMarker.length);
		for (const [label, block] of [['dark base', dark], ['light media', light]] as const) {
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
