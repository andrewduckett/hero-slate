import { describe, it, expect } from 'vitest';
import { resolveSections } from './sections';
import type { ResolvedSection, ResolvedRow } from './sections';

// --- 3.1 Section-level validation ---

describe('resolveSections: empty / missing input', () => {
	it('returns [] for undefined', () => {
		expect(resolveSections(undefined)).toEqual([]);
	});

	it('returns [] for null', () => {
		expect(resolveSections(null)).toEqual([]);
	});

	it('returns [] for non-array', () => {
		expect(resolveSections({ title: 'x' })).toEqual([]);
	});

	it('returns [] for an empty array', () => {
		expect(resolveSections([])).toEqual([]);
	});
});

describe('resolveSections: authored section order preserved', () => {
	it('keeps valid sections in authored order', () => {
		const sections = resolveSections([
			{ title: 'Your Turn', rows: [] },
			{ title: 'Strengths', rows: [] }
		]);
		// Both sections have no valid rows so they should be omitted per spec —
		// but order is tested via sections that DO have rows.
		const withRows = resolveSections([
			{ title: 'Your Turn', rows: [{ body: 'Attack' }] },
			{ title: 'Strengths', rows: [{ body: 'Heal' }] }
		]);
		expect(withRows.map((s) => s.title)).toEqual(['Your Turn', 'Strengths']);
	});
});

describe('resolveSections: invalid definitions silently ignored', () => {
	it('ignores a section with no title', () => {
		const sections = resolveSections([
			{ rows: [{ body: 'x' }] },
			{ title: 'Valid', rows: [{ body: 'y' }] }
		]);
		expect(sections.map((s) => s.title)).toEqual(['Valid']);
	});

	it('ignores a section with empty-string title', () => {
		const sections = resolveSections([
			{ title: '', rows: [{ body: 'x' }] },
			{ title: 'Valid', rows: [{ body: 'y' }] }
		]);
		expect(sections.map((s) => s.title)).toEqual(['Valid']);
	});

	it('ignores a null entry', () => {
		const sections = resolveSections([
			null,
			{ title: 'Valid', rows: [{ body: 'y' }] }
		]);
		expect(sections.map((s) => s.title)).toEqual(['Valid']);
	});

	it('ignores an array entry', () => {
		const sections = resolveSections([
			[{ title: 'Array', rows: [] }],
			{ title: 'Valid', rows: [{ body: 'y' }] }
		]);
		expect(sections.map((s) => s.title)).toEqual(['Valid']);
	});
});

describe('resolveSections: section with zero valid rows is omitted', () => {
	it('omits a section whose rows array is empty', () => {
		const sections = resolveSections([{ title: 'Empty', rows: [] }]);
		expect(sections).toEqual([]);
	});

	it('omits a section whose rows all have no body', () => {
		const sections = resolveSections([
			{ title: 'NoBody', rows: [{ title: 'x' }, null] }
		]);
		expect(sections).toEqual([]);
	});

	it('includes a section that has at least one valid row', () => {
		const sections = resolveSections([
			{ title: 'HasRow', rows: [{ body: 'Do something' }] }
		]);
		expect(sections).toHaveLength(1);
	});
});

describe('resolveSections: color resolution', () => {
	it('resolves absent color to neutral', () => {
		const sections = resolveSections([
			{ title: 'No Color', rows: [{ body: 'x' }] }
		]);
		expect(sections[0].palette).toBe('neutral');
	});

	it('resolves known color to its palette name', () => {
		const sections = resolveSections([
			{ title: 'Forest', color: 'forest', rows: [{ body: 'x' }] }
		]);
		expect(sections[0].palette).toBe('forest');
	});

	it('resolves unknown color to neutral', () => {
		const sections = resolveSections([
			{ title: 'Bad Color', color: 'magenta', rows: [{ body: 'x' }] }
		]);
		expect(sections[0].palette).toBe('neutral');
	});
});

describe('resolveSections: own-key-safe reads', () => {
	it('does not throw when __proto__ appears in a value position', () => {
		expect(() =>
			resolveSections([{ __proto__: { title: 'injected' }, title: 'Safe', rows: [{ body: 'x' }] }])
		).not.toThrow();
	});
});

// --- 3.3 Row resolution ---

describe('resolveSections: row authored order preserved', () => {
	it('keeps rows in authored order within a section', () => {
		const sections = resolveSections([
			{ title: 'S', rows: [{ body: 'Attack' }, { body: 'Help' }] }
		]);
		expect(sections[0].rows.map((r) => r.body)).toEqual(['Attack', 'Help']);
	});
});

describe('resolveSections: row with no body is dropped', () => {
	it('drops a row with no body', () => {
		const sections = resolveSections([
			{ title: 'S', rows: [{ title: 'No Body' }, { body: 'Valid' }] }
		]);
		expect(sections[0].rows).toHaveLength(1);
		expect(sections[0].rows[0].body).toBe('Valid');
	});

	it('drops a row with empty-string body', () => {
		const sections = resolveSections([
			{ title: 'S', rows: [{ body: '' }, { body: 'Valid' }] }
		]);
		expect(sections[0].rows).toHaveLength(1);
	});
});

describe('resolveSections: row without a title is included as body-only', () => {
	it('includes a row with body but no title', () => {
		const sections = resolveSections([
			{ title: 'S', rows: [{ body: 'Just body' }] }
		]);
		expect(sections[0].rows[0].body).toBe('Just body');
		expect(sections[0].rows[0].title).toBeUndefined();
	});
});

describe('resolveSections: row color', () => {
	it('inherits section palette when row has no color', () => {
		const sections = resolveSections([
			{ title: 'S', color: 'sun', rows: [{ body: 'x' }] }
		]);
		expect(sections[0].rows[0].palette).toBe('sun');
	});

	it('uses own color when row specifies one', () => {
		const sections = resolveSections([
			{ title: 'S', color: 'forest', rows: [{ body: 'x', color: 'ocean' }] }
		]);
		expect(sections[0].rows[0].palette).toBe('ocean');
	});

	it('falls back to neutral for unknown row color', () => {
		const sections = resolveSections([
			{ title: 'S', rows: [{ body: 'x', color: 'neon' }] }
		]);
		expect(sections[0].rows[0].palette).toBe('neutral');
	});

	it('inherits section palette when row color is undefined', () => {
		const sections = resolveSections([
			{ title: 'S', color: 'berry', rows: [{ body: 'x', color: undefined }] }
		]);
		expect(sections[0].rows[0].palette).toBe('berry');
	});
});
