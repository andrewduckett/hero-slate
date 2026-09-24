import { describe, it, expect } from 'vitest';
import { computeDigest } from './digest';
import urven from './fixtures/urven.json';
import zip from './fixtures/zip.json';
import sunny from './fixtures/sunny.json';

describe('computeDigest — Urven acceptance', () => {
	it('digests Urven\'s recorded D&D Beyond response', () => {
		const result = computeDigest(urven);

		expect(result.status).toBe('ok');
		if (result.status !== 'ok') return;

		expect(result.digest.level).toBe(6);
		expect(result.digest.abilities).toEqual({
			strength: 14,
			dexterity: 20,
			constitution: 16,
			intelligence: 10,
			wisdom: 14,
			charisma: 11
		});
		expect(result.digest.armorClass).toBe(17);
		expect(result.digest.speed).toBe(45);
		expect(result.digest.initiative).toBe(5);
		expect(result.digest.hitPointsMax).toBe(54);

		expect(result.digest.limitedUses).toEqual([
			{ name: 'Focus Points', source: 'class', max: 6, maxReason: null, reset: 'short rest' },
			{ name: 'Uncanny Metabolism', source: 'class', max: 1, maxReason: null, reset: 'long rest' },
			{ name: 'Stillness of Kaurth', source: 'feat', max: 2, maxReason: null, reset: 'long rest' },
			{ name: 'Jump', source: 'feat', max: 1, maxReason: null, reset: 'long rest' }
		]);
		expect(result.digest.spellSlots).toEqual([]);
		expect(result.digest.pactMagic).toBeNull();

		const proficientSkills = result.digest.skills.filter((s) => s.proficiency === 'proficient');
		expect(proficientSkills.map((s) => [s.name, s.ability, s.bonus]).sort()).toEqual(
			[
				['Acrobatics', 'Dexterity', 8],
				['Athletics', 'Strength', 5],
				['Insight', 'Wisdom', 5],
				['Stealth', 'Dexterity', 8],
				['Survival', 'Wisdom', 5]
			].sort()
		);

		const byName = (name: string) => result.digest.actions.find((a) => a.name === name);

		const unarmedStrike = byName('Unarmed Strike');
		expect(unarmedStrike?.activation).toBe('bonus action');
		expect(unarmedStrike?.toHit).toBe(8);
		expect(unarmedStrike?.damage).toBeNull();
		expect(unarmedStrike?.damageReason).toEqual(expect.any(String));

		const stunningStrike = byName('Stunning Strike');
		expect(stunningStrike?.saveDc).toBe(13);
		expect(stunningStrike?.saveAbility).toBe('Constitution');

		const shadowStep = byName('Shadow Step');
		expect(shadowStep?.toHit).toBeNull();
		expect(shadowStep?.toHitReason).toBeNull();
		expect(shadowStep?.damage).toBeNull();
		expect(shadowStep?.damageReason).toBeNull();
		expect(shadowStep?.saveDc).toBeNull();
		expect(shadowStep?.saveDcReason).toBeNull();

		expect(result.digest.actions.filter((a) => a.name === 'Handaxe')).toHaveLength(1);
		expect(byName('Handaxe')?.toHit).toBeNull();
		expect(byName('Handaxe')?.toHitReason).toEqual(expect.any(String));
		expect(byName('Handaxe')?.damage).toBeNull();
		expect(byName('Handaxe')?.damageReason).toEqual(expect.any(String));

		expect(result.digest.actions.filter((a) => a.name === 'Ice Pick')).toHaveLength(1);
		expect(byName('Ice Pick')?.toHit).toBeNull();
		expect(byName('Ice Pick')?.toHitReason).toEqual(expect.any(String));
		expect(byName('Ice Pick')?.damage).toBeNull();
		expect(byName('Ice Pick')?.damageReason).toEqual(expect.any(String));

		const darkness = result.digest.spells.find((s) => s.name === 'Darkness');
		expect(darkness?.ways[0]).toMatchObject({ source: 'class feature', castingAbility: null });
		expect(darkness?.ways[0].castingAbilityReason).toEqual(expect.any(String));

		expect(result.digest.spellcasting).toEqual([]);
	});
});

