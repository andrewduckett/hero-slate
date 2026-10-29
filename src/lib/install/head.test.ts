import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { APPLE_TOUCH_ICON } from './webmanifest';

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
});
