import { describe, it, expect } from 'vitest';
import { abilityModifier } from './modifier';

const DASH = '—';

describe('abilityModifier', () => {
	describe('computed from a finite score, floored toward negative infinity', () => {
		const cases: Array<[number, string]> = [
			[14, '+2'],
			[10, '+0'],
			[8, '-1'],
			[0, '-5'],
			[-1, '-6'],
			[9.5, '-1'] // negative fractional case proves floor, not trunc
		];

		it.each(cases)('value %d -> %s', (value, expected) => {
			expect(abilityModifier(value)).toBe(expected);
		});
	});

	it('lets a usable string modifier win over the computed value', () => {
		expect(abilityModifier(13, '+5')).toBe('+5');
	});

	describe('ignores an unusable modifier and falls back to the computed value', () => {
		const unusable: Array<[string, unknown]> = [
			['a number', 3],
			['an empty string', ''],
			['a whitespace-only string', '   ']
		];

		it.each(unusable)('%s falls back to "+2" for value 14', (_label, modifier) => {
			expect(abilityModifier(14, modifier)).toBe('+2');
		});
	});

	describe('shows an em dash for a missing or non-finite value with no usable modifier', () => {
		const noValue: Array<[string, unknown]> = [
			['undefined', undefined],
			['null', null],
			['NaN', NaN],
			['Infinity', Infinity],
			['a numeric string', '10']
		];

		it.each(noValue)('%s -> em dash', (_label, value) => {
			expect(abilityModifier(value)).toBe(DASH);
		});
	});

	it('does not throw on wrong-typed input', () => {
		expect(() => abilityModifier({} as unknown, [] as unknown)).not.toThrow();
	});
});
