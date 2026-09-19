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

describe('emitted palette.css contrast: --accent as text on --surface', () => {
	it('meets WCAG AA for every accent on surface in both modes', () => {
		for (const name of PALETTE_NAMES) {
			for (const mode of MODES) {
				const accent = tokensFor(parsed[mode], `[data-palette="${name}"]`)['--accent'];
				const surface = tokensFor(parsed[mode], ':root')['--surface'];
				const ratio = contrastRatio(accent, surface);
				expect(ratio, `${name} ${mode} accent on surface`).toBeGreaterThanOrEqual(WCAG_AA);
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

	it('meets WCAG AA for every accent on the raised surface in both modes', () => {
		for (const name of PALETTE_NAMES) {
			for (const mode of MODES) {
				const accent = tokensFor(parsed[mode], `[data-palette="${name}"]`)['--accent'];
				const raised = tokensFor(parsed[mode], ':root')['--raised'];
				expect(raised, `${mode} --raised`).toBeDefined();
				const ratio = contrastRatio(accent, raised);
				expect(ratio, `${name} ${mode} accent on raised`).toBeGreaterThanOrEqual(WCAG_AA);
			}
		}
	});
});

describe('emitted selector mapping (task 2.4)', () => {
	it('maps each [data-palette] selector to that name\'s own tokens in both modes', () => {
		for (const name of PALETTE_NAMES) {
			for (const mode of MODES) {
				const t = tokensFor(parsed[mode], `[data-palette="${name}"]`);
				expect(t['--accent'], `${name} ${mode} accent`).toBe(PALETTE[name].accent[mode].toLowerCase());
				expect(t['--on-accent'], `${name} ${mode} on-accent`).toBe(
					PALETTE[name].onAccent[mode].toLowerCase()
				);
			}
		}
	});

	it('emits the base surface and foreground for both modes', () => {
		for (const mode of MODES) {
			const t = tokensFor(parsed[mode], ':root');
			expect(t['--surface'], `${mode} surface`).toBe(BASE.surface[mode].toLowerCase());
			expect(t['--foreground'], `${mode} foreground`).toBe(BASE.foreground[mode].toLowerCase());
			expect(t['--raised'], `${mode} raised`).toBe(BASE.raised[mode].toLowerCase());
			expect(t['--muted'], `${mode} muted`).toBe(BASE.muted[mode].toLowerCase());
		}
	});
});
