import { describe, it, expect } from 'vitest';
import { computeDigest } from './digest';

/** A minimally valid D&D Beyond character-service response body. */
function character(overrides: Record<string, unknown> = {}): { data: Record<string, unknown> } {
	return {
		data: {
			name: 'Test Hero',
			classes: [{ level: 6, definition: { name: 'Monk' }, subclassDefinition: null }],
			stats: [
				{ id: 1, value: 10 },
				{ id: 2, value: 10 },
				{ id: 3, value: 10 },
				{ id: 4, value: 10 },
				{ id: 5, value: 10 },
				{ id: 6, value: 10 }
			],
			bonusStats: [
				{ id: 1, value: null },
				{ id: 2, value: null },
				{ id: 3, value: null },
				{ id: 4, value: null },
				{ id: 5, value: null },
				{ id: 6, value: null }
			],
			overrideStats: [
				{ id: 1, value: null },
				{ id: 2, value: null },
				{ id: 3, value: null },
				{ id: 4, value: null },
				{ id: 5, value: null },
				{ id: 6, value: null }
			],
			baseHitPoints: 10,
			bonusHitPoints: null,
			overrideHitPoints: null,
			modifiers: { race: [], class: [], background: [], item: [], feat: [], condition: [] },
			inventory: [],
			race: { weightSpeeds: { normal: { walk: 30 } } },
			characterValues: [],
			...overrides
		}
	};
}

function statList(values: [number, number, number, number, number, number]): unknown[] {
	return values.map((value, index) => ({ id: index + 1, value }));
}

function bonusModifier(subType: string, value: number, statId: number | null = null) {
	return { type: 'bonus', subType, statId, value };
}

function setModifier(subType: string, value: number, statId: number | null = null) {
	return { type: 'set', subType, statId, value };
}

describe('computeDigest — required and optional fields', () => {
	it('reports a missing name as unreadable, naming the field', () => {
		const { name, ...rest } = character().data;
		const result = computeDigest({ data: rest });
		expect(result.status).toBe('unreadable');
		if (result.status === 'unreadable') expect(result.message).toContain('name');
	});

	it('reports a wrong-typed name as unreadable', () => {
		const result = computeDigest(character({ name: 42 }));
		expect(result.status).toBe('unreadable');
	});

	it('reports missing classes as unreadable, naming the field', () => {
		const { classes, ...rest } = character().data;
		const result = computeDigest({ data: rest });
		expect(result.status).toBe('unreadable');
		if (result.status === 'unreadable') expect(result.message).toContain('classes');
	});

	it('reports an empty classes list as unreadable', () => {
		const result = computeDigest(character({ classes: [] }));
		expect(result.status).toBe('unreadable');
	});

	it('reports missing stats as unreadable, naming the field', () => {
		const { stats, ...rest } = character().data;
		const result = computeDigest({ data: rest });
		expect(result.status).toBe('unreadable');
		if (result.status === 'unreadable') expect(result.message).toContain('stats');
	});

	it('reports missing baseHitPoints as unreadable, naming the field', () => {
		const { baseHitPoints, ...rest } = character().data;
		const result = computeDigest({ data: rest });
		expect(result.status).toBe('unreadable');
		if (result.status === 'unreadable') expect(result.message).toContain('baseHitPoints');
	});

	it('reports a missing base walking speed as unreadable, naming the field', () => {
		const result = computeDigest(character({ race: { weightSpeeds: { normal: {} } } }));
		expect(result.status).toBe('unreadable');
		if (result.status === 'unreadable') expect(result.message).toContain('speed');
	});

	it('reports missing modifiers as unreadable, naming the field', () => {
		const { modifiers, ...rest } = character().data;
		const result = computeDigest({ data: rest });
		expect(result.status).toBe('unreadable');
		if (result.status === 'unreadable') expect(result.message).toContain('modifiers');
	});

	it('reports inventory as an object as unreadable, naming inventory', () => {
		const result = computeDigest(character({ inventory: {} }));
		expect(result.status).toBe('unreadable');
		if (result.status === 'unreadable') expect(result.message).toContain('inventory');
	});

	it('reads a null bonusHitPoints as no bonus', () => {
		const result = computeDigest(character({ bonusHitPoints: null }));
		expect(result.status).toBe('ok');
	});

	it('reads a missing bonusHitPoints as no bonus', () => {
		const { bonusHitPoints, ...rest } = character().data;
		const result = computeDigest({ data: rest });
		expect(result.status).toBe('ok');
	});

	it('reports a wrong-typed bonusHitPoints as unreadable', () => {
		const result = computeDigest(character({ bonusHitPoints: 'four' }));
		expect(result.status).toBe('unreadable');
		if (result.status === 'unreadable') expect(result.message).toContain('bonusHitPoints');
	});

	it('reads a missing characterValues as none', () => {
		const { characterValues, ...rest } = character().data;
		const result = computeDigest({ data: rest });
		expect(result.status).toBe('ok');
	});

	it('reports a wrong-typed modifier group as unreadable, naming the group', () => {
		const result = computeDigest(
			character({ modifiers: { race: [], class: [], background: [], item: {}, feat: [], condition: [] } })
		);
		expect(result.status).toBe('unreadable');
		if (result.status === 'unreadable') expect(result.message).toContain('modifiers.item');
	});
});

