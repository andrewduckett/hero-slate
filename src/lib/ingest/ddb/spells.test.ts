import { describe, it, expect } from 'vitest';
import { computeSpells, type Spell, type SpellClassInfo, type SpellRecordEntry, type SpellSource } from './spells';
import type { AbilityKey, AbilityScores, Modifier } from './digest';

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

function definition(name: string, overrides: Record<string, unknown> = {}): Record<string, unknown> {
	return {
		name,
		level: 1,
		concentration: false,
		ritual: false,
		requiresAttackRoll: false,
		requiresSavingThrow: false,
		saveDcAbilityId: null,
		modifiers: [],
		...overrides
	};
}

function spellRecord(
	name: string,
	recordOverrides: Record<string, unknown> = {},
	definitionOverrides: Record<string, unknown> = {}
): Record<string, unknown> {
	return {
		prepared: false,
		alwaysPrepared: false,
		usesSpellSlot: false,
		spellCastingAbilityId: null,
		limitedUse: null,
		overrideSaveDc: null,
		...recordOverrides,
		definition: definition(name, definitionOverrides)
	};
}

function entry(
	name: string,
	source: SpellSource,
	opts: { classId?: number; record?: Record<string, unknown>; definition?: Record<string, unknown> } = {}
): SpellRecordEntry {
	return {
		source,
		classId: opts.classId,
		record: spellRecord(name, opts.record ?? {}, opts.definition ?? {})
	};
}

function classInfo(overrides: Partial<SpellClassInfo> = {}): SpellClassInfo {
	return { id: 1, name: 'Wizard', level: 6, ability: 'intelligence' as AbilityKey, ...overrides };
}

function damageModifier(diceString: string, overrides: Record<string, unknown> = {}): Record<string, unknown> {
	return {
		type: 'damage',
		subType: 'fire',
		die: { diceString },
		usePrimaryStat: false,
		atHigherLevels: { higherLevelDefinitions: [] },
		...overrides
	};
}

function healingModifier(diceString: string, overrides: Record<string, unknown> = {}): Record<string, unknown> {
	return {
		type: 'bonus',
		subType: 'hit-points',
		die: { diceString },
		usePrimaryStat: false,
		atHigherLevels: { higherLevelDefinitions: [] },
		...overrides
	};
}

function higherLevelStep(level: number, diceString: string): Record<string, unknown> {
	return { level, dice: { diceString } };
}

function findSpell(spells: Spell[], name: string): Spell {
	const found = spells.find((s) => s.name === name);
	if (!found) throw new Error(`expected a spell named "${name}"`);
	return found;
}

function compute(
	entries: SpellRecordEntry[],
	classes: SpellClassInfo[] = [],
	abilityScores: AbilityScores = abilities(),
	level = 6,
	modifiers: Modifier[] = []
) {
	return computeSpells(entries, classes, abilityScores, level, modifiers);
}

describe('computeSpells — grouping and ordering', () => {
	it('groups records of the same name into one entry, and orders by level then name', () => {
		const { spells } = compute([
			entry('Beta', 'class', { definition: { level: 1 } }),
			entry('Zap', 'class', { definition: { level: 0 } }),
			entry('Alpha', 'class', { definition: { level: 1 } })
		]);
		expect(spells.map((s) => s.name)).toEqual(['Zap', 'Alpha', 'Beta']);
	});

	it('groups two records of the same name into one entry with two ways', () => {
		const { spells } = compute([
			entry('Pass without Trace', 'class', { record: { prepared: true, usesSpellSlot: true } }),
			entry('Pass without Trace', 'species', { record: { usesSpellSlot: true } })
		]);
		expect(spells).toHaveLength(1);
		expect(spells[0].ways).toHaveLength(2);
	});
});

