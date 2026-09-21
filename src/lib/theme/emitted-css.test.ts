import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { PALETTE, PALETTE_NAMES, BASE, type Mode } from './palette';
import { contrastRatio, WCAG_AA } from './contrast';

/**
 * These tests read the values emitted to `palette.css`, not the module, so a
 * bad generator step cannot pass: contrast and the per-name selector mapping
 * are both checked against the shipped stylesheet.
 */

const css = readFileSync(resolve(process.cwd(), 'src/lib/theme/palette.css'), 'utf8');

/** Split the stylesheet into its light scope and its dark @media scope. */
function scopes(source: string): Record<Mode, string> {
	const marker = '@media (prefers-color-scheme: dark) {';
	const at = source.indexOf(marker);
	expect(at, 'dark @media block present').toBeGreaterThan(-1);
	return {
		light: source.slice(0, at),
		dark: source.slice(at + marker.length)
	};
}

/** Extract every `--token: value` declaration inside the block for `selector`. */
function tokensFor(scope: string, selector: string): Record<string, string> {
	// Escape the selector for use in a RegExp, then match its brace block.
	const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
	const match = new RegExp(`${escaped}\\s*\\{([^}]*)\\}`).exec(scope);
	expect(match, `selector ${selector} present`).not.toBeNull();
	const body = match![1];
	const tokens: Record<string, string> = {};
	for (const decl of body.split(';')) {
		const kv = /^\s*(--[a-z-]+)\s*:\s*(#[0-9a-fA-F]{6})\s*$/.exec(decl);
		if (kv) tokens[kv[1]] = kv[2].toLowerCase();
	}
	return tokens;
}

const MODES: Mode[] = ['light', 'dark'];
const parsed = scopes(css);

describe('emitted palette.css contrast (task 2.3)', () => {
	it('meets WCAG AA for every emitted accent/on-accent pair in both modes', () => {
		for (const name of PALETTE_NAMES) {
			for (const mode of MODES) {
				const t = tokensFor(parsed[mode], `[data-palette="${name}"]`);
				const ratio = contrastRatio(t['--accent'], t['--on-accent']);
				expect(ratio, `${name} ${mode}`).toBeGreaterThanOrEqual(WCAG_AA);
			}
		}
	});

	it('meets WCAG AA for the emitted foreground on surface in both modes', () => {
		for (const mode of MODES) {
			const t = tokensFor(parsed[mode], ':root');
			const ratio = contrastRatio(t['--foreground'], t['--surface']);
			expect(ratio, `base ${mode}`).toBeGreaterThanOrEqual(WCAG_AA);
		}
	});
});

describe('emitted palette.css contrast: --deep as text on --surface', () => {
	it('meets WCAG AA for every deep on surface in both modes', () => {
		for (const name of PALETTE_NAMES) {
			for (const mode of MODES) {
				const deep = tokensFor(parsed[mode], `[data-palette="${name}"]`)['--deep'];
				const surface = tokensFor(parsed[mode], ':root')['--surface'];
				const ratio = contrastRatio(deep, surface);
				expect(ratio, `${name} ${mode} deep on surface`).toBeGreaterThanOrEqual(WCAG_AA);
			}
		}
	});
});

describe('emitted palette.css contrast: raised surface and muted text', () => {
	it('meets WCAG AA for the pairs that use raised and muted in both modes', () => {
		for (const mode of MODES) {
			const t = tokensFor(parsed[mode], ':root');
			const pairs: [string, string, string][] = [
				['foreground on raised', '--foreground', '--raised'],
				['muted on surface', '--muted', '--surface'],
				['muted on raised', '--muted', '--raised']
			];
			for (const [label, fg, bg] of pairs) {
				expect(t[fg], `${mode} ${fg}`).toBeDefined();
				expect(t[bg], `${mode} ${bg}`).toBeDefined();
				const ratio = contrastRatio(t[fg], t[bg]);
				expect(ratio, `${mode} ${label}`).toBeGreaterThanOrEqual(WCAG_AA);
			}
		}
	});

	it('meets WCAG AA for every deep on the raised surface in both modes', () => {
		for (const name of PALETTE_NAMES) {
			for (const mode of MODES) {
				const deep = tokensFor(parsed[mode], `[data-palette="${name}"]`)['--deep'];
				const raised = tokensFor(parsed[mode], ':root')['--raised'];
				expect(raised, `${mode} --raised`).toBeDefined();
				const ratio = contrastRatio(deep, raised);
				expect(ratio, `${name} ${mode} deep on raised`).toBeGreaterThanOrEqual(WCAG_AA);
			}
		}
	});
});

describe('emitted selector mapping', () => {
	it('maps each [data-palette] selector to that name\'s own tokens in both modes', () => {
		for (const name of PALETTE_NAMES) {
			for (const mode of MODES) {
				const t = tokensFor(parsed[mode], `[data-palette="${name}"]`);
				expect(t['--accent'], `${name} ${mode} accent`).toBe(PALETTE[name].accent[mode].toLowerCase());
				expect(t['--on-accent'], `${name} ${mode} on-accent`).toBe(
					PALETTE[name].onAccent[mode].toLowerCase()
				);
				expect(t['--tint'], `${name} ${mode} tint`).toBe(PALETTE[name].tint[mode].toLowerCase());
				expect(t['--deep'], `${name} ${mode} deep`).toBe(PALETTE[name].deep[mode].toLowerCase());
			}
		}
	});

	it('emits the base surface, foreground, raised, muted, and structural for both modes', () => {
		for (const mode of MODES) {
			const t = tokensFor(parsed[mode], ':root');
			expect(t['--surface'], `${mode} surface`).toBe(BASE.surface[mode].toLowerCase());
			expect(t['--foreground'], `${mode} foreground`).toBe(BASE.foreground[mode].toLowerCase());
			expect(t['--raised'], `${mode} raised`).toBe(BASE.raised[mode].toLowerCase());
			expect(t['--muted'], `${mode} muted`).toBe(BASE.muted[mode].toLowerCase());
			expect(t['--structural'], `${mode} structural`).toBe(BASE.structural[mode].toLowerCase());
		}
	});
});

describe('emitted palette.css contrast: tint readability', () => {
	it('meets WCAG AA for foreground on every tint in both modes', () => {
		for (const name of PALETTE_NAMES) {
			for (const mode of MODES) {
				const root = tokensFor(parsed[mode], ':root');
				const palette = tokensFor(parsed[mode], `[data-palette="${name}"]`);
				const ratio = contrastRatio(root['--foreground'], palette['--tint']);
				expect(ratio, `${name} ${mode} foreground on tint`).toBeGreaterThanOrEqual(WCAG_AA);
			}
		}
	});

	it('meets WCAG AA for muted text on every tint in both modes', () => {
		for (const name of PALETTE_NAMES) {
			for (const mode of MODES) {
				const root = tokensFor(parsed[mode], ':root');
				const palette = tokensFor(parsed[mode], `[data-palette="${name}"]`);
				const ratio = contrastRatio(root['--muted'], palette['--tint']);
				expect(ratio, `${name} ${mode} muted on tint`).toBeGreaterThanOrEqual(WCAG_AA);
			}
		}
	});

	it('meets WCAG AA for each deep on its own tint in both modes', () => {
		for (const name of PALETTE_NAMES) {
			for (const mode of MODES) {
				const palette = tokensFor(parsed[mode], `[data-palette="${name}"]`);
				const ratio = contrastRatio(palette['--deep'], palette['--tint']);
				expect(ratio, `${name} ${mode} deep on tint`).toBeGreaterThanOrEqual(WCAG_AA);
			}
		}
	});

	it('meets a 1.2:1 separation floor for every tint against the raised surface in both modes', () => {
		const SEPARATION_FLOOR = 1.2;
		for (const name of PALETTE_NAMES) {
			for (const mode of MODES) {
				const root = tokensFor(parsed[mode], ':root');
				const palette = tokensFor(parsed[mode], `[data-palette="${name}"]`);
				const ratio = contrastRatio(palette['--tint'], root['--raised']);
				expect(ratio, `${name} ${mode} tint vs raised`).toBeGreaterThanOrEqual(SEPARATION_FLOOR);
			}
		}
	});
});

describe('emitted palette.css contrast: structural readability', () => {
	it('meets WCAG AA for structural on the surface and raised surface in both modes', () => {
		for (const mode of MODES) {
			const root = tokensFor(parsed[mode], ':root');
			const structural = root['--structural'];
			expect(structural, `${mode} structural defined`).toBeDefined();
			expect(
				contrastRatio(structural, root['--surface']),
				`${mode} structural on surface`
			).toBeGreaterThanOrEqual(WCAG_AA);
			expect(
				contrastRatio(structural, root['--raised']),
				`${mode} structural on raised`
			).toBeGreaterThanOrEqual(WCAG_AA);
		}
	});
});
