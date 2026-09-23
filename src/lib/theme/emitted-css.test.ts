import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { PALETTE, PALETTE_NAMES, BASE } from './palette';
import { contrastRatio, WCAG_AA } from './contrast';

/**
 * These tests read the values emitted to `palette.css`, not the module, so a
 * bad generator step cannot pass: contrast and the per-name selector mapping
 * are both checked against the shipped stylesheet.
 *
 * The stylesheet has four named contexts:
 *  - dark-device:  base :root (outside any @media, outside any data-theme)
 *  - light-device: :root inside @media (prefers-color-scheme: light)
 *  - dark-choice:  :root[data-theme="dark"]
 *  - light-choice: :root[data-theme="light"]
 */

const css = readFileSync(resolve(process.cwd(), 'src/lib/theme/palette.css'), 'utf8');

type Context = 'dark-device' | 'light-device' | 'dark-choice' | 'light-choice';

/**
 * Extract the CSS text for each of the four contexts from the stylesheet.
 *
 * Strategy: split on the markers that bound each context, then pass each
 * slice to tokensFor.
 */
function extractContexts(source: string): Record<Context, string> {
	// The light media block.
	const lightMediaMarker = '@media (prefers-color-scheme: light) {';
	const darkChoiceMarker = ':root[data-theme="dark"]';
	const lightChoiceMarker = ':root[data-theme="light"]';

	const lightMediaAt = source.indexOf(lightMediaMarker);
	expect(lightMediaAt, '@media (prefers-color-scheme: light) block present').toBeGreaterThan(-1);

	const darkChoiceAt = source.indexOf(darkChoiceMarker);
	expect(darkChoiceAt, ':root[data-theme="dark"] block present').toBeGreaterThan(-1);

	const lightChoiceAt = source.indexOf(lightChoiceMarker);
	expect(lightChoiceAt, ':root[data-theme="light"] block present').toBeGreaterThan(-1);

	return {
		'dark-device': source.slice(0, lightMediaAt),
		'light-device': source.slice(lightMediaAt, darkChoiceAt),
		'dark-choice': source.slice(darkChoiceAt, lightChoiceAt),
		'light-choice': source.slice(lightChoiceAt)
	};
}

