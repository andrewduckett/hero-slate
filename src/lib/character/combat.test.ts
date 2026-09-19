import { describe, it, expect } from 'vitest';
import { resolveCombat } from './combat';

const DASH = '—';

describe('resolveCombat', () => {
	it('renders a string value verbatim, adding or removing no sign', () => {
		const [entry] = resolveCombat([{ label: 'Initiative', value: '+2' }]);
		expect(entry.label).toBe('Initiative');
		expect(entry.value).toBe('+2');
	});

	it('renders a finite number as its parsed value', () => {
		const resolved = resolveCombat([
			{ label: 'Armor Class', value: 16 },
			{ label: 'Speed', value: 30 }
		]);
		expect(resolved.map((e) => e.value)).toEqual(['16', '30']);
	});

	describe('shows an em dash for a non-renderable value', () => {
		const nonRenderable: Array<[string, unknown]> = [
			['missing', undefined],
			['null', null],
			['a boolean', true],
			['NaN', NaN],
			['Infinity', Infinity],
			['an array', [1, 2]],
			['an object', { a: 1 }]
		];

		it.each(nonRenderable)('%s -> em dash', (_label, value) => {
			const [entry] = resolveCombat([{ label: 'Armor Class', value }]);
			expect(entry.value).toBe(DASH);
		});
	});

	it('ignores any modifier field on a combat entry', () => {
		const [entry] = resolveCombat([{ label: 'Armor Class', value: 16, modifier: '+9' }]);
		expect(entry.value).toBe('16');
		expect(entry).not.toHaveProperty('modifier');
	});

	it('drops an entry with no usable label', () => {
		const resolved = resolveCombat([
			{ value: 16 }, // no label
			{ label: '   ', value: 30 }, // whitespace-only label
			{ label: 'Speed', value: 30 }
		]);
		expect(resolved.map((e) => e.label)).toEqual(['Speed']);
	});

	describe('returns an empty result for a non-list input', () => {
		const empties: Array<[string, unknown]> = [
			['absent', undefined],
			['null', null],
			['not a list', { armorClass: 16 }]
		];

		it.each(empties)('%s', (_label, input) => {
			expect(resolveCombat(input)).toEqual([]);
		});
	});

	it('does not throw on hostile input', () => {
		expect(() => resolveCombat('nonsense' as unknown)).not.toThrow();
	});
});
