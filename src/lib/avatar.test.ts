import { describe, it, expect } from 'vitest';
import { resolveAvatar } from './avatar';

describe('resolveAvatar', () => {
	it('resolves a site path to itself', () => {
		expect(resolveAvatar('/characters/test-hero.png')).toBe('/characters/test-hero.png');
	});

	const noAvatar: Array<[string, unknown]> = [
		['a remote URL', 'https://example.test/hero.png'],
		['a protocol-relative URL', '//example.test/hero.png'],
		['a backslash browsers read as a slash', '/\\example.test/hero.png'],
		['an embedded newline browsers strip', '/\n/example.test/hero.png'],
		['an embedded tab browsers strip', '/\t/example.test/hero.png'],
		['a scheme', 'javascript:alert(1)'],
		['a relative path', 'characters/test-hero.png'],
		['the empty string', ''],
		['a number', 42],
		['a mapping', { src: '/characters/test-hero.png' }],
		['undefined', undefined]
	];

	it.each(noAvatar)('resolves %s to no avatar', (_label, value) => {
		expect(resolveAvatar(value)).toBeUndefined();
	});
});