describe('computeSpells — source', () => {
	it.each<SpellSource>(['class', 'class feature', 'species', 'background', 'feat'])(
		'passes the "%s" source through to the way',
		(source) => {
			const { spells } = compute([entry('Test Spell', source)]);
			expect(findSpell(spells, 'Test Spell').ways[0].source).toBe(source);
		}
	);
});

describe('computeSpells — status', () => {
	it('gives a level-0 spell "cantrip" even when marked always prepared', () => {
		const { spells } = compute([
			entry('Cantrip', 'class', { record: { alwaysPrepared: true }, definition: { level: 0 } })
		]);
		expect(findSpell(spells, 'Cantrip').ways[0].status).toBe('cantrip');
	});

	it('gives "always" to a non-class spell D&D Beyond marks always prepared', () => {
		const { spells } = compute([
			entry('Speak with Animals', 'species', { record: { alwaysPrepared: true }, definition: { level: 1 } })
		]);
		expect(findSpell(spells, 'Speak with Animals').ways[0].status).toBe('always');
	});

	it('gives "granted" to a non-class spell not marked always prepared', () => {
		const { spells } = compute([entry('Misty Step', 'class feature', { definition: { level: 2 } })]);
		expect(findSpell(spells, 'Misty Step').ways[0].status).toBe('granted');
	});

	it('gives "prepared" to a class-list spell D&D Beyond marks prepared', () => {
		const { spells } = compute([
			entry('Fireball', 'class', { record: { prepared: true }, definition: { level: 3 } })
		]);
		expect(findSpell(spells, 'Fireball').ways[0].status).toBe('prepared');
	});

	it('gives "not-prepared" to a class-list spell D&D Beyond does not mark prepared', () => {
		const { spells } = compute([
			entry('Identify', 'class', { record: { prepared: false }, definition: { level: 1, ritual: true } })
		]);
		expect(findSpell(spells, 'Identify').ways[0].status).toBe('not-prepared');
	});
});

describe('computeSpells — className', () => {
	it('sets className from the matching class id', () => {
		const { spells } = compute(
			[entry('Fireball', 'class', { classId: 1, definition: { level: 3 } })],
			[classInfo({ id: 1, name: 'Wizard' })]
		);
		expect(findSpell(spells, 'Fireball').ways[0].className).toBe('Wizard');
	});

	it('sets className to null when no class matches the id', () => {
		const { spells } = compute(
			[entry('Fireball', 'class', { classId: 99, definition: { level: 3 } })],
			[classInfo({ id: 1, name: 'Wizard' })]
		);
		expect(findSpell(spells, 'Fireball').ways[0].className).toBeNull();
	});

	it('sets className to null for any source other than a class list', () => {
		const { spells } = compute(
			[entry('Darkness', 'class feature', { classId: 1, definition: { level: 2 } })],
			[classInfo({ id: 1, name: 'Wizard' })]
		);
		expect(findSpell(spells, 'Darkness').ways[0].className).toBeNull();
	});
});

describe('computeSpells — usesSlot and limitedUse', () => {
	it('reports usesSlot true or false as D&D Beyond marks it', () => {
		const { spells: withSlot } = compute([entry('Shield', 'class', { record: { usesSpellSlot: true } })]);
		expect(findSpell(withSlot, 'Shield').ways[0].usesSlot).toBe(true);

		const { spells: withoutSlot } = compute([entry('Mage Hand', 'class', { record: { usesSpellSlot: false } })]);
		expect(findSpell(withoutSlot, 'Mage Hand').ways[0].usesSlot).toBe(false);
	});

	it('computes a limited use with its reset', () => {
		const { spells } = compute([
			entry('Find Familiar', 'feat', {
				record: { limitedUse: { maxUses: 1, resetType: 2, statModifierUsesId: null, useProficiencyBonus: false } }
			})
		]);
		expect(findSpell(spells, 'Find Familiar').ways[0].limitedUse).toEqual({
			max: 1,
			maxReason: null,
			reset: 'long rest'
		});
	});

	it('reports null when the computed maximum is 0 or less', () => {
		const { spells } = compute([
			entry('Longstrider', 'species', {
				record: { limitedUse: { maxUses: 0, resetType: 2, statModifierUsesId: null, useProficiencyBonus: false } }
			})
		]);
		expect(findSpell(spells, 'Longstrider').ways[0].limitedUse).toBeNull();
	});
});

