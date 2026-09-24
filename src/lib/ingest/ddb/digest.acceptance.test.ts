import { describe, it, expect } from 'vitest';
import { computeDigest } from './digest';
import urven from './fixtures/urven.json';
import zip from './fixtures/zip.json';

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
	});
});
