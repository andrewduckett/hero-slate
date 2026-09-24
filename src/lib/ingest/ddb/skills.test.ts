import { describe, it, expect } from 'vitest';
import { computeSkills } from './skills';
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

function proficiency(subType: string): Modifier {
	return { type: 'proficiency', subType };
}

function expertise(subType: string): Modifier {
	return { type: 'expertise', subType };
}

function halfProficiency(subType: string): Modifier {
	return { type: 'half-proficiency', subType };
}

function bonus(subType: string, value: number): Modifier {
	return { type: 'bonus', subType, value };
}

const STANDARD_ABILITY: Record<string, string> = {
	Athletics: 'Strength',
	Acrobatics: 'Dexterity',
	'Sleight of Hand': 'Dexterity',
	Stealth: 'Dexterity',
	Arcana: 'Intelligence',
	History: 'Intelligence',
	Investigation: 'Intelligence',
	Nature: 'Intelligence',
	Religion: 'Intelligence',
	'Animal Handling': 'Wisdom',
	Insight: 'Wisdom',
	Medicine: 'Wisdom',
	Perception: 'Wisdom',
	Survival: 'Wisdom',
	Deception: 'Charisma',
	Intimidation: 'Charisma',
	Performance: 'Charisma',
	Persuasion: 'Charisma'
};

describe('computeSkills — the 18 standard skills', () => {
	it('reports all 18 skills with their standard ability', () => {
		const skills = computeSkills([], abilities(), 6, []);
		expect(skills).toHaveLength(18);
		for (const [name, ability] of Object.entries(STANDARD_ABILITY)) {
			const skill = skills.find((s) => s.name === name);
			expect(skill, `expected a skill named "${name}"`).toBeDefined();
			expect(skill?.ability).toBe(ability);
		}
	});

	it('reports no proficiency as "none" with the ability modifier alone', () => {
		const skills = computeSkills([], abilities({ charisma: 11 }), 6, []);
		const persuasion = skills.find((s) => s.name === 'Persuasion');
		expect(persuasion?.proficiency).toBe('none');
		expect(persuasion?.bonus).toBe(0);
		expect(persuasion?.bonusReason).toBeNull();
	});

	it('adds the full proficiency bonus when proficient', () => {
		const skills = computeSkills([proficiency('stealth')], abilities({ dexterity: 20 }), 6, []);
		const stealth = skills.find((s) => s.name === 'Stealth');
		expect(stealth?.proficiency).toBe('proficient');
		// Dex 20 -> mod +5, plus proficiency bonus at level 6 (+3) = 8
		expect(stealth?.bonus).toBe(8);
	});

	it('doubles the proficiency bonus when expertise', () => {
		const skills = computeSkills(
			[proficiency('investigation'), expertise('investigation')],
			abilities({ intelligence: 17 }),
			2,
			[]
		);
		const investigation = skills.find((s) => s.name === 'Investigation');
		expect(investigation?.proficiency).toBe('expertise');
		// Int 17 -> mod +3, plus twice the level-2 proficiency bonus (+2*2) = 7
		expect(investigation?.bonus).toBe(7);
	});

	it('gives half proficiency, rounded down, from an ability-checks modifier at level 1', () => {
		const skills = computeSkills([halfProficiency('ability-checks')], abilities({ dexterity: 10 }), 1, []);
		const stealth = skills.find((s) => s.name === 'Stealth');
		expect(stealth?.proficiency).toBe('half');
		// Dex mod 0, plus half the level-1 proficiency bonus (2), rounded down = 1
		expect(stealth?.bonus).toBe(1);
	});

	it('does not raise a skill above half when the character is already proficient elsewhere', () => {
		const skills = computeSkills(
			[proficiency('stealth'), halfProficiency('ability-checks')],
			abilities({ dexterity: 10 }),
			1,
			[]
		);
		const stealth = skills.find((s) => s.name === 'Stealth');
		expect(stealth?.proficiency).toBe('proficient');
	});

	it('lets expertise beat proficiency when both modifiers are present', () => {
		const skills = computeSkills([proficiency('nature'), expertise('nature')], abilities(), 6, []);
		expect(skills.find((s) => s.name === 'Nature')?.proficiency).toBe('expertise');
	});

	it('adds a flat bonus modifier on the skill itself', () => {
		const skills = computeSkills([bonus('perception', 1)], abilities({ wisdom: 10 }), 6, []);
		const perception = skills.find((s) => s.name === 'Perception');
		expect(perception?.bonus).toBe(1);
	});

	it('adds a flat bonus modifier on all ability checks to every skill', () => {
		const skills = computeSkills([bonus('ability-checks', 1)], abilities(), 6, []);
		expect(skills.every((s) => s.bonus === 1)).toBe(true);
	});
});

describe('computeSkills — manual values', () => {
	const STEALTH_ID = 5;

	it('gives only the named skill an unknown bonus, with a reason', () => {
		const skills = computeSkills(
			[proficiency('stealth'), proficiency('acrobatics')],
			abilities({ dexterity: 20 }),
			6,
			[{ typeId: 34, valueTypeId: 1958004211, valueId: STEALTH_ID }]
		);
		const stealth = skills.find((s) => s.name === 'Stealth');
		const acrobatics = skills.find((s) => s.name === 'Acrobatics');
		expect(stealth?.bonus).toBeNull();
		expect(stealth?.bonusReason).toEqual(expect.any(String));
		expect(acrobatics?.bonus).toBe(8);
		expect(acrobatics?.bonusReason).toBeNull();
	});

	it('makes every skill unknown when the entry names an id the digest does not know', () => {
		const skills = computeSkills([], abilities(), 6, [{ typeId: 34, valueTypeId: 1958004211, valueId: 99999 }]);
		expect(skills.every((s) => s.bonus === null)).toBe(true);
		expect(skills.every((s) => typeof s.bonusReason === 'string')).toBe(true);
	});

	it('ignores a characterValues entry of another type', () => {
		const skills = computeSkills([proficiency('stealth')], abilities({ dexterity: 20 }), 6, [
			{ typeId: 8, value: 'Jerky', notes: null, valueId: '944553718', valueTypeId: '1439493548' }
		]);
		expect(skills.every((s) => s.bonusReason === null)).toBe(true);
		expect(skills.find((s) => s.name === 'Stealth')?.bonus).toBe(8);
	});
});
