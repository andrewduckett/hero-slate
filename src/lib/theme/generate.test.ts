import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { generatePaletteCss } from './generate';
import { PALETTE_NAMES } from './palette';

const cssPath = resolve(process.cwd(), 'src/lib/theme/palette.css');

describe('palette.css generation (task 2.1, 2.2)', () => {
	it('emits a [data-palette] rule for every name', () => {
		const css = generatePaletteCss();
		for (const name of PALETTE_NAMES) {
			expect(css, name).toContain(`[data-palette="${name}"]`);
		}
	});

	it('emits a dark-mode media block', () => {
		expect(generatePaletteCss()).toContain('@media (prefers-color-scheme: dark)');
	});

	it('matches the committed palette.css (regenerate if this fails)', () => {
		const committed = readFileSync(cssPath, 'utf8');
		expect(committed).toBe(generatePaletteCss());
	});
});
