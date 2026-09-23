import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { THEME_STORAGE_KEY } from './preference';

const appHtml = readFileSync(resolve(process.cwd(), 'src/app.html'), 'utf8');

/** Extract the body of the first inline <script> found inside <head>. */
function extractHeadScript(html: string): string | null {
	// Match everything inside <head>...</head>
	const headMatch = /<head[^>]*>([\s\S]*?)<\/head>/i.exec(html);
	if (!headMatch) return null;
	const head = headMatch[1];
	// Match first <script>...</script> block that has no src attribute
	const scriptMatch = /<script(?![^>]*src)[^>]*>([\s\S]*?)<\/script>/i.exec(head);
	if (!scriptMatch) return null;
	return scriptMatch[1];
}

describe('inline pre-paint script in app.html', () => {
	it('the script sits inside <head>', () => {
		const headMatch = /<head[^>]*>([\s\S]*?)<\/head>/i.exec(appHtml);
		expect(headMatch, '<head> block present').not.toBeNull();
		const head = headMatch![1];
		const scriptMatch = /<script(?![^>]*src)[^>]*>[\s\S]*?<\/script>/i.exec(head);
		expect(scriptMatch, 'inline script inside <head>').not.toBeNull();
	});

	it('the key literal in app.html equals THEME_STORAGE_KEY', () => {
		const script = extractHeadScript(appHtml);
		expect(script, 'inline script found').not.toBeNull();
		expect(script!, `key literal "${THEME_STORAGE_KEY}"`).toContain(`'${THEME_STORAGE_KEY}'`);
	});

	it('sets document.documentElement.dataset.theme when light is stored', () => {
		const script = extractHeadScript(appHtml);
		expect(script, 'inline script found').not.toBeNull();

		const document = { documentElement: { dataset: {} as Record<string, string> } };
		const localStorage = { getItem: (_k: string) => 'light' };
		const fn = new Function('document', 'localStorage', script!);
		fn(document, localStorage);
		expect(document.documentElement.dataset.theme).toBe('light');
	});

	it('sets document.documentElement.dataset.theme when dark is stored', () => {
		const script = extractHeadScript(appHtml);
		expect(script, 'inline script found').not.toBeNull();

		const document = { documentElement: { dataset: {} as Record<string, string> } };
		const localStorage = { getItem: (_k: string) => 'dark' };
		const fn = new Function('document', 'localStorage', script!);
		fn(document, localStorage);
		expect(document.documentElement.dataset.theme).toBe('dark');
	});

	it('leaves data-theme unset when a malformed value is stored', () => {
		const script = extractHeadScript(appHtml);
		expect(script, 'inline script found').not.toBeNull();

		const document = { documentElement: { dataset: {} as Record<string, string> } };
		const localStorage = { getItem: (_k: string) => 'system' };
		const fn = new Function('document', 'localStorage', script!);
		fn(document, localStorage);
		expect(document.documentElement.dataset['theme']).toBeUndefined();
	});

	it('leaves data-theme unset and does not throw when storage throws', () => {
		const script = extractHeadScript(appHtml);
		expect(script, 'inline script found').not.toBeNull();

		const document = { documentElement: { dataset: {} as Record<string, string> } };
		const localStorage = {
			getItem: (_k: string) => {
				throw new Error('storage blocked');
			}
		};
		const fn = new Function('document', 'localStorage', script!);
		expect(() => fn(document, localStorage)).not.toThrow();
		expect(document.documentElement.dataset['theme']).toBeUndefined();
	});
});
