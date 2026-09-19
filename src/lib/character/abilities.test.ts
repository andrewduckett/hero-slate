import { describe, it, expect } from 'vitest';
import { resolveAbilities } from './abilities';

describe('resolveAbilities', () => {
	it('keeps valid entries in authored order', () => {
		const resolved = resolveAbilities([
			{ label: 'Strength', value: 10 },
			{ label: 'Dexterity', value: 14 },
			{ label: 'Wisdom', value: 18 }
		]);

		expect(resolved.map((e) => e.label)).toEqual(['Strength', 'Dexterity', 'Wisdom']);
		expect(resolved.map((e) => e.modifier)).toEqual(['+0', '+2', '+4']);
		expect(resolved.map((e) => e.score)).toEqual([10, 14, 18]);
	});

	it('carries a usable authored modifier and the raw score together', () => {
		const [entry] = resolveAbilities([{ label: 'Strength', value: 13, modifier: '+5' }]);
		expect(entry.modifier).toBe('+5');
		expect(entry.score).toBe(13);
	});

	it('reports no raw score when the value is not a finite number', () => {
		const [entry] = resolveAbilities([{ label: 'Strength', modifier: '+2' }]);
		expect(entry.score).toBeNull();
		expect(entry.modifier).toBe('+2');
	});

	it('drops every kind of invalid list member, keeping only valid entries', () => {
		const resolved = resolveAbilities([
			null,
			7,
			['not', 'an', 'entry'],
			true,
			{ value: 10 }, // no label
			{ label: '', value: 10 }, // empty label
			{ label: '   ', value: 10 }, // whitespace-only label
			{ label: 'Strength', value: 10 } // the one valid entry
		]);

		expect(resolved.map((e) => e.label)).toEqual(['Strength']);
	});

	it('keeps two entries with the same label', () => {
		const resolved = resolveAbilities([
			{ label: 'Strength', value: 10 },
			{ label: 'Strength', value: 14 }
		]);

		expect(resolved.map((e) => e.label)).toEqual(['Strength', 'Strength']);
		expect(resolved.map((e) => e.score)).toEqual([10, 14]);
	});

	it('never recurses into nested objects or arrays', () => {
		const resolved = resolveAbilities([
			{ label: 'Strength', value: { inner: 12 } },
			{ label: 'Dexterity', value: [{ label: 'Nested', value: 8 }] }
		]);

		// Both entries survive on their own labels; nested data is not treated as entries.
		expect(resolved.map((e) => e.label)).toEqual(['Strength', 'Dexterity']);
		expect(resolved.map((e) => e.score)).toEqual([null, null]);
	});

	describe('returns an empty result when there are no valid entries', () => {
		const empties: Array<[string, unknown]> = [
			['absent', undefined],
			['null', null],
			['not a list', { str: 10 }],
			['a list of only invalid members', [null, 3, { value: 1 }]]
		];

		it.each(empties)('%s', (_label, input) => {
			expect(resolveAbilities(input)).toEqual([]);
		});
	});

	it('does not throw on hostile input', () => {
		expect(() => resolveAbilities('nonsense' as unknown)).not.toThrow();
	});
});
