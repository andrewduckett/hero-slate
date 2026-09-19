import { describe, it, expect } from 'vitest';
import { PALETTE, PALETTE_NAMES, BASE, type Mode, type PaletteName } from './palette';
import { contrastRatio, relativeLuminance, WCAG_AA } from './contrast';

const MODES: Mode[] = ['light', 'dark'];
const HEX = /^#[0-9a-f]{6}$/;

describe('palette module (task 1.1)', () => {
	it('lists exactly the six defined names', () => {
		expect([...PALETTE_NAMES]).toEqual(['forest', 'fire', 'ocean', 'berry', 'sun', 'neutral']);
	});

	it('defines a palette entry for every name and no extras', () => {
		expect(Object.keys(PALETTE).sort()).toEqual([...PALETTE_NAMES].sort());
	});

	it('gives every name a defined accent and on-accent for both modes', () => {
		for (const name of PALETTE_NAMES) {
			const p = PALETTE[name];
			for (const mode of MODES) {
				expect(p.accent[mode], `${name} accent ${mode}`).toMatch(HEX);
				expect(p.onAccent[mode], `${name} on-accent ${mode}`).toMatch(HEX);
			}
		}
	});

	it('defines the base surface and foreground for both modes', () => {
		for (const mode of MODES) {
			expect(BASE.surface[mode], `surface ${mode}`).toMatch(HEX);
			expect(BASE.foreground[mode], `foreground ${mode}`).toMatch(HEX);
		}
	});

	it('uses only opaque #rrggbb values with no alpha channel', () => {
		const values: string[] = [BASE.surface.light, BASE.surface.dark, BASE.foreground.light, BASE.foreground.dark];
		for (const name of PALETTE_NAMES) {
			const p = PALETTE[name];
			values.push(p.accent.light, p.accent.dark, p.onAccent.light, p.onAccent.dark);
		}
		for (const v of values) {
			expect(v, v).toMatch(HEX);
		}
	});
});

describe('palette contrast (task 1.2)', () => {
	it('meets WCAG AA for every accent/on-accent pair in both modes', () => {
		for (const name of PALETTE_NAMES) {
			for (const mode of MODES) {
				const ratio = contrastRatio(PALETTE[name].accent[mode], PALETTE[name].onAccent[mode]);
				expect(ratio, `${name} ${mode} accent/on-accent`).toBeGreaterThanOrEqual(WCAG_AA);
			}
		}
	});

	it('meets WCAG AA for foreground on surface in both modes', () => {
		for (const mode of MODES) {
			const ratio = contrastRatio(BASE.foreground[mode], BASE.surface[mode]);
			expect(ratio, `foreground/surface ${mode}`).toBeGreaterThanOrEqual(WCAG_AA);
		}
	});

	it('computes a known contrast ratio correctly', () => {
		// Black on white is the maximum 21:1.
		expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 1);
		// Luminance of pure white is 1, pure black is 0.
		expect(relativeLuminance('#ffffff')).toBeCloseTo(1, 5);
		expect(relativeLuminance('#000000')).toBeCloseTo(0, 5);
	});
});

// Keep the type import exercised so it is not dropped.
const _sampleName: PaletteName = 'forest';
void _sampleName;
