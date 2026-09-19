import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

/**
 * These tests read the shipped stylesheets and the `static/fonts/` folder, so a
 * font that loads from another host, hides text while loading, or ships
 * without its licence fails here rather than in a browser.
 */

const root = process.cwd();
const read = (path: string) => readFileSync(resolve(root, path), 'utf8');

const fontsCss = existsSync(resolve(root, 'src/lib/theme/fonts.css')) ? read('src/lib/theme/fonts.css') : '';
const baseCss = existsSync(resolve(root, 'src/lib/theme/base.css')) ? read('src/lib/theme/base.css') : '';

/** Every `@font-face { ... }` body in the stylesheet. */
const faces = [...fontsCss.matchAll(/@font-face\s*\{([^}]*)\}/g)].map((m) => m[1]);

/** Every `url(...)` source named in the stylesheet, without quotes. */
const sources = [...fontsCss.matchAll(/url\(\s*['"]?([^'")]+)['"]?\s*\)/g)].map((m) => m[1]);

describe('self-hosted typefaces', () => {
	it('declares a font face for the display font and the body font', () => {
		expect(faces.length).toBeGreaterThanOrEqual(2);
		expect(fontsCss).toMatch(/font-family:\s*['"]Baloo 2['"]/);
		expect(fontsCss).toMatch(/font-family:\s*['"]Nunito['"]/);
	});

	it('loads every font-face source from a root-relative /fonts/ path', () => {
		expect(sources.length).toBeGreaterThanOrEqual(faces.length);
		for (const src of sources) {
			expect(src, src).toMatch(/^\/fonts\/[^/]/);
			expect(src, src).not.toMatch(/\/\//);
		}
	});

	it('names no other host in the font or base stylesheets', () => {
		for (const [name, css] of [
			['fonts.css', fontsCss],
			['base.css', baseCss]
		]) {
			expect(css, name).not.toMatch(/https?:|\/\/[a-z]/i);
			expect(css, name).not.toMatch(/@import/);
		}
	});

	it('shows fallback text while each font loads', () => {
		for (const face of faces) {
			expect(face).toMatch(/font-display:\s*swap/);
		}
	});

	it('ships each font file and its licence in static/', () => {
		for (const src of sources) {
			const file = resolve(root, 'static', `.${src}`);
			expect(existsSync(file), `${src} exists`).toBe(true);
			const licence = resolve(dirname(file), 'OFL.txt');
			expect(existsSync(licence), `${licence} exists`).toBe(true);
			expect(readFileSync(licence, 'utf8')).toMatch(/SIL OPEN FONT LICENSE Version 1\.1/i);
		}
	});

	it('names a system fallback family after each font', () => {
		expect(baseCss).toMatch(/--font-display:\s*['"]Baloo 2['"],[^;]*system-ui,\s*sans-serif\s*;/);
		expect(baseCss).toMatch(/--font-body:\s*['"]Nunito['"],[^;]*system-ui,\s*sans-serif\s*;/);
	});
});
