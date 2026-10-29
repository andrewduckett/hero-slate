import { describe, it, expect } from 'vitest';
import { resolve } from 'node:path';
import sharp from 'sharp';
import { APPLE_TOUCH_ICON, ICONS } from './webmanifest';
import { PALETTE } from '../theme/palette';

const ALL_ICONS = [...ICONS, APPLE_TOUCH_ICON];

function hex(r: number, g: number, b: number): string {
	return `#${[r, g, b].map((c) => c.toString(16).padStart(2, '0')).join('')}`;
}

describe('home-screen icons', () => {
	it.each(ALL_ICONS)('$file is a PNG of its declared size', async ({ file, size }) => {
		const meta = await sharp(resolve(process.cwd(), 'static', file)).metadata();
		expect(meta.format).toBe('png');
		expect([meta.width, meta.height]).toEqual([size, size]);
	});

	it.each(ALL_ICONS)('$file has the neutral light accent at its top-left pixel', async ({ file }) => {
		const { data } = await sharp(resolve(process.cwd(), 'static', file))
			.extract({ left: 0, top: 0, width: 1, height: 1 })
			.removeAlpha()
			.raw()
			.toBuffer({ resolveWithObject: true });
		expect(hex(data[0], data[1], data[2])).toBe(PALETTE.neutral.accent.light);
	});
});
