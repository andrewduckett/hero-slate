import { describe, it, expect } from 'vitest';
import { buildWebManifest } from './webmanifest';

const manifest = buildWebManifest();

describe('web app manifest', () => {
	it('names the app Hero Slate', () => {
		expect(manifest.name).toBe('Hero Slate');
		expect(manifest.short_name).toBe('Hero Slate');
	});

	it('opens standalone, with no browser bar', () => {
		expect(manifest.display).toBe('standalone');
	});

	it('has no fixed start page, id or scope', () => {
		expect(manifest).not.toHaveProperty('start_url');
		expect(manifest).not.toHaveProperty('id');
		expect(manifest).not.toHaveProperty('scope');
	});

	it('uses the dark base surface for theme and background colours', () => {
		expect(manifest.theme_color).toBe('#14171a');
		expect(manifest.background_color).toBe('#14171a');
	});

	it('lists a 192 and a 512 icon for any purpose', () => {
		const any = manifest.icons.filter((icon) => icon.purpose === 'any').map((icon) => icon.sizes);
		expect(any).toEqual(['192x192', '512x512']);
	});

	it('lists exactly one 512 maskable icon', () => {
		const maskable = manifest.icons.filter((icon) => icon.purpose === 'maskable');
		expect(maskable.map((icon) => icon.sizes)).toEqual(['512x512']);
	});

	it('declares every icon as a PNG served from the site root', () => {
		for (const icon of manifest.icons) {
			expect(icon.type).toBe('image/png');
			expect(icon.src).toMatch(/^\/[\w-]+\.png$/);
		}
	});
});