describe('computeDigest — Zip acceptance', () => {
	it("digests Zip's recorded D&D Beyond response", () => {
		const result = computeDigest(zip);

		expect(result.status).toBe('ok');
		if (result.status !== 'ok') return;

		expect(result.digest.spellSlots).toEqual([{ level: 1, slots: 3 }]);
		expect(result.digest.pactMagic).toBeNull();

		expect(result.digest.limitedUses).toContainEqual({
			name: 'Fury of the Small',
			source: 'species',
			max: 2,
			maxReason: null,
			reset: 'long rest'
		});
		expect(result.digest.limitedUses).toContainEqual({
			name: 'Arcane Recovery',
			source: 'class',
			max: 1,
			maxReason: null,
			reset: 'long rest'
		});
		expect(result.digest.limitedUses).toContainEqual({
			name: 'Find Familiar',
			source: 'feat',
			max: 1,
			maxReason: null,
			reset: 'long rest'
		});
		const names = result.digest.limitedUses.map((u) => u.name);
		expect(names).not.toContain('Freedom of Movement');
		expect(names).not.toContain('Grease');

		const investigation = result.digest.skills.find((s) => s.name === 'Investigation');
		expect(investigation?.proficiency).toBe('expertise');
		expect(investigation?.bonus).toBe(7);

		for (const name of ['Nature', 'Stealth', 'Sleight of Hand']) {
			const skill = result.digest.skills.find((s) => s.name === name);
			expect(skill?.proficiency).toBe('proficient');
			expect(skill?.bonus).toBe(5);
		}

		for (const name of ['Dagger', 'Sling']) {
			const weapon = result.digest.actions.find((a) => a.name === name);
			expect(weapon?.toHit).toBe(5);
			expect(weapon?.damage).toBe('1d4+3');
		}

		const bySpell = (name: string) => {
			const spell = result.digest.spells.find((s) => s.name === name);
			if (!spell) throw new Error(`expected a spell named "${name}"`);
			return spell;
		};

		const classWays = result.digest.spells.flatMap((s) => s.ways.filter((w) => w.source === 'class'));
		expect(classWays.length).toBeGreaterThan(0);
		for (const way of classWays) expect(way.className).toBe('Wizard');
		const nonClassWays = result.digest.spells.flatMap((s) => s.ways.filter((w) => w.source !== 'class'));
		for (const way of nonClassWays) expect(way.className).toBeNull();

		const mindSliver = bySpell('Mind Sliver');
		expect(mindSliver.saveAbility).toBe('Intelligence');
		expect(mindSliver.ways[0]).toMatchObject({ saveDc: 13, damage: '1d6' });

		const identify = bySpell('Identify');
		expect(identify.ritual).toBe(true);
		expect(identify.ways).toHaveLength(1);
		expect(identify.ways[0]).toMatchObject({ source: 'class', status: 'not-prepared' });

		const findFamiliar = bySpell('Find Familiar');
		expect(findFamiliar.ways[0]).toMatchObject({
			source: 'feat',
			status: 'granted',
			castingAbility: 'Wisdom',
			usesSlot: false,
			limitedUse: { max: 1, maxReason: null, reset: 'long rest' }
		});

		expect(result.digest.spells.find((s) => s.name === 'Freedom of Movement')).toBeUndefined();
		expect(result.digest.spells.find((s) => s.name === 'Grease')).toBeUndefined();
	});
});

describe('computeDigest — Sunny acceptance', () => {
	it("digests Sunny's recorded D&D Beyond response", () => {
		const result = computeDigest(sunny);

		expect(result.status).toBe('ok');
		if (result.status !== 'ok') return;

		const bySpell = (name: string) => {
			const spell = result.digest.spells.find((s) => s.name === name);
			if (!spell) throw new Error(`expected a spell named "${name}"`);
			return spell;
		};

		const thornWhip = bySpell('Thorn Whip');
		expect(thornWhip.level).toBe(0);
		expect(thornWhip.ways).toHaveLength(1);
		expect(thornWhip.ways[0]).toMatchObject({ source: 'class', status: 'cantrip', toHit: 7, damage: '2d6' });

		const mistyStep = bySpell('Misty Step');
		expect(mistyStep.ways).toHaveLength(1);
		expect(mistyStep.ways[0]).toMatchObject({ source: 'class feature', status: 'granted' });

		const passWithoutTrace = bySpell('Pass without Trace');
		expect(passWithoutTrace.ways).toHaveLength(3);
		expect(passWithoutTrace.ways[0]).toMatchObject({ source: 'class', status: 'prepared', usesSlot: true });
		expect(passWithoutTrace.ways[1]).toMatchObject({
			source: 'species',
			status: 'granted',
			usesSlot: false,
			limitedUse: { max: 1, maxReason: null, reset: 'long rest' }
		});
		expect(passWithoutTrace.ways[2]).toMatchObject({ source: 'species', status: 'granted', usesSlot: true });

		const speakWithAnimals = bySpell('Speak with Animals');
		expect(speakWithAnimals.ways.some((w) => w.source === 'class feature' && w.status === 'always')).toBe(true);
		for (const way of speakWithAnimals.ways) {
			expect(way.toHit).toBeNull();
			expect(way.damage).toBeNull();
			expect(way.healing).toBeNull();
			expect(way.saveDc).toBeNull();
		}

		const lightningBolt = bySpell('Lightning Bolt');
		expect(lightningBolt.ways[0]).toMatchObject({ source: 'class feature', castingAbility: 'Wisdom', damage: '8d6' });

		const frostbite = bySpell('Frostbite');
		expect(frostbite.saveAbility).toBe('Constitution');
		expect(frostbite.ways[0]).toMatchObject({ saveDc: 15, damage: '2d6' });

		const cureWounds = bySpell('Cure Wounds');
		expect(cureWounds.ways[0].healing).toBe('2d8+4');
		expect(cureWounds.ways[0].damage).toBeNull();
		expect(cureWounds.ways[0].toHit).toBeNull();
		expect(cureWounds.ways[0].saveDc).toBeNull();

		const healingSpirit = bySpell('Healing Spirit');
		expect(healingSpirit.ways[0].healing).toBe('1d6');

		const callLightning = bySpell('Call Lightning');
		expect(callLightning.ways[0].damage).toBeNull();
		expect(callLightning.ways[0].damageReason).toEqual(expect.any(String));
		expect(callLightning.ways[0].saveDc).toBe(15);
		expect(callLightning.saveAbility).toBe('Dexterity');

		expect(result.digest.spellcasting).toEqual([
			{ className: 'Druid', ability: 'Wisdom', spellAttack: 7, spellAttackReason: null, saveDc: 15, saveDcReason: null }
		]);
	});
});
