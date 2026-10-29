import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { APPLE_TOUCH_ICON } from './webmanifest';
import { STARTUP_IMAGES } from './startup-images';

/**
 * Every page, `/` and each `/:id` sheet, is rendered from the one app shell,
 * so a link in its head is on every page.
 */
const appHtml = readFileSync(resolve(process.cwd(), 'src/app.html'), 'utf8');
const head = new DOMParser().parseFromString(appHtml, 'text/html').head;

describe('app shell head', () => {
	it('links the web app manifest', () => {
		const link = head.querySelector('link[rel="manifest"]');
		expect(link?.getAttribute('href')).toBe('/manifest.webmanifest');
	});

	it('links the 180 px icon as the apple-touch-icon', () => {
		const link = head.querySelector('link[rel="apple-touch-icon"]');
		expect(link?.getAttribute('href')).toBe(`/${APPLE_TOUCH_ICON.file}`);
		expect(link?.getAttribute('sizes')).toBe('180x180');
	});

	it('links every iPad startup image with its media query', () => {
		const links = [...head.querySelectorAll('link[rel="apple-touch-startup-image"]')];
		const linked = links.map((link) => `${link.getAttribute('href')} ${link.getAttribute('media')}`);
		const listed = STARTUP_IMAGES.map(({ file, media }) => `/${file} ${media}`);
		expect(links).toHaveLength(10);
		expect(new Set(linked)).toEqual(new Set(listed));
	});
});
