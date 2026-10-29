import { describe, it, expect } from 'vitest';
import { STARTUP_IMAGES } from './startup-images';

const PIXELS = [
	[1488, 2266],
	[1640, 2360],
	[1668, 2420],
	[2048, 2732],
	[2064, 2752]
];

describe('iPad startup images', () => {
	it('lists one image per current iPad screen and orientation', () => {
		const sizes = STARTUP_IMAGES.map(({ width, height }) => [width, height]);
		const expected = PIXELS.flatMap(([w, h]) => [
			[w, h],
			[h, w]
		]);
		expect(sizes).toHaveLength(10);
		expect(sizes).toEqual(expect.arrayContaining(expected));
	});

	it('names each file by its pixel size', () => {
		for (const { file, width, height } of STARTUP_IMAGES) {
			expect(file).toBe(`startup/${width}x${height}.png`);
		}
	});

	it('gives portrait images a portrait orientation, and landscape images a landscape one', () => {
		for (const { width, height, orientation } of STARTUP_IMAGES) {
			expect(orientation).toBe(width < height ? 'portrait' : 'landscape');
		}
	});

	it('matches the iPad mini in portrait', () => {
		const image = STARTUP_IMAGES.find(({ file }) => file === 'startup/1488x2266.png');
		expect(image?.media).toBe(
			'(device-width: 744px) and (device-height: 1133px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)'
		);
	});

	it('keeps the portrait points for the iPad mini in landscape', () => {
		const image = STARTUP_IMAGES.find(({ file }) => file === 'startup/2266x1488.png');
		expect(image?.media).toBe(
			'(device-width: 744px) and (device-height: 1133px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)'
		);
	});

	it('gives every image its own media query', () => {
		const queries = new Set(STARTUP_IMAGES.map(({ media }) => media));
		expect(queries.size).toBe(STARTUP_IMAGES.length);
	});
});
