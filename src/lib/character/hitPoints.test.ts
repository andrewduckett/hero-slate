import { describe, it, expect } from 'vitest';
import { resolveHitPoints } from './hitPoints';

describe('resolveHitPoints', () => {
	it('starts at full health on first load, with no stored current', () => {
		expect(resolveHitPoints({ max: 45 }, undefined)).toEqual({ current: 45, max: 45 });
	});

	it('ignores an authored current in the file', () => {
		// The definition may still carry `current`; the resolver never reads it.
		expect(resolveHitPoints({ max: 45, current: 20 }, undefined)).toEqual({ current: 45, max: 45 });
	});

	it('uses the stored current when present', () => {
		expect(resolveHitPoints({ max: 45 }, 30)).toEqual({ current: 30, max: 45 });
	});

	it('clamps a stored value above max down to max', () => {
		expect(resolveHitPoints({ max: 40 }, 45)).toEqual({ current: 40, max: 40 });
	});

	it('clamps a stored value below zero up to zero', () => {
		expect(resolveHitPoints({ max: 45 }, -1)).toEqual({ current: 0, max: 45 });
	});

	it('does not heal when max is raised above the stored current', () => {
		expect(resolveHitPoints({ max: 50 }, 40)).toEqual({ current: 40, max: 50 });
	});

	describe('has no hit points to track', () => {
		it.each([
			['hitPoints absent', undefined],
			['null hitPoints', null],
			['max missing', {}],
			['max zero', { max: 0 }],
			['max negative', { max: -5 }],
			['max fractional', { max: 12.5 }],
			['max not finite', { max: Number.POSITIVE_INFINITY }],
			['max NaN', { max: NaN }],
			['max a string', { max: '45' }],
			['hitPoints a list', [{ max: 45 }]]
		])('returns null when %s', (_label, hitPoints) => {
			expect(resolveHitPoints(hitPoints, 30)).toBeNull();
		});
	});

	it('starts at max when the stored current is not a finite integer', () => {
		expect(resolveHitPoints({ max: 45 }, 30.5)).toEqual({ current: 45, max: 45 });
		expect(resolveHitPoints({ max: 45 }, Number.POSITIVE_INFINITY)).toEqual({ current: 45, max: 45 });
		expect(resolveHitPoints({ max: 45 }, NaN)).toEqual({ current: 45, max: 45 });
		expect(resolveHitPoints({ max: 45 }, '30')).toEqual({ current: 45, max: 45 });
	});

	it('never throws on missing or wrong-typed data', () => {
		expect(() => resolveHitPoints(undefined, undefined)).not.toThrow();
		expect(() => resolveHitPoints('nonsense', { nested: true })).not.toThrow();
	});
});
