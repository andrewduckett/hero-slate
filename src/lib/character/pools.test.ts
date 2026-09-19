import { describe, expect, it } from 'vitest';
import { resolvePools } from './pools';

describe('resolvePools', () => {
	it('keeps valid pools in their authored order', () => {
		expect(
			resolvePools([
				{ id: 'wild-shape', label: 'Wild Shape', color: 'forest', max: 2 },
				{ id: 'magic', label: 'Magic', color: 'ocean', max: 4 }
			], undefined)
		).toEqual([
			{ id: 'wild-shape', label: 'Wild Shape', color: 'forest', max: 2, current: 2 },
			{ id: 'magic', label: 'Magic', color: 'ocean', max: 4, current: 4 }
		]);
	});

	it('keeps the first valid pool for a duplicate id', () => {
		expect(
			resolvePools([
				{ id: 'magic', label: 'Magic', max: 4 },
				{ id: 'magic', label: 'Spell Slots', max: 2 }
			], undefined)
		).toEqual([{ id: 'magic', label: 'Magic', color: undefined, max: 4, current: 4 }]);
	});

	it.each([
		['a maximum above twelve', { id: 'magic', label: 'Magic', max: 13 }],
		['a blank label', { id: 'magic', label: ' ', max: 2 }],
		['a missing id', { label: 'Magic', max: 2 }]
	])('drops a pool with %s', (_name, pool) => {
		expect(resolvePools([pool], undefined)).toEqual([]);
	});

	it('keeps an unknown color for the theme resolver', () => {
		expect(resolvePools([{ id: 'magic', label: 'Magic', color: 'rainbow', max: 2 }], undefined)[0])
			.toMatchObject({ color: 'rainbow' });
	});

	it('uses stored counts by own pool id and clamps them', () => {
		const stored = JSON.parse('{"wild-shape":4,"magic":-1}');
		expect(
			resolvePools(
				[
					{ id: 'wild-shape', label: 'Wild Shape', max: 2 },
					{ id: 'magic', label: 'Magic', max: 3 }
				],
				stored
			)
		).toMatchObject([{ current: 2 }, { current: 0 }]);
	});

	it('treats an inherited-looking id as an ordinary stored key', () => {
		const stored = JSON.parse('{"__proto__":1,"magic":2}');
		expect(
			resolvePools(
				[
					{ id: '__proto__', label: 'Strange', max: 2 },
					{ id: 'magic', label: 'Magic', max: 3 }
				],
				stored
			)
		).toMatchObject([{ current: 1 }, { current: 2 }]);
	});
});
