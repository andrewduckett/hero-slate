import { describe, it, expect } from 'vitest';
import { computeActions, type FeatureActionEntry } from './actions';
import type { AbilityScores, Modifier } from './digest';

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

function feature(
	name: string,
	record: Record<string, unknown> = {},
	source: FeatureActionEntry['source'] = 'class'
): FeatureActionEntry {
	return {
		name,
		source,
		record: {
			activation: null,
			abilityModifierStatId: null,
			isMartialArts: false,
			isProficient: false,
			attackTypeRange: null,
			dice: null,
			saveStatId: null,
			fixedSaveDc: null,
			...record
		}
	};
}

function activation(activationType: number) {
	return { activationTime: null, activationType };
}

function dice(diceString: string) {
	return { diceCount: 1, diceValue: 4, diceMultiplier: null, fixedValue: null, diceString };
}

function findAction(name: string, entries: FeatureActionEntry[], modifiers: Modifier[] = [], abilityScores = abilities(), level = 6) {
	const actions = computeActions(entries, [], modifiers, abilityScores, level);
	const action = actions.find((a) => a.name === name);
	if (!action) throw new Error(`expected an action named "${name}"`);
	return action;
}

describe('computeActions — activation', () => {
	it.each([
		[1, 'action'],
		[3, 'bonus action'],
		[4, 'reaction']
	])('maps activationType %i to "%s"', (code, expected) => {
		const action = findAction('Test', [feature('Test', { activation: activation(code) })]);
		expect(action.activation).toBe(expected);
	});

	it('maps an unrecognized activation code to null', () => {
		const action = findAction('Test', [feature('Test', { activation: activation(8) })]);
		expect(action.activation).toBeNull();
	});
});

describe('computeActions — feature to-hit', () => {
	it('uses the named ability plus the proficiency bonus when proficient', () => {
		const action = findAction(
			'Strike',
			[feature('Strike', { attackTypeRange: 1, abilityModifierStatId: 5, isProficient: true })],
			[],
			abilities({ wisdom: 16 }),
			6
		);
		// Wis 16 -> mod +3, plus proficiency bonus at level 6 (+3) = 6
		expect(action.toHit).toBe(6);
		expect(action.toHitReason).toBeNull();
	});

	it('uses the higher of Strength and Dexterity for a martial-arts attack with no named ability', () => {
		const action = findAction(
			'Unarmed Strike',
			[feature('Unarmed Strike', { attackTypeRange: 1, isMartialArts: true, isProficient: true })],
			[],
			abilities({ strength: 14, dexterity: 20 }),
			6
		);
		// Dex 20 -> mod +5, plus proficiency bonus at level 6 (+3) = 8
		expect(action.toHit).toBe(8);
	});

	it('reports an unknown to-hit when an attack names no ability and is not martial arts', () => {
		const action = findAction('Mystery Attack', [feature('Mystery Attack', { attackTypeRange: 1 })]);
		expect(action.toHit).toBeNull();
		expect(action.toHitReason).toEqual(expect.any(String));
	});

	it('leaves to-hit not applicable for a non-attack action', () => {
		const action = findAction('Shadow Step', [feature('Shadow Step', {})]);
		expect(action.toHit).toBeNull();
		expect(action.toHitReason).toBeNull();
	});
});

describe('computeActions — feature damage', () => {
	it('copies dice with spaces removed', () => {
		const action = findAction('Uncanny Metabolism', [
			feature('Uncanny Metabolism', { dice: { diceCount: 1, diceValue: 8, diceMultiplier: null, fixedValue: 6, diceString: '1d8 + 6' } })
		]);
		expect(action.damage).toBe('1d8+6');
		expect(action.damageReason).toBeNull();
	});

	it('reports an unknown damage when an attack has no dice', () => {
		const action = findAction('Unarmed Strike', [feature('Unarmed Strike', { attackTypeRange: 1, isMartialArts: true })]);
		expect(action.damage).toBeNull();
		expect(action.damageReason).toEqual(expect.any(String));
	});

	it('leaves damage not applicable for a non-attack action with no dice', () => {
		const action = findAction('Focus Points', [feature('Focus Points', {})]);
		expect(action.damage).toBeNull();
		expect(action.damageReason).toBeNull();
	});
});

