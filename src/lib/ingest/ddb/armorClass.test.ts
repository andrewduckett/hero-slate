import { describe, it, expect } from 'vitest';
import { computeArmorClass } from './armorClass';
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

function armorItem(armorTypeId: number, armorClass: number, name = 'Test Armor') {
	return { equipped: true, definition: { filterType: 'Armor', armorTypeId, armorClass, name } };
}

describe('computeArmorClass', () => {
	it('is 10 plus the Dexterity modifier when no armor is worn', () => {
		const result = computeArmorClass([], [], [], abilities({ dexterity: 14 }));
		expect(result).toEqual({ value: 12, reason: null });
	});

	it('uses worn armor with its Dexterity cap', () => {
		// Medium armor: base AC 14, Dexterity cap 2. Dexterity 18 -> mod +4, capped to +2.
		const result = computeArmorClass([armorItem(2, 14)], [], [], abilities({ dexterity: 18 }));
		expect(result).toEqual({ value: 16, reason: null });
	});

	it('adds an equipped shield', () => {
		const shield = { equipped: true, definition: { filterType: 'Armor', armorTypeId: 4, armorClass: 2, name: 'Shield' } };
		const result = computeArmorClass([shield], [], [], abilities({ dexterity: 14 }));
		expect(result).toEqual({ value: 14, reason: null });
	});

	it('combines armor with a Dexterity cap and a shield', () => {
		const shield = { equipped: true, definition: { filterType: 'Armor', armorTypeId: 4, armorClass: 2, name: 'Shield' } };
		const result = computeArmorClass([armorItem(2, 14), shield], [], [], abilities({ dexterity: 18 }));
		expect(result).toEqual({ value: 18, reason: null });
	});

	it('computes monk Unarmored Defense with no armor and no shield', () => {
		const modifiers = [{ type: 'set', subType: 'unarmored-armor-class', statId: 5, value: null }];
		const result = computeArmorClass([], modifiers, [], abilities({ dexterity: 20, wisdom: 14 }));
		expect(result).toEqual({ value: 17, reason: null });
	});

	it('does not apply monk Unarmored Defense when a shield is held', () => {
		const shield = { equipped: true, definition: { filterType: 'Armor', armorTypeId: 4, armorClass: 2, name: 'Shield' } };
		const modifiers = [{ type: 'set', subType: 'unarmored-armor-class', statId: 5, value: null }];
		const result = computeArmorClass([shield], modifiers, [], abilities({ dexterity: 20, wisdom: 14 }));
		// Monk UD (10+5+2=17) is disqualified by the shield, so this falls back to
		// 10 + Dex mod (+5) + shield (+2) = 17 — the same total, but for a different reason.
		// If Unarmored Defense were wrongly applied on top of the shield, the result would be 19.
		expect(result).toEqual({ value: 17, reason: null });
	});

	it('computes barbarian Unarmored Defense with no armor, shield allowed', () => {
		const shield = { equipped: true, definition: { filterType: 'Armor', armorTypeId: 4, armorClass: 2, name: 'Shield' } };
		const modifiers = [{ type: 'set', subType: 'unarmored-armor-class', statId: 3, value: null }];
		const result = computeArmorClass([shield], modifiers, [], abilities({ dexterity: 16, constitution: 18 }));
		// 10 + Dex mod (+3) + Con mod (+4) = 17, plus the shield (+2) = 19.
		expect(result).toEqual({ value: 19, reason: null });
	});

	it('uses the higher Unarmored Defense result for a monk/barbarian multiclass', () => {
		const modifiers = [
			{ type: 'set', subType: 'unarmored-armor-class', statId: 5, value: null },
			{ type: 'set', subType: 'unarmored-armor-class', statId: 3, value: null }
		];
		// Monk: 10 + Dex(+2) + Wis(0) = 12. Barbarian: 10 + Dex(+2) + Con(+3) = 15. Higher wins: 15.
		const result = computeArmorClass([], modifiers, [], abilities({ dexterity: 14, wisdom: 10, constitution: 16 }));
		expect(result).toEqual({ value: 15, reason: null });
	});

	it('adds a flat item Armor Class bonus', () => {
		const modifiers = [{ type: 'bonus', subType: 'armor-class', statId: null, value: 1 }];
		const result = computeArmorClass([], modifiers, [], abilities({ dexterity: 14 }));
		expect(result).toEqual({ value: 13, reason: null });
	});

	it('lets a D&D Beyond Armor Class override replace the computed value', () => {
		const characterValues = [{ typeId: 34, value: 20 }];
		const result = computeArmorClass([armorItem(2, 14)], [], characterValues, abilities({ dexterity: 18 }));
		expect(result).toEqual({ value: 20, reason: null });
	});

	it('reports an unrecognized source as unknown, with a reason naming it', () => {
		const modifiers = [{ type: 'set', subType: 'armor-class', statId: null, value: 15 }];
		const result = computeArmorClass([], modifiers, [], abilities());
		expect(result.value).toBeNull();
		expect(result.reason).toBeTruthy();
	});
});
