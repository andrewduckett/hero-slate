import { describe, it, expect } from 'vitest';
import { resolve } from 'node:path';
import sharp from 'sharp';
import { APPLE_TOUCH_ICON, ICONS } from './webmanifest';
import { STARTUP_IMAGES } from './startup-images';
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

	it('keeps the maskable logo inside the centre circle of 80% diameter', async () => {
		const { file, size } = ICONS.find(({ purpose }) => purpose === 'maskable')!;
		const { data, info } = await sharp(resolve(process.cwd(), 'static', file))
			.removeAlpha()
			.raw()
			.toBuffer({ resolveWithObject: true });
		const radius = size * 0.4;
		const outside: string[] = [];
		for (let y = 0; y < size; y++) {
			for (let x = 0; x < size; x++) {
				if (Math.hypot(x + 0.5 - size / 2, y + 0.5 - size / 2) <= radius) continue;
				const i = (y * size + x) * info.channels;
				const colour = hex(data[i], data[i + 1], data[i + 2]);
				if (colour !== BACKGROUND) outside.push(`${x},${y} ${colour}`);
			}
		}
		expect(outside).toEqual([]);
	});
});

describe('iPad startup images', () => {
	it.each(STARTUP_IMAGES)('$file is a PNG of its listed size', async ({ file, width, height }) => {
		const meta = await sharp(resolve(process.cwd(), 'static', file)).metadata();
		expect(meta.format).toBe('png');
		expect([meta.width, meta.height]).toEqual([width, height]);
	});

	it.each(STARTUP_IMAGES)('$file shows the logo on the dark base surface', async ({ file, width, height }) => {
		expect(await pixel(file, 0, 0)).toBe(BACKGROUND);
		expect(await pixel(file, Math.floor(width / 2), Math.floor(height / 2))).not.toBe(BACKGROUND);
	});
});