describe('computeSpells — entry-level facts', () => {
	it('reports concentration true and ritual true', () => {
		const { spells } = compute([entry('Bane', 'class', { definition: { concentration: true, ritual: true } })]);
		const spell = findSpell(spells, 'Bane');
		expect(spell.concentration).toBe(true);
		expect(spell.ritual).toBe(true);
	});

	it('reports concentration false and ritual false', () => {
		const { spells } = compute([entry('Magic Missile', 'class', { definition: { concentration: false, ritual: false } })]);
		const spell = findSpell(spells, 'Magic Missile');
		expect(spell.concentration).toBe(false);
		expect(spell.ritual).toBe(false);
	});

	it('names the target save ability when the spell has a save', () => {
		const { spells } = compute([
			entry('Frostbite', 'class', { definition: { requiresSavingThrow: true, saveDcAbilityId: 3 } })
		]);
		expect(findSpell(spells, 'Frostbite').saveAbility).toBe('Constitution');
	});

	it('leaves saveAbility null for a spell with no save', () => {
		const { spells } = compute([entry('Thorn Whip', 'class', { definition: { requiresSavingThrow: false } })]);
		expect(findSpell(spells, 'Thorn Whip').saveAbility).toBeNull();
	});
});

describe('computeSpells — casting ability', () => {
	it("uses the record's own casting ability first", () => {
		const { spells } = compute(
			[entry('Find Familiar', 'feat', { record: { spellCastingAbilityId: 5 } })],
			[classInfo({ ability: 'intelligence' as AbilityKey })]
		);
		expect(findSpell(spells, 'Find Familiar').ways[0].castingAbility).toBe('Wisdom');
	});

	it("uses the class list's class ability, matched by id, when the record names none", () => {
		const { spells } = compute(
			[entry('Fireball', 'class', { classId: 1 })],
			[classInfo({ id: 1, name: 'Wizard', ability: 'intelligence' as AbilityKey })]
		);
		expect(findSpell(spells, 'Fireball').ways[0].castingAbility).toBe('Intelligence');
		expect(findSpell(spells, 'Fireball').ways[0].castingAbilityReason).toBeNull();
	});

	it('uses the only spellcasting class for a class-feature spell', () => {
		const { spells } = compute(
			[entry('Lightning Bolt', 'class feature')],
			[classInfo({ id: 1, name: 'Druid', ability: 'wisdom' as AbilityKey })]
		);
		expect(findSpell(spells, 'Lightning Bolt').ways[0].castingAbility).toBe('Wisdom');
	});

	it('leaves a class-feature spell unknown with two spellcasting classes', () => {
		const { spells } = compute(
			[entry('Mystery', 'class feature')],
			[
				classInfo({ id: 1, name: 'Druid', ability: 'wisdom' as AbilityKey }),
				classInfo({ id: 2, name: 'Wizard', ability: 'intelligence' as AbilityKey })
			]
		);
		const way = findSpell(spells, 'Mystery').ways[0];
		expect(way.castingAbility).toBeNull();
		expect(way.castingAbilityReason).toEqual(expect.any(String));
	});

	it('leaves a class-feature spell unknown with no spellcasting class', () => {
		const { spells } = compute(
			[entry('Darkness', 'class feature')],
			[classInfo({ id: 1, name: 'Monk', ability: undefined })]
		);
		const way = findSpell(spells, 'Darkness').ways[0];
		expect(way.castingAbility).toBeNull();
		expect(way.castingAbilityReason).toEqual(expect.any(String));
	});

	it("uses a class's subclass-derived ability the same way as its own", () => {
		const { spells } = compute(
			[entry('Shield', 'class', { classId: 1 })],
			[classInfo({ id: 1, name: 'Fighter', ability: 'intelligence' as AbilityKey })]
		);
		expect(findSpell(spells, 'Shield').ways[0].castingAbility).toBe('Intelligence');
	});
});