describe('computeActions — save DC', () => {
	it('computes a save DC from a named ability', () => {
		const action = findAction(
			'Stunning Strike',
			[feature('Stunning Strike', { saveStatId: 3, abilityModifierStatId: 5 })],
			[],
			abilities({ wisdom: 14 }),
			6
		);
		// 8 + proficiency bonus (+3) + Wisdom modifier (+2) = 13
		expect(action.saveDc).toBe(13);
		expect(action.saveDcReason).toBeNull();
		expect(action.saveAbility).toBe('Constitution');
	});

	it('prefers a fixed DC over the computed one', () => {
		const action = findAction('Fixed Save', [feature('Fixed Save', { saveStatId: 3, abilityModifierStatId: 5, fixedSaveDc: 15 })]);
		expect(action.saveDc).toBe(15);
	});

	it('reports an unknown DC when there is neither a fixed DC nor a named ability, but keeps the save ability', () => {
		const action = findAction('Vague Save', [feature('Vague Save', { saveStatId: 3 })]);
		expect(action.saveDc).toBeNull();
		expect(action.saveDcReason).toEqual(expect.any(String));
		expect(action.saveAbility).toBe('Constitution');
	});
});

describe('computeActions — an action with no numbers', () => {
	it('still appears, with every number not applicable', () => {
		const action = findAction('Shadow Step', [feature('Shadow Step', { activation: activation(3) })]);
		expect(action.activation).toBe('bonus action');
		expect(action.toHit).toBeNull();
		expect(action.toHitReason).toBeNull();
		expect(action.damage).toBeNull();
		expect(action.damageReason).toBeNull();
		expect(action.saveDc).toBeNull();
		expect(action.saveDcReason).toBeNull();
		expect(action.saveAbility).toBeNull();
	});
});

function weaponItem(
	name: string,
	definition: Record<string, unknown> = {},
	overrides: Record<string, unknown> = {}
): Record<string, unknown> {
	return {
		equipped: true,
		definition: {
			name,
			filterType: 'Weapon',
			categoryId: 1,
			attackType: 1,
			properties: [],
			damage: dice('1d4'),
			grantedModifiers: [],
			magic: false,
			...definition
		},
		...overrides
	};
}

function findWeapon(name: string, inventory: unknown[], modifiers: Modifier[] = [], abilityScores = abilities(), level = 6) {
	const actions = computeActions([], inventory, modifiers, abilityScores, level);
	const action = actions.find((a) => a.name === name);
	if (!action) throw new Error(`expected a weapon action named "${name}"`);
	return action;
}

describe('computeActions — weapon ability selection', () => {
	it('picks the higher of Strength and Dexterity for a Finesse weapon', () => {
		const action = findWeapon(
			'Rapier',
			[weaponItem('Rapier', { properties: [{ name: 'Finesse' }] })],
			[],
			abilities({ strength: 10, dexterity: 16 }),
			1
		);
		// Dex mod +3, no proficiency at level 1 -> toHit 3
		expect(action.toHit).toBe(3);
	});

	it('uses Dexterity for a ranged weapon', () => {
		const action = findWeapon('Sling', [weaponItem('Sling', { attackType: 2 })], [], abilities({ dexterity: 16 }), 1);
		expect(action.toHit).toBe(3);
	});

	it('uses Strength for a melee weapon with no Finesse', () => {
		const action = findWeapon('Longsword', [weaponItem('Longsword', { attackType: 1 })], [], abilities({ strength: 16 }), 1);
		expect(action.toHit).toBe(3);
	});
});

