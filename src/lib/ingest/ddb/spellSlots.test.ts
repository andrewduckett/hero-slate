import { describe, it, expect } from 'vitest';
import { computeSpellSlots, computePactMagic, type SpellcastingClassInput } from './spellSlots';

const ONE_THIRD_TABLE = [
	[0, 0, 0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0, 0, 0],
	[2, 0, 0, 0, 0, 0, 0, 0, 0],
	[3, 0, 0, 0, 0, 0, 0, 0, 0],
	[3, 0, 0, 0, 0, 0, 0, 0, 0],
	[3, 0, 0, 0, 0, 0, 0, 0, 0]
];

const WIZARD_TABLE = [
	[0, 0, 0, 0, 0, 0, 0, 0, 0],
	[2, 0, 0, 0, 0, 0, 0, 0, 0],
	[3, 0, 0, 0, 0, 0, 0, 0, 0]
];

const WARLOCK_TABLE_LEVEL_5 = [
	[0, 0, 0, 0, 0, 0, 0, 0, 0],
	[1, 0, 0, 0, 0, 0, 0, 0, 0],
	[2, 0, 0, 0, 0, 0, 0, 0, 0],
	[0, 2, 0, 0, 0, 0, 0, 0, 0],
	[0, 2, 0, 0, 0, 0, 0, 0, 0],
	[0, 0, 2, 0, 0, 0, 0, 0, 0]
];

function classInput(overrides: Partial<SpellcastingClassInput> = {}): SpellcastingClassInput {
	return {
		name: 'Monk',
		level: 6,
		canCastSpells: false,
		slotTable: ONE_THIRD_TABLE,
		subclassCanCastSpells: false,
		subclassSlotTable: undefined,
		...overrides
	};
}

describe('computeSpellSlots', () => {
	it('reports an empty list when no class can cast spells', () => {
		const result = computeSpellSlots([classInput()]);
		expect(result).toEqual({ spellSlots: [], spellSlotsReason: null });
	});

	it('reports an empty list for a Monk whose class data carries a slot table', () => {
		const result = computeSpellSlots([classInput({ name: 'Monk', level: 6, canCastSpells: false })]);
		expect(result.spellSlots).toEqual([]);
	});

	it('reads the slot table for one spellcasting class, at its level', () => {
		const result = computeSpellSlots([
			classInput({ name: 'Wizard', level: 2, canCastSpells: true, slotTable: WIZARD_TABLE })
		]);
		expect(result).toEqual({ spellSlots: [{ level: 1, slots: 3 }], spellSlotsReason: null });
	});

	it('uses the subclass slot table when only the subclass can cast', () => {
		const result = computeSpellSlots([
			classInput({
				name: 'Fighter',
				level: 2,
				canCastSpells: false,
				subclassCanCastSpells: true,
				subclassSlotTable: WIZARD_TABLE
			})
		]);
		expect(result).toEqual({ spellSlots: [{ level: 1, slots: 3 }], spellSlotsReason: null });
	});

	it('reports null with a reason for two spellcasting classes', () => {
		const result = computeSpellSlots([
			classInput({ name: 'Wizard', level: 3, canCastSpells: true, slotTable: WIZARD_TABLE }),
			classInput({ name: 'Cleric', level: 2, canCastSpells: true, slotTable: WIZARD_TABLE })
		]);
		expect(result.spellSlots).toBeNull();
		expect(result.spellSlotsReason).toMatch(/multiclass/i);
	});

	it('uses the one spellcaster’s own table beside a class that cannot cast', () => {
		const result = computeSpellSlots([
			classInput({ name: 'Wizard', level: 2, canCastSpells: true, slotTable: WIZARD_TABLE }),
			classInput({ name: 'Fighter', level: 2, canCastSpells: false, subclassCanCastSpells: false })
		]);
		expect(result.spellSlots).toEqual([{ level: 1, slots: 3 }]);
	});

	it('reports null with a reason when the caster has no readable slot row', () => {
		const result = computeSpellSlots([
			classInput({ name: 'Wizard', level: 20, canCastSpells: true, slotTable: WIZARD_TABLE })
		]);
		expect(result.spellSlots).toBeNull();
		expect(result.spellSlotsReason).toBeTruthy();
	});
});

describe('computePactMagic', () => {
	it('reads the Warlock’s pact slots when exactly one level has slots', () => {
		const result = computePactMagic([
			classInput({ name: 'Warlock', level: 5, canCastSpells: true, slotTable: WARLOCK_TABLE_LEVEL_5 })
		]);
		expect(result).toEqual({ pactMagic: { level: 3, slots: 2 }, pactMagicReason: null });
	});

	it('reports null with a reason when the row has slots at more than one level', () => {
		const badTable = [
			[0, 0, 0, 0, 0, 0, 0, 0, 0],
			[1, 1, 0, 0, 0, 0, 0, 0, 0]
		];
		const result = computePactMagic([
			classInput({ name: 'Warlock', level: 1, canCastSpells: true, slotTable: badTable })
		]);
		expect(result.pactMagic).toBeNull();
		expect(result.pactMagicReason).toBeTruthy();
	});

	it('reports both as null when there is no Warlock', () => {
		const result = computePactMagic([classInput({ name: 'Wizard', level: 2, canCastSpells: true, slotTable: WIZARD_TABLE })]);
		expect(result).toEqual({ pactMagic: null, pactMagicReason: null });
	});

	it('reads the Warlock’s own row beside a Wizard', () => {
		const result = computePactMagic([
			classInput({ name: 'Warlock', level: 5, canCastSpells: true, slotTable: WARLOCK_TABLE_LEVEL_5 }),
			classInput({ name: 'Wizard', level: 2, canCastSpells: true, slotTable: WIZARD_TABLE })
		]);
		expect(result).toEqual({ pactMagic: { level: 3, slots: 2 }, pactMagicReason: null });
	});

	it('does not count the Warlock toward multiclass spellSlots', () => {
		const result = computeSpellSlots([
			classInput({ name: 'Warlock', level: 5, canCastSpells: true, slotTable: WARLOCK_TABLE_LEVEL_5 }),
			classInput({ name: 'Wizard', level: 2, canCastSpells: true, slotTable: WIZARD_TABLE })
		]);
		expect(result.spellSlots).toEqual([{ level: 1, slots: 3 }]);
	});
});