describe('computeSpells — to-hit', () => {
	it('computes to-hit from the casting ability and proficiency bonus', () => {
		const { spells } = compute(
			[entry('Thorn Whip', 'class', { classId: 1, definition: { level: 0, requiresAttackRoll: true } })],
			[classInfo({ id: 1, name: 'Druid', ability: 'wisdom' as AbilityKey })],
			abilities({ wisdom: 18 }),
			6
		);
		// Wis 18 -> mod +4, proficiency bonus at level 6 (+3) = 7
		expect(findSpell(spells, 'Thorn Whip').ways[0].toHit).toBe(7);
		expect(findSpell(spells, 'Thorn Whip').ways[0].toHitReason).toBeNull();
	});

	it('leaves to-hit not applicable for a spell with no attack roll', () => {
		const { spells } = compute([entry('Cure Wounds', 'class', { definition: { requiresAttackRoll: false } })]);
		const way = findSpell(spells, 'Cure Wounds').ways[0];
		expect(way.toHit).toBeNull();
		expect(way.toHitReason).toBeNull();
	});

	it('reports to-hit unknown when the casting ability is unknown', () => {
		const { spells } = compute(
			[entry('Mystery', 'class feature', { definition: { requiresAttackRoll: true } })],
			[]
		);
		const way = findSpell(spells, 'Mystery').ways[0];
		expect(way.toHit).toBeNull();
		expect(way.toHitReason).toEqual(expect.any(String));
	});

	it('reports to-hit unknown with a spell-attacks bonus modifier', () => {
		const { spells } = compute(
			[entry('Thorn Whip', 'class', { classId: 1, definition: { requiresAttackRoll: true } })],
			[classInfo({ id: 1, ability: 'wisdom' as AbilityKey })],
			abilities(),
			6,
			[{ type: 'bonus', subType: 'spell-attacks' }]
		);
		const way = findSpell(spells, 'Thorn Whip').ways[0];
		expect(way.toHit).toBeNull();
		expect(way.toHitReason).toEqual(expect.any(String));
	});
});

describe('computeSpells — save DC', () => {
	it('computes save DC as 8 plus proficiency plus the casting modifier', () => {
		const { spells } = compute(
			[entry('Frostbite', 'class', { classId: 1, definition: { requiresSavingThrow: true, saveDcAbilityId: 3 } })],
			[classInfo({ id: 1, ability: 'wisdom' as AbilityKey })],
			abilities({ wisdom: 18 }),
			6
		);
		// 8 + proficiency (+3) + Wis mod (+4) = 15
		expect(findSpell(spells, 'Frostbite').ways[0].saveDc).toBe(15);
	});

	it('prefers a fixed DC on the record over the computed one', () => {
		const { spells } = compute([
			entry('Frostbite', 'class', {
				classId: 1,
				record: { overrideSaveDc: 14 },
				definition: { requiresSavingThrow: true, saveDcAbilityId: 3 }
			})
		], [classInfo({ id: 1, ability: 'wisdom' as AbilityKey })], abilities({ wisdom: 18 }), 6);
		expect(findSpell(spells, 'Frostbite').ways[0].saveDc).toBe(14);
	});

	it('leaves save DC not applicable for a spell with no save', () => {
		const { spells } = compute([entry('Thorn Whip', 'class', { definition: { requiresSavingThrow: false } })]);
		const way = findSpell(spells, 'Thorn Whip').ways[0];
		expect(way.saveDc).toBeNull();
		expect(way.saveDcReason).toBeNull();
	});

	it('reports save DC unknown with a spell-save-dc bonus modifier', () => {
		const { spells } = compute(
			[entry('Frostbite', 'class', { classId: 1, definition: { requiresSavingThrow: true, saveDcAbilityId: 3 } })],
			[classInfo({ id: 1, ability: 'wisdom' as AbilityKey })],
			abilities(),
			6,
			[{ type: 'bonus', subType: 'spell-save-dc' }]
		);
		const way = findSpell(spells, 'Frostbite').ways[0];
		expect(way.saveDc).toBeNull();
		expect(way.saveDcReason).toEqual(expect.any(String));
	});

	it('keeps a fixed DC even with a spell-save-dc bonus modifier', () => {
		const { spells } = compute(
			[
				entry('Frostbite', 'class', {
					classId: 1,
					record: { overrideSaveDc: 14 },
					definition: { requiresSavingThrow: true, saveDcAbilityId: 3 }
				})
			],
			[classInfo({ id: 1, ability: 'wisdom' as AbilityKey })],
			abilities(),
			6,
			[{ type: 'bonus', subType: 'spell-save-dc' }]
		);
		expect(findSpell(spells, 'Frostbite').ways[0].saveDc).toBe(14);
	});
});

