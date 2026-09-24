import { describe, it, expect } from 'vitest';
import { resolveLinks } from './links';

// --- 1.2 Which links are kept ---

describe('resolveLinks: missing or non-list input', () => {
	it('returns [] for undefined', () => {
		expect(resolveLinks(undefined, 'neutral')).toEqual([]);
	});

	it('returns [] for null', () => {
		expect(resolveLinks(null, 'neutral')).toEqual([]);
	});

	it('returns [] for a non-list value', () => {
		expect(resolveLinks('https://example.com', 'neutral')).toEqual([]);
	});

	it('returns [] for an empty array', () => {
		expect(resolveLinks([], 'neutral')).toEqual([]);
	});
});

describe('resolveLinks: URL scheme and shape checks', () => {
	it('keeps an https: link', () => {
		const links = resolveLinks([{ url: 'https://www.dndbeyond.com/spells' }], 'neutral');
		expect(links).toHaveLength(1);
	});

	it('drops a javascript: link', () => {
		expect(resolveLinks([{ url: 'javascript:alert(1)' }], 'neutral')).toEqual([]);
	});

	it('drops an http: link', () => {
		expect(resolveLinks([{ url: 'http://example.com' }], 'neutral')).toEqual([]);
	});

	it('drops a data: link', () => {
		expect(resolveLinks([{ url: 'data:text/plain,hi' }], 'neutral')).toEqual([]);
	});

	it('drops a relative URL', () => {
		expect(resolveLinks([{ url: '/sunny' }], 'neutral')).toEqual([]);
	});

	it('drops a malformed URL', () => {
		expect(resolveLinks([{ url: 'not a url' }], 'neutral')).toEqual([]);
	});

	it('drops a URL with a username and password', () => {
		expect(resolveLinks([{ url: 'https://user:secret@example.com' }], 'neutral')).toEqual([]);
	});

	it('drops a URL with only a username', () => {
		expect(resolveLinks([{ url: 'https://user@example.com' }], 'neutral')).toEqual([]);
	});

	it('drops a bare-string entry', () => {
		expect(resolveLinks(['https://example.com'], 'neutral')).toEqual([]);
	});

	it('drops an entry with no url', () => {
		expect(resolveLinks([{ label: 'No URL' }], 'neutral')).toEqual([]);
	});

	it('drops a null entry', () => {
		expect(resolveLinks([null], 'neutral')).toEqual([]);
	});

	it('keeps valid links around a dropped one, in authored order', () => {
		const links = resolveLinks(
			[
				{ url: 'https://a.example.com', label: 'A' },
				{ label: 'No URL' },
				{ url: 'https://b.example.com', label: 'B' }
			],
			'neutral'
		);
		expect(links.map((l) => l.label)).toEqual(['A', 'B']);
	});
});

// --- 1.3 Labels and colour ---

describe('resolveLinks: labels', () => {
	it('keeps an emoji label as written', () => {
		const links = resolveLinks([{ url: 'https://example.com', label: '📜 D&D Beyond' }], 'neutral');
		expect(links[0].label).toBe('📜 D&D Beyond');
	});

	it('keeps markup in a label as literal text', () => {
		const links = resolveLinks([{ url: 'https://example.com', label: '**Spells**' }], 'neutral');
		expect(links[0].label).toBe('**Spells**');
	});

	it('keeps HTML in a label as literal text', () => {
		const links = resolveLinks([{ url: 'https://example.com', label: '<em>Spells</em>' }], 'neutral');
		expect(links[0].label).toBe('<em>Spells</em>');
	});

	it('falls back to the hostname when the label is missing', () => {
		const links = resolveLinks([{ url: 'https://www.dndbeyond.com/spells' }], 'neutral');
		expect(links[0].label).toBe('www.dndbeyond.com');
	});

	it('falls back to the hostname when the label is blank', () => {
		const links = resolveLinks([{ url: 'https://example.com/tool', label: '   ' }], 'neutral');
		expect(links[0].label).toBe('example.com');
	});

	it('falls back to the hostname when the label is not a string', () => {
		const links = resolveLinks([{ url: 'https://example.com/tool', label: 42 }], 'neutral');
		expect(links[0].label).toBe('example.com');
	});
});

describe('resolveLinks: colour', () => {
	it('uses the character palette when the link has no color', () => {
		const links = resolveLinks([{ url: 'https://example.com' }], 'ocean');
		expect(links[0].palette).toBe('ocean');
	});

	it('uses the link own color when set', () => {
		const links = resolveLinks([{ url: 'https://example.com', color: 'fire' }], 'ocean');
		expect(links[0].palette).toBe('fire');
	});

	it('resolves an unknown color to neutral', () => {
		const links = resolveLinks([{ url: 'https://example.com', color: 'plaid' }], 'ocean');
		expect(links[0].palette).toBe('neutral');
	});
});

describe('resolveLinks: duplicates and href normalisation', () => {
	it('keeps duplicate links', () => {
		const links = resolveLinks(
			[
				{ url: 'https://example.com', label: 'First' },
				{ url: 'https://example.com', label: 'Second' }
			],
			'neutral'
		);
		expect(links).toHaveLength(2);
	});

	it('sets href to the normalised URL', () => {
		const links = resolveLinks([{ url: 'HTTPS://Example.com' }], 'neutral');
		expect(links[0].href).toBe('https://example.com/');
	});
});