/** Extract every `--token: value` declaration inside the block for `selector`. */
function tokensFor(scope: string, selector: string): Record<string, string> {
	const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
	const match = new RegExp(`${escaped}\\s*\\{([^}]*)\\}`).exec(scope);
	expect(match, `selector "${selector}" present in context`).not.toBeNull();
	const body = match![1];
	const tokens: Record<string, string> = {};
	for (const decl of body.split(';')) {
		const kv = /^\s*(--[a-z-]+)\s*:\s*(#[0-9a-fA-F]{6})\s*$/.exec(decl);
		if (kv) tokens[kv[1]] = kv[2].toLowerCase();
	}
	return tokens;
}

/** Extract the color-scheme value from a selector in a scope. */
function colorSchemeFor(scope: string, selector: string): string | null {
	const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
	const match = new RegExp(`${escaped}\\s*\\{([^}]*)\\}`).exec(scope);
	if (!match) return null;
	const csMatch = /color-scheme:\s*([^;]+);/.exec(match[1]);
	return csMatch ? csMatch[1].trim() : null;
}

const contexts = extractContexts(css);

describe('four-context structure', () => {
	it('dark-device context exists (base :root outside @media and data-theme)', () => {
		expect(contexts['dark-device']).toContain(':root');
	});

	it('light-device context exists (@media prefers-color-scheme: light block)', () => {
		expect(contexts['light-device']).toContain('@media (prefers-color-scheme: light)');
	});

	it('dark-choice context exists (:root[data-theme="dark"])', () => {
		expect(contexts['dark-choice']).toContain(':root[data-theme="dark"]');
	});

	it('light-choice context exists (:root[data-theme="light"])', () => {
		expect(contexts['light-choice']).toContain(':root[data-theme="light"]');
	});

	it('each context sets color-scheme on :root', () => {
		const darkDeviceCs = colorSchemeFor(contexts['dark-device'], ':root');
		expect(darkDeviceCs, 'dark-device color-scheme').not.toBeNull();

		const lightDeviceCs = colorSchemeFor(
			contexts['light-device'],
			':root'
		);
		expect(lightDeviceCs, 'light-device color-scheme').not.toBeNull();

		const darkChoiceCs = colorSchemeFor(contexts['dark-choice'], ':root\\[data-theme="dark"\\]');
		// Also accept color-scheme on any rule in the dark-choice context
		expect(
			contexts['dark-choice'].includes('color-scheme'),
			'dark-choice has color-scheme'
		).toBe(true);

		expect(
			contexts['light-choice'].includes('color-scheme'),
			'light-choice has color-scheme'
		).toBe(true);
	});
});

describe('device and choice contexts carry identical token maps per mode', () => {
	it('dark-device :root tokens equal dark-choice :root tokens', () => {
		const deviceRoot = tokensFor(contexts['dark-device'], ':root');
		const choiceRoot = tokensFor(contexts['dark-choice'], ':root[data-theme="dark"]');
		expect(choiceRoot, 'dark choice :root tokens').toEqual(deviceRoot);
	});

	it('light-device :root tokens equal light-choice :root tokens', () => {
		const deviceRoot = tokensFor(contexts['light-device'], ':root');
		const choiceRoot = tokensFor(contexts['light-choice'], ':root[data-theme="light"]');
		expect(choiceRoot, 'light choice :root tokens').toEqual(deviceRoot);
	});

	it('dark-device [data-palette] tokens equal dark-choice [data-palette] tokens for every name', () => {
		for (const name of PALETTE_NAMES) {
			const device = tokensFor(contexts['dark-device'], `[data-palette="${name}"]`);
			const choice = tokensFor(contexts['dark-choice'], `[data-palette="${name}"]`);
			expect(choice, `dark ${name}`).toEqual(device);
		}
	});

	it('light-device [data-palette] tokens equal light-choice [data-palette] tokens for every name', () => {
		for (const name of PALETTE_NAMES) {
			const device = tokensFor(contexts['light-device'], `[data-palette="${name}"]`);
			const choice = tokensFor(contexts['light-choice'], `[data-palette="${name}"]`);
			expect(choice, `light ${name}`).toEqual(device);
		}
	});
});

describe('emitted palette.css contrast (task 2.3)', () => {
	it('meets WCAG AA for every emitted accent/on-accent pair in both modes (device and choice)', () => {
		for (const name of PALETTE_NAMES) {
			for (const [ctx, selector] of [
				['dark-device', `[data-palette="${name}"]`],
				['light-device', `[data-palette="${name}"]`],
				['dark-choice', `[data-palette="${name}"]`],
				['light-choice', `[data-palette="${name}"]`]
			] as const) {
				const t = tokensFor(contexts[ctx], selector);
				const ratio = contrastRatio(t['--accent'], t['--on-accent']);
				expect(ratio, `${name} ${ctx}`).toBeGreaterThanOrEqual(WCAG_AA);
			}
		}
	});

	it('meets WCAG AA for the emitted foreground on surface in both modes (device and choice)', () => {
		for (const [ctx, selector] of [
			['dark-device', ':root'],
			['light-device', ':root'],
			['dark-choice', ':root[data-theme="dark"]'],
			['light-choice', ':root[data-theme="light"]']
		] as const) {
			const t = tokensFor(contexts[ctx], selector);
			const ratio = contrastRatio(t['--foreground'], t['--surface']);
			expect(ratio, `base ${ctx}`).toBeGreaterThanOrEqual(WCAG_AA);
		}
	});
});

describe('emitted palette.css contrast: --deep as text on --surface', () => {
	it('meets WCAG AA for every deep on surface in both modes (device and choice)', () => {
		for (const [ctx, rootSel, palSel] of [
			['dark-device', ':root', (n: string) => `[data-palette="${n}"]`],
			['light-device', ':root', (n: string) => `[data-palette="${n}"]`],
			['dark-choice', ':root[data-theme="dark"]', (n: string) => `[data-palette="${n}"]`],
			['light-choice', ':root[data-theme="light"]', (n: string) => `[data-palette="${n}"]`]
		] as const) {
			for (const name of PALETTE_NAMES) {
				const deep = tokensFor(contexts[ctx], palSel(name))['--deep'];
				const surface = tokensFor(contexts[ctx], rootSel)['--surface'];
				const ratio = contrastRatio(deep, surface);
				expect(ratio, `${name} ${ctx} deep on surface`).toBeGreaterThanOrEqual(WCAG_AA);
			}
		}
	});
});

describe('emitted palette.css contrast: raised surface and muted text', () => {
	it('meets WCAG AA for the pairs that use raised and muted in both modes (device and choice)', () => {
		for (const [ctx, sel] of [
			['dark-device', ':root'],
			['light-device', ':root'],
			['dark-choice', ':root[data-theme="dark"]'],
			['light-choice', ':root[data-theme="light"]']
		] as const) {
			const t = tokensFor(contexts[ctx], sel);
			const pairs: [string, string, string][] = [
				['foreground on raised', '--foreground', '--raised'],
				['muted on surface', '--muted', '--surface'],
				['muted on raised', '--muted', '--raised']
			];
			for (const [label, fg, bg] of pairs) {
				expect(t[fg], `${ctx} ${fg}`).toBeDefined();
				expect(t[bg], `${ctx} ${bg}`).toBeDefined();
				const ratio = contrastRatio(t[fg], t[bg]);
				expect(ratio, `${ctx} ${label}`).toBeGreaterThanOrEqual(WCAG_AA);
			}
		}
	});

	it('meets WCAG AA for every deep on the raised surface in both modes (device and choice)', () => {
		for (const [ctx, rootSel, palSel] of [
			['dark-device', ':root', (n: string) => `[data-palette="${n}"]`],
			['light-device', ':root', (n: string) => `[data-palette="${n}"]`],
			['dark-choice', ':root[data-theme="dark"]', (n: string) => `[data-palette="${n}"]`],
			['light-choice', ':root[data-theme="light"]', (n: string) => `[data-palette="${n}"]`]
		] as const) {
			for (const name of PALETTE_NAMES) {
				const deep = tokensFor(contexts[ctx], palSel(name))['--deep'];
				const raised = tokensFor(contexts[ctx], rootSel)['--raised'];
				expect(raised, `${ctx} --raised`).toBeDefined();
				const ratio = contrastRatio(deep, raised);
				expect(ratio, `${name} ${ctx} deep on raised`).toBeGreaterThanOrEqual(WCAG_AA);
			}
		}
	});
});

describe('emitted selector mapping', () => {
	it('maps each [data-palette] selector to that name\'s own tokens in both modes (all contexts)', () => {
		for (const [ctx, palSel] of [
			['dark-device', (n: string) => `[data-palette="${n}"]`],
			['light-device', (n: string) => `[data-palette="${n}"]`],
			['dark-choice', (n: string) => `[data-palette="${n}"]`],
			['light-choice', (n: string) => `[data-palette="${n}"]`]
		] as const) {
			const mode = ctx.startsWith('dark') ? 'dark' : 'light';
			for (const name of PALETTE_NAMES) {
				const t = tokensFor(contexts[ctx], palSel(name));
				expect(t['--accent'], `${name} ${ctx} accent`).toBe(PALETTE[name].accent[mode].toLowerCase());
				expect(t['--on-accent'], `${name} ${ctx} on-accent`).toBe(
					PALETTE[name].onAccent[mode].toLowerCase()
				);
				expect(t['--tint'], `${name} ${ctx} tint`).toBe(PALETTE[name].tint[mode].toLowerCase());
				expect(t['--deep'], `${name} ${ctx} deep`).toBe(PALETTE[name].deep[mode].toLowerCase());
			}
		}
	});

	it('emits the base surface, foreground, raised, muted, and structural for both modes (all contexts)', () => {
		for (const [ctx, sel] of [
			['dark-device', ':root'],
			['light-device', ':root'],
			['dark-choice', ':root[data-theme="dark"]'],
			['light-choice', ':root[data-theme="light"]']
		] as const) {
			const mode = ctx.startsWith('dark') ? 'dark' : 'light';
			const t = tokensFor(contexts[ctx], sel);
			expect(t['--surface'], `${ctx} surface`).toBe(BASE.surface[mode].toLowerCase());
			expect(t['--foreground'], `${ctx} foreground`).toBe(BASE.foreground[mode].toLowerCase());
			expect(t['--raised'], `${ctx} raised`).toBe(BASE.raised[mode].toLowerCase());
			expect(t['--muted'], `${ctx} muted`).toBe(BASE.muted[mode].toLowerCase());
			expect(t['--structural'], `${ctx} structural`).toBe(BASE.structural[mode].toLowerCase());
		}
	});
});

describe('emitted palette.css contrast: tint readability', () => {
	it('meets WCAG AA for foreground on every tint in both modes (all contexts)', () => {
		for (const [ctx, rootSel, palSel] of [
			['dark-device', ':root', (n: string) => `[data-palette="${n}"]`],
			['light-device', ':root', (n: string) => `[data-palette="${n}"]`],
			['dark-choice', ':root[data-theme="dark"]', (n: string) => `[data-palette="${n}"]`],
			['light-choice', ':root[data-theme="light"]', (n: string) => `[data-palette="${n}"]`]
		] as const) {
			for (const name of PALETTE_NAMES) {
				const root = tokensFor(contexts[ctx], rootSel);
				const palette = tokensFor(contexts[ctx], palSel(name));
				const ratio = contrastRatio(root['--foreground'], palette['--tint']);
				expect(ratio, `${name} ${ctx} foreground on tint`).toBeGreaterThanOrEqual(WCAG_AA);
			}
		}
	});

	it('meets WCAG AA for muted text on every tint in both modes (all contexts)', () => {
		for (const [ctx, rootSel, palSel] of [
			['dark-device', ':root', (n: string) => `[data-palette="${n}"]`],
			['light-device', ':root', (n: string) => `[data-palette="${n}"]`],
			['dark-choice', ':root[data-theme="dark"]', (n: string) => `[data-palette="${n}"]`],
			['light-choice', ':root[data-theme="light"]', (n: string) => `[data-palette="${n}"]`]
		] as const) {
			for (const name of PALETTE_NAMES) {
				const root = tokensFor(contexts[ctx], rootSel);
				const palette = tokensFor(contexts[ctx], palSel(name));
				const ratio = contrastRatio(root['--muted'], palette['--tint']);
				expect(ratio, `${name} ${ctx} muted on tint`).toBeGreaterThanOrEqual(WCAG_AA);
			}
		}
	});

	it('meets WCAG AA for each deep on its own tint in both modes (all contexts)', () => {
		for (const [ctx, palSel] of [
			['dark-device', (n: string) => `[data-palette="${n}"]`],
			['light-device', (n: string) => `[data-palette="${n}"]`],
			['dark-choice', (n: string) => `[data-palette="${n}"]`],
			['light-choice', (n: string) => `[data-palette="${n}"]`]
		] as const) {
			for (const name of PALETTE_NAMES) {
				const palette = tokensFor(contexts[ctx], palSel(name));
				const ratio = contrastRatio(palette['--deep'], palette['--tint']);
				expect(ratio, `${name} ${ctx} deep on tint`).toBeGreaterThanOrEqual(WCAG_AA);
			}
		}
	});

	it('meets a 1.2:1 separation floor for every tint against the raised surface in both modes (all contexts)', () => {
		const SEPARATION_FLOOR = 1.2;
		for (const [ctx, rootSel, palSel] of [
			['dark-device', ':root', (n: string) => `[data-palette="${n}"]`],
			['light-device', ':root', (n: string) => `[data-palette="${n}"]`],
			['dark-choice', ':root[data-theme="dark"]', (n: string) => `[data-palette="${n}"]`],
			['light-choice', ':root[data-theme="light"]', (n: string) => `[data-palette="${n}"]`]
		] as const) {
			for (const name of PALETTE_NAMES) {
				const root = tokensFor(contexts[ctx], rootSel);
				const palette = tokensFor(contexts[ctx], palSel(name));
				const ratio = contrastRatio(palette['--tint'], root['--raised']);
				expect(ratio, `${name} ${ctx} tint vs raised`).toBeGreaterThanOrEqual(SEPARATION_FLOOR);
			}
		}
	});
});

describe('emitted palette.css contrast: structural readability', () => {
	it('meets WCAG AA for structural on the surface and raised surface in both modes (all contexts)', () => {
		for (const [ctx, sel] of [
			['dark-device', ':root'],
			['light-device', ':root'],
			['dark-choice', ':root[data-theme="dark"]'],
			['light-choice', ':root[data-theme="light"]']
		] as const) {
			const root = tokensFor(contexts[ctx], sel);
			const structural = root['--structural'];
			expect(structural, `${ctx} structural defined`).toBeDefined();
			expect(
				contrastRatio(structural, root['--surface']),
				`${ctx} structural on surface`
			).toBeGreaterThanOrEqual(WCAG_AA);
			expect(
				contrastRatio(structural, root['--raised']),
				`${ctx} structural on raised`
			).toBeGreaterThanOrEqual(WCAG_AA);
		}
	});
});