describe('computeSpells — damage and healing', () => {
	it('leaves damage not applicable when the spell has no damage modifier', () => {
		const { spells } = compute([entry('Speak with Animals', 'class', { definition: { modifiers: [] } })]);
		const way = findSpell(spells, 'Speak with Animals').ways[0];
		expect(way.damage).toBeNull();
		expect(way.damageReason).toBeNull();
	});

	it('reads damage from a single damage modifier', () => {
		const { spells } = compute([
			entry('Fire Bolt', 'class', { definition: { level: 0, modifiers: [damageModifier('1d10')] } })
		]);
		expect(findSpell(spells, 'Fire Bolt').ways[0].damage).toBe('1d10');
	});

	it('reports damage unknown with two damage modifiers', () => {
		const { spells } = compute([
			entry('Call Lightning', 'class', {
				definition: { level: 3, modifiers: [damageModifier('3d10'), damageModifier('1d10')] }
			})
		]);
		const way = findSpell(spells, 'Call Lightning').ways[0];
		expect(way.damage).toBeNull();
		expect(way.damageReason).toEqual(expect.any(String));
	});

	it.each([
		[4, '1d6'],
		[5, '2d6'],
		[17, '4d6']
	])('picks the cantrip scaling step for character level %i', (level, expected) => {
		const { spells } = compute(
			[
				entry('Thorn Whip', 'class', {
					definition: {
						level: 0,
						modifiers: [
							damageModifier('1d6', {
								atHigherLevels: {
									higherLevelDefinitions: [higherLevelStep(5, '2d6'), higherLevelStep(11, '3d6'), higherLevelStep(17, '4d6')]
								}
							})
						]
					}
				})
			],
			[],
			abilities(),
			level
		);
		expect(findSpell(spells, 'Thorn Whip').ways[0].damage).toBe(expected);
	});

	it('ignores scaling steps for a leveled spell', () => {
		const { spells } = compute(
			[
				entry('Lightning Bolt', 'class', {
					definition: {
						level: 3,
						modifiers: [
							damageModifier('8d6', {
								atHigherLevels: { higherLevelDefinitions: [higherLevelStep(5, '9d6')] }
							})
						]
					}
				})
			],
			[],
			abilities(),
			20
		);
		expect(findSpell(spells, 'Lightning Bolt').ways[0].damage).toBe('8d6');
	});

	it('appends the casting modifier when usePrimaryStat is true', () => {
		const { spells } = compute(
			[
				entry('Cure Wounds', 'class', {
					classId: 1,
					definition: { level: 1, modifiers: [healingModifier('2d8', { usePrimaryStat: true })] }
				})
			],
			[classInfo({ id: 1, ability: 'wisdom' as AbilityKey })],
			abilities({ wisdom: 18 }),
			6
		);
		expect(findSpell(spells, 'Cure Wounds').ways[0].healing).toBe('2d8+4');
	});

	it('reports healing without the casting modifier plainly', () => {
		const { spells } = compute([
			entry('Healing Spirit', 'class', {
				definition: { level: 2, modifiers: [healingModifier('1d6', { usePrimaryStat: false })] }
			})
		]);
		expect(findSpell(spells, 'Healing Spirit').ways[0].healing).toBe('1d6');
	});

	it('reports a modifier with no dice string as unknown', () => {
		const { spells } = compute([
			entry('Vague', 'class', { definition: { level: 1, modifiers: [damageModifier('', { die: null })] } })
		]);
		const way = findSpell(spells, 'Vague').ways[0];
		expect(way.damage).toBeNull();
		expect(way.damageReason).toEqual(expect.any(String));
	});

	it('reports healing unknown when it needs a casting ability the digest cannot resolve', () => {
		const { spells } = compute([
			entry('Cure Wounds', 'class feature', {
				definition: { level: 1, modifiers: [healingModifier('2d8', { usePrimaryStat: true })] }
			})
		]);
		const way = findSpell(spells, 'Cure Wounds').ways[0];
		expect(way.healing).toBeNull();
		expect(way.healingReason).toEqual(expect.any(String));
	});
});