describe('computeDigest — limited-use source fields', () => {
	it('reports no limited uses when actions is missing', () => {
		const result = computeDigest(character());
		expect(result.status).toBe('ok');
		if (result.status === 'ok') expect(result.digest.limitedUses).toEqual([]);
	});

	it('reports actions.class as an object instead of a list as unreadable, naming it', () => {
		const result = computeDigest(character({ actions: { class: {} } }));
		expect(result.status).toBe('unreadable');
		if (result.status === 'unreadable') expect(result.message).toContain('actions.class');
	});

	it('reads a null action group as none', () => {
		const result = computeDigest(
			character({ actions: { class: null, race: [], background: [], feat: [] } })
		);
		expect(result.status).toBe('ok');
		if (result.status === 'ok') expect(result.digest.limitedUses).toEqual([]);
	});

	it('skips the item group of actions', () => {
		const result = computeDigest(
			character({
				actions: {
					class: [],
					race: [],
					background: [],
					feat: [],
					item: [{ name: 'Wand Charge', limitedUse: { maxUses: 3, resetType: 1 } }]
				}
			})
		);
		expect(result.status).toBe('ok');
		if (result.status === 'ok') expect(result.digest.limitedUses).toEqual([]);
	});

	it('skips the item group of spells', () => {
		const result = computeDigest(
			character({
				spells: {
					class: [],
					race: [],
					background: [],
					feat: [],
					item: [{ definition: { name: 'Grease' }, limitedUse: { maxUses: 1, resetType: null } }]
				}
			})
		);
		expect(result.status).toBe('ok');
		if (result.status === 'ok') expect(result.digest.limitedUses).toEqual([]);
	});

	it('reports the race group as source "species"', () => {
		const result = computeDigest(
			character({
				actions: {
					class: [],
					race: [{ name: 'Fury of the Small', limitedUse: { maxUses: 2, resetType: 2 } }],
					background: [],
					feat: []
				}
			})
		);
		expect(result.status).toBe('ok');
		if (result.status === 'ok') {
			expect(result.digest.limitedUses).toEqual([
				{ name: 'Fury of the Small', source: 'species', max: 2, maxReason: null, reset: 'long rest' }
			]);
		}
	});

	it('reads a spell entry name from its definition', () => {
		const result = computeDigest(
			character({
				spells: {
					class: [{ definition: { name: 'Find Familiar' }, limitedUse: { maxUses: 1, resetType: 2 } }],
					race: [],
					background: [],
					feat: []
				}
			})
		);
		expect(result.status).toBe('ok');
		if (result.status === 'ok') {
			expect(result.digest.limitedUses).toEqual([
				{ name: 'Find Familiar', source: 'class', max: 1, maxReason: null, reset: 'long rest' }
			]);
		}
	});
});

describe('computeDigest — identity facts', () => {
	it('returns the name verbatim, emoji included', () => {
		const result = computeDigest(character({ name: '🐻‍❄️ Urven, the Silent Maw' }));
		expect(result.status).toBe('ok');
		if (result.status === 'ok') expect(result.digest.name).toBe('🐻‍❄️ Urven, the Silent Maw');
	});

	it('lists each class with its subclass and level', () => {
		const result = computeDigest(
			character({
				classes: [
					{ level: 6, definition: { name: 'Monk' }, subclassDefinition: { name: 'Warrior of Shadow' } }
				]
			})
		);
		expect(result.status).toBe('ok');
		if (result.status === 'ok') {
			expect(result.digest.classes).toEqual([{ name: 'Monk', subclass: 'Warrior of Shadow', level: 6 }]);
		}
	});

	it('sums class levels for a multiclass character', () => {
		const result = computeDigest(
			character({
				classes: [
					{ level: 3, definition: { name: 'Monk' }, subclassDefinition: null },
					{ level: 2, definition: { name: 'Rogue' }, subclassDefinition: null }
				]
			})
		);
		expect(result.status).toBe('ok');
		if (result.status === 'ok') {
			expect(result.digest.classes).toEqual([
				{ name: 'Monk', level: 3 },
				{ name: 'Rogue', level: 2 }
			]);
			expect(result.digest.level).toBe(5);
		}
	});
});

