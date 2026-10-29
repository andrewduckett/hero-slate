import { describe, it, expect } from 'vitest';
import { resolve } from 'node:path';
import sharp from 'sharp';
import { APPLE_TOUCH_ICON, ICONS } from './webmanifest';
import { BASE } from '../theme/palette';

const ALL_ICONS = [...ICONS, APPLE_TOUCH_ICON];
const BACKGROUND = BASE.surface.dark;

function hex(r: number, g: number, b: number): string {
	return `#${[r, g, b].map((c) => c.toString(16).padStart(2, '0')).join('')}`;
}

async function pixel(file: string, left: number, top: number): Promise<string> {
	const { data } = await sharp(resolve(process.cwd(), 'static', file))
		.extract({ left, top, width: 1, height: 1 })
		.removeAlpha()
		.raw()
		.toBuffer({ resolveWithObject: true });
	return hex(data[0], data[1], data[2]);
}

describe('home-screen icons', () => {
	it.each(ALL_ICONS)('$file is a PNG of its declared size', async ({ file, size }) => {
		const meta = await sharp(resolve(process.cwd(), 'static', file)).metadata();
		expect(meta.format).toBe('png');
		expect([meta.width, meta.height]).toEqual([size, size]);
	});

	it.each(ALL_ICONS)('$file has the dark base surface at its top-left pixel', async ({ file }) => {
		expect(await pixel(file, 0, 0)).toBe(BACKGROUND);
	});

	it.each(ALL_ICONS)('$file shows the logo at its centre pixel', async ({ file, size }) => {
		const centre = Math.floor(size / 2);
		expect(await pixel(file, centre, centre)).not.toBe(BACKGROUND);
	});
});