describe('computeSpells — spellcasting summary', () => {
	it('lists one entry per spellcasting class, in class order', () => {
		const { spellcasting } = compute(
			[],
			[
				classInfo({ id: 1, name: 'Druid', ability: 'wisdom' as AbilityKey }),
				classInfo({ id: 2, name: 'Wizard', ability: 'intelligence' as AbilityKey })
			],
			abilities({ wisdom: 18, intelligence: 16 }),
			6
		);
		expect(spellcasting.map((s) => s.className)).toEqual(['Druid', 'Wizard']);
	});

	it("computes a class's spell attack and save DC from its ability", () => {
		const { spellcasting } = compute(
			[],
			[classInfo({ id: 1, name: 'Druid', ability: 'wisdom' as AbilityKey })],
			abilities({ wisdom: 18 }),
			6
		);
		expect(spellcasting[0]).toMatchObject({ className: 'Druid', ability: 'Wisdom', spellAttack: 7, saveDc: 15 });
	});

	it('reports a subclass-derived ability the same as a class-named one', () => {
		const { spellcasting } = compute(
			[],
			[classInfo({ id: 1, name: 'Fighter', ability: 'intelligence' as AbilityKey })],
			abilities({ intelligence: 16 }),
			6
		);
		expect(spellcasting[0].ability).toBe('Intelligence');
	});

	it('is empty when no class has a spellcasting ability', () => {
		const { spellcasting } = compute([], [classInfo({ ability: undefined })], abilities(), 6);
		expect(spellcasting).toEqual([]);
	});

	it('reports spellAttack unknown with a spell-attacks bonus modifier', () => {
		const { spellcasting } = compute(
			[],
			[classInfo({ ability: 'wisdom' as AbilityKey })],
			abilities(),
			6,
			[{ type: 'bonus', subType: 'spell-attacks' }]
		);
		expect(spellcasting[0].spellAttack).toBeNull();
		expect(spellcasting[0].spellAttackReason).toEqual(expect.any(String));
		expect(spellcasting[0].saveDc).not.toBeNull();
	});

	it('reports saveDc unknown with a spell-save-dc bonus modifier', () => {
		const { spellcasting } = compute(
			[],
			[classInfo({ ability: 'wisdom' as AbilityKey })],
			abilities(),
			6,
			[{ type: 'bonus', subType: 'spell-save-dc' }]
		);
		expect(spellcasting[0].saveDc).toBeNull();
		expect(spellcasting[0].saveDcReason).toEqual(expect.any(String));
		expect(spellcasting[0].spellAttack).not.toBeNull();
	});
});