describe('computeDigest — final ability scores', () => {
	it('adds the bonus score to the base score', () => {
		const result = computeDigest(
			character({
				stats: statList([10, 15, 10, 10, 10, 10]),
				bonusStats: [
					{ id: 1, value: null },
					{ id: 2, value: 2 },
					{ id: 3, value: null },
					{ id: 4, value: null },
					{ id: 5, value: null },
					{ id: 6, value: null }
				]
			})
		);
		expect(result.status).toBe('ok');
		if (result.status === 'ok') expect(result.digest.abilities.dexterity).toBe(17);
	});

	it('applies <ability>-score bonus modifiers matched by subType while statId is null', () => {
		const result = computeDigest(
			character({
				stats: statList([10, 17, 10, 10, 10, 10]),
				modifiers: {
					race: [],
					class: [],
					background: [],
					item: [],
					feat: [bonusModifier('dexterity-score', 1), bonusModifier('dexterity-score', 2)],
					condition: []
				}
			})
		);
		expect(result.status).toBe('ok');
		if (result.status === 'ok') expect(result.digest.abilities.dexterity).toBe(20);
	});

	it('lets an override replace the computed score', () => {
		const result = computeDigest(
			character({
				stats: statList([10, 10, 10, 10, 10, 10]),
				overrideStats: [
					{ id: 1, value: 19 },
					{ id: 2, value: null },
					{ id: 3, value: null },
					{ id: 4, value: null },
					{ id: 5, value: null },
					{ id: 6, value: null }
				]
			})
		);
		expect(result.status).toBe('ok');
		if (result.status === 'ok') expect(result.digest.abilities.strength).toBe(19);
	});

	it('applies a set effect only when it is higher than the computed score', () => {
		const higher = computeDigest(
			character({
				stats: statList([16, 10, 10, 10, 10, 10]),
				modifiers: {
					race: [],
					class: [],
					background: [],
					item: [setModifier('strength-score', 21)],
					feat: [],
					condition: []
				}
			})
		);
		expect(higher.status).toBe('ok');
		if (higher.status === 'ok') expect(higher.digest.abilities.strength).toBe(21);

		const lower = computeDigest(
			character({
				stats: statList([18, 10, 10, 10, 10, 10]),
				modifiers: {
					race: [],
					class: [],
					background: [],
					item: [setModifier('strength-score', 15)],
					feat: [],
					condition: []
				}
			})
		);
		expect(lower.status).toBe('ok');
		if (lower.status === 'ok') expect(lower.digest.abilities.strength).toBe(18);
	});
});

describe('computeDigest — derived combat facts', () => {
	it('computes hit points from base, bonus, Constitution modifier times level, and per-level bonuses', () => {
		const result = computeDigest(
			character({
				classes: [{ level: 6, definition: { name: 'Monk' }, subclassDefinition: null }],
				stats: statList([10, 10, 16, 10, 10, 10]),
				baseHitPoints: 10,
				bonusHitPoints: 4,
				modifiers: {
					race: [],
					class: [bonusModifier('hit-points-per-level', 1)],
					background: [],
					item: [],
					feat: [],
					condition: []
				}
			})
		);
		expect(result.status).toBe('ok');
		// 10 base + 4 bonus + (Con mod +3 * 6) + (1 per-level * 6) = 10 + 4 + 18 + 6 = 38
		if (result.status === 'ok') expect(result.digest.hitPointsMax).toBe(38);
	});

	it('uses the override for hit points when D&D Beyond has one', () => {
		const result = computeDigest(character({ overrideHitPoints: 99 }));
		expect(result.status).toBe('ok');
		if (result.status === 'ok') expect(result.digest.hitPointsMax).toBe(99);
	});

	it('adds Unarmored Movement to speed only when no armor or shield is worn', () => {
		const noArmor = computeDigest(
			character({
				race: { weightSpeeds: { normal: { walk: 30 } } },
				modifiers: {
					race: [],
					class: [bonusModifier('unarmored-movement', 10), bonusModifier('unarmored-movement', 5)],
					background: [],
					item: [],
					feat: [],
					condition: []
				},
				inventory: []
			})
		);
		expect(noArmor.status).toBe('ok');
		if (noArmor.status === 'ok') expect(noArmor.digest.speed).toBe(45);

		const withArmor = computeDigest(
			character({
				race: { weightSpeeds: { normal: { walk: 30 } } },
				modifiers: {
					race: [],
					class: [bonusModifier('unarmored-movement', 10), bonusModifier('unarmored-movement', 5)],
					background: [],
					item: [],
					feat: [],
					condition: []
				},
				inventory: [{ equipped: true, definition: { filterType: 'Armor' } }]
			})
		);
		expect(withArmor.status).toBe('ok');
		if (withArmor.status === 'ok') expect(withArmor.digest.speed).toBe(30);
	});

	it('computes initiative from the Dexterity modifier plus flat bonuses', () => {
		const result = computeDigest(
			character({
				stats: statList([10, 14, 10, 10, 10, 10]),
				modifiers: {
					race: [],
					class: [],
					background: [],
					item: [bonusModifier('initiative', 3)],
					feat: [],
					condition: []
				}
			})
		);
		expect(result.status).toBe('ok');
		// Dex 14 -> mod +2, plus flat bonus 3 = 5
		if (result.status === 'ok') expect(result.digest.initiative).toBe(5);
	});
});
