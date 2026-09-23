import { describe, it, expect } from 'vitest';
import { parseReference } from './reference';

describe('parseReference', () => {
	it('accepts a character URL', () => {
		const result = parseReference('https://www.dndbeyond.com/characters/154922980');
		expect(result).toEqual({ status: 'ok', id: '154922980' });
	});

	it('accepts the URL with a trailing slash', () => {
		const result = parseReference('https://www.dndbeyond.com/characters/154922980/');
		expect(result).toEqual({ status: 'ok', id: '154922980' });
	});

	it('accepts the URL with a trailing path segment', () => {
		const result = parseReference('https://www.dndbeyond.com/characters/154922980/builder');
		expect(result).toEqual({ status: 'ok', id: '154922980' });
	});

	it('accepts the URL with a query string', () => {
		const result = parseReference('https://www.dndbeyond.com/characters/154922980?active=true');
		expect(result).toEqual({ status: 'ok', id: '154922980' });
	});

	it('accepts a bare numeric id', () => {
		const result = parseReference('154922980');
		expect(result).toEqual({ status: 'ok', id: '154922980' });
	});

	it('rejects an unrelated host', () => {
		const result = parseReference('https://example.com/characters/154922980');
		expect(result).toEqual({ status: 'unreadable' });
	});

	it('rejects a non-numeric id', () => {
		expect(parseReference('urven')).toEqual({ status: 'unreadable' });
		expect(parseReference('https://www.dndbeyond.com/characters/urven')).toEqual({
			status: 'unreadable'
		});
	});

	it('rejects empty input', () => {
		expect(parseReference('')).toEqual({ status: 'unreadable' });
		expect(parseReference('   ')).toEqual({ status: 'unreadable' });
	});
});