describe('computeActions — weapon proficiency', () => {
	it('is proficient from a simple-weapons modifier', () => {
		const action = findWeapon(
			'Dagger',
			[weaponItem('Dagger', { categoryId: 1 })],
			[{ type: 'proficiency', subType: 'simple-weapons' }],
			abilities({ strength: 16 }),
			1
		);
		expect(action.toHit).toBe(5);
	});

	it('is proficient from a martial-weapons modifier', () => {
		const action = findWeapon(
			'Longsword',
			[weaponItem('Longsword', { categoryId: 2 })],
			[{ type: 'proficiency', subType: 'martial-weapons' }],
			abilities({ strength: 16 }),
			1
		);
		expect(action.toHit).toBe(5);
	});

	it('is proficient from the weapon\'s own hyphenated name', () => {
		const action = findWeapon(
			'Hand Crossbow',
			[weaponItem('Hand Crossbow', { categoryId: 2, attackType: 2 })],
			[{ type: 'proficiency', subType: 'hand-crossbow' }],
			abilities({ dexterity: 16 }),
			1
		);
		expect(action.toHit).toBe(5);
	});

	it('adds no proficiency bonus with no matching modifier', () => {
		const action = findWeapon('Longsword', [weaponItem('Longsword', { categoryId: 2 })], [], abilities({ strength: 16 }), 1);
		expect(action.toHit).toBe(3);
	});
});

describe('computeActions — weapon magic bonus and damage', () => {
	it('adds a readable magic bonus from grantedModifiers', () => {
		const action = findWeapon(
			'Mace',
			[
				weaponItem('Mace', {
					magic: true,
					grantedModifiers: [{ type: 'bonus', subType: 'magic', value: 1 }]
				})
			],
			[{ type: 'proficiency', subType: 'simple-weapons' }],
			abilities({ strength: 16 }),
			1
		);
		expect(action.toHit).toBe(6);
	});

	it('gives the dice alone when the ability modifier is 0', () => {
		const action = findWeapon('Dagger', [weaponItem('Dagger', { damage: dice('1d4') })], [], abilities({ strength: 10 }), 1);
		expect(action.damage).toBe('1d4');
	});

	it('adds the signed ability modifier to the dice otherwise', () => {
		const action = findWeapon('Dagger', [weaponItem('Dagger', { damage: dice('1d4') })], [], abilities({ strength: 16 }), 1);
		expect(action.damage).toBe('1d4+3');
	});
});

describe('computeActions — weapons the digest cannot model', () => {
	it('is unknown with any monk-weapon modifier', () => {
		const action = findWeapon(
			'Handaxe',
			[weaponItem('Handaxe')],
			[{ type: 'monk-weapon', subType: 'scimitar' }],
			abilities({ strength: 16 }),
			6
		);
		expect(action.toHit).toBeNull();
		expect(action.toHitReason).toEqual(expect.any(String));
		expect(action.damage).toBeNull();
		expect(action.damageReason).toEqual(expect.any(String));
	});

	it('is unknown for a magic weapon with a bonus of 0', () => {
		const action = findWeapon('Ice Pick', [weaponItem('Ice Pick', { magic: true, grantedModifiers: [] })], [], abilities(), 6);
		expect(action.toHit).toBeNull();
		expect(action.damage).toBeNull();
	});

	it.each([
		'weapon-attacks',
		'melee-weapon-attacks',
		'ranged-weapon-attacks',
		'weapon-damage',
		'melee-weapon-damage',
		'ranged-weapon-damage'
	])('is unknown with a flat bonus modifier of sub-type %s', (subType) => {
		const action = findWeapon('Longsword', [weaponItem('Longsword')], [{ type: 'bonus', subType }], abilities(), 6);
		expect(action.toHit).toBeNull();
		expect(action.damage).toBeNull();
	});
});

describe('computeActions — weapon listing', () => {
	it('lists a duplicate equipped weapon once', () => {
		const actions = computeActions([], [weaponItem('Handaxe'), weaponItem('Handaxe')], [], abilities(), 6);
		expect(actions.filter((a) => a.name === 'Handaxe')).toHaveLength(1);
	});

	it('leaves out an unequipped weapon', () => {
		const actions = computeActions([], [weaponItem('Longbow', {}, { equipped: false })], [], abilities(), 6);
		expect(actions.find((a) => a.name === 'Longbow')).toBeUndefined();
	});

	it('gives every weapon action source "weapon" and activation "action"', () => {
		const action = findWeapon('Dagger', [weaponItem('Dagger')], [], abilities(), 6);
		expect(action.source).toBe('weapon');
		expect(action.activation).toBe('action');
		expect(action.saveDc).toBeNull();
		expect(action.saveDcReason).toBeNull();
		expect(action.saveAbility).toBeNull();
	});
});
