import { describe, it, expect } from 'vitest';
import { computeLimitedUses, type LimitedUseEntry } from './limitedUses';
import type { AbilityScores } from './digest';

function abilities(overrides: Partial<AbilityScores> = {}): AbilityScores {
	return {
		strength: 10,
		dexterity: 10,
		constitution: 10,
		intelligence: 10,
		wisdom: 10,
		charisma: 10,
		...overrides
	};
}

function entry(rule: Record<string, unknown>, overrides: Partial<LimitedUseEntry> = {}): LimitedUseEntry {
	return {
		name: 'Test Feature',
		source: 'class',
		rule: {
			maxUses: 0,
			statModifierUsesId: null,
			useProficiencyBonus: false,
			proficiencyBonusOperator: 1,
			resetType: null,
			...rule
		},
		...overrides
	};
}

describe('computeLimitedUses — the maximum', () => {
	it('uses the fixed number of uses', () => {
		const [result] = computeLimitedUses([entry({ maxUses: 6 })], abilities(), 6);
		expect(result.max).toBe(6);
		expect(result.maxReason).toBeNull();
	});

	it('adds the named ability modifier', () => {
		const [result] = computeLimitedUses(
			[entry({ maxUses: 0, statModifierUsesId: 5 })],
			abilities({ wisdom: 14 }),
			6
		);
		expect(result.max).toBe(2);
	});

	it.each([
		[1, 2],
		[4, 2],
		[5, 3],
		[9, 4]
	])('adds the proficiency bonus at level %i (%i)', (level, expected) => {
		const [result] = computeLimitedUses(
			[entry({ maxUses: 0, useProficiencyBonus: true, proficiencyBonusOperator: 1 })],
			abilities(),
			level
		);
		expect(result.max).toBe(expected);
	});

	it('reports an unknown operator as an unknown maximum, naming the operator', () => {
		const [result] = computeLimitedUses(
			[entry({ maxUses: 1, useProficiencyBonus: true, proficiencyBonusOperator: 2 })],
			abilities(),
			6
		);
		expect(result.max).toBeNull();
		expect(result.maxReason).toContain('proficiencyBonusOperator');
	});

	it('reports a misshapen field as an unknown maximum, naming the field', () => {
		const [result] = computeLimitedUses([entry({ maxUses: 'three' })], abilities(), 6);
		expect(result.max).toBeNull();
		expect(result.maxReason).toContain('maxUses');
	});

	it('leaves out an entry whose computed maximum is 0 or less', () => {
		const results = computeLimitedUses([entry({ maxUses: 0 })], abilities(), 6);
		expect(results).toEqual([]);
	});
});

describe('computeLimitedUses — reset words', () => {
	it.each([
		[1, 'short rest'],
		[2, 'long rest'],
		[3, 'dawn'],
		[4, null],
		[null, null]
	])('reports resetType %s as %s', (resetType, expected) => {
		const [result] = computeLimitedUses([entry({ maxUses: 1, resetType })], abilities(), 6);
		expect(result.reset).toBe(expected);
	});
});
