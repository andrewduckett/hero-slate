/**
 * Compute the 18 standard skills: each one's ability, proficiency level, and
 * final bonus. The digest is the supply, not the sheet — it reports every
 * skill, proficient or not, so the agent can look up any skill by name.
 *
 * The table of skill slugs, abilities, and D&D Beyond ids follows the
 * character response's own `modifiers` entries. 8 of the 18 ids are
 * confirmed against the recorded fixtures (see design.md D4); the rest
 * follow D&D Beyond's published skill order.
 */
import type { AbilityKey, AbilityScores, Modifier } from './digest';
import { abilityModifier, abilityLabel, proficiencyBonus } from './rules';

export type SkillProficiency = 'none' | 'half' | 'proficient' | 'expertise';

export interface Skill {
	name: string;
	ability: string;
	proficiency: SkillProficiency;
	bonus: number | null;
	bonusReason: string | null;
}

interface SkillDefinition {
	name: string;
	slug: string;
	ability: AbilityKey;
	id: number;
}

const SKILL_ENTITY_TYPE_ID = 1958004211;

const PROFICIENCY_RANK: Record<SkillProficiency, number> = { none: 0, half: 1, proficient: 2, expertise: 3 };

const SKILLS: SkillDefinition[] = [
	{ name: 'Athletics', slug: 'athletics', ability: 'strength', id: 2 },
	{ name: 'Acrobatics', slug: 'acrobatics', ability: 'dexterity', id: 3 },
	{ name: 'Sleight of Hand', slug: 'sleight-of-hand', ability: 'dexterity', id: 4 },
	{ name: 'Stealth', slug: 'stealth', ability: 'dexterity', id: 5 },
	{ name: 'Arcana', slug: 'arcana', ability: 'intelligence', id: 6 },
	{ name: 'History', slug: 'history', ability: 'intelligence', id: 7 },
	{ name: 'Investigation', slug: 'investigation', ability: 'intelligence', id: 8 },
	{ name: 'Nature', slug: 'nature', ability: 'intelligence', id: 9 },
	{ name: 'Religion', slug: 'religion', ability: 'intelligence', id: 10 },
	{ name: 'Animal Handling', slug: 'animal-handling', ability: 'wisdom', id: 11 },
	{ name: 'Insight', slug: 'insight', ability: 'wisdom', id: 12 },
	{ name: 'Medicine', slug: 'medicine', ability: 'wisdom', id: 13 },
	{ name: 'Perception', slug: 'perception', ability: 'wisdom', id: 14 },
	{ name: 'Survival', slug: 'survival', ability: 'wisdom', id: 15 },
	{ name: 'Deception', slug: 'deception', ability: 'charisma', id: 16 },
	{ name: 'Intimidation', slug: 'intimidation', ability: 'charisma', id: 17 },
	{ name: 'Performance', slug: 'performance', ability: 'charisma', id: 18 },
	{ name: 'Persuasion', slug: 'persuasion', ability: 'charisma', id: 19 }
];

function toNumber(value: unknown): number | undefined {
	if (typeof value === 'number' && Number.isFinite(value)) return value;
	if (typeof value === 'string' && /^-?\d+$/.test(value)) return Number(value);
	return undefined;
}

/** The proficiency level the character's modifiers grant a skill slug, from its own proficiency-type modifiers alone. */
function ownProficiencyLevel(modifiers: Modifier[], slug: string): SkillProficiency {
	let level: SkillProficiency = 'none';
	for (const modifier of modifiers) {
		if (modifier.subType !== slug) continue;
		let candidate: SkillProficiency | undefined;
		if (modifier.type === 'expertise') candidate = 'expertise';
		else if (modifier.type === 'proficiency') candidate = 'proficient';
		else if (modifier.type === 'half-proficiency') candidate = 'half';
		if (candidate && PROFICIENCY_RANK[candidate] > PROFICIENCY_RANK[level]) level = candidate;
	}
	return level;
}

/** Whether a half-proficiency modifier applies to every ability check (Jack of All Trades). */
function halfProficiencyOnAllChecks(modifiers: Modifier[]): boolean {
	return modifiers.some((m) => m.type === 'half-proficiency' && m.subType === 'ability-checks');
}

function proficiencyLevel(modifiers: Modifier[], slug: string, halfOnAllChecks: boolean): SkillProficiency {
	const own = ownProficiencyLevel(modifiers, slug);
	if (own !== 'none') return own;
	return halfOnAllChecks ? 'half' : 'none';
}

/** Sum the `value` of every `bonus` modifier whose sub-type is the skill's slug or `ability-checks`. */
function flatBonus(modifiers: Modifier[], slug: string): number {
	return modifiers
		.filter((m) => m.type === 'bonus' && (m.subType === slug || m.subType === 'ability-checks'))
		.reduce((sum, m) => sum + (typeof m.value === 'number' ? m.value : 0), 0);
}

function proficiencyShare(level: SkillProficiency, proficiencyBonusValue: number): number {
	switch (level) {
		case 'none':
			return 0;
		case 'half':
			return Math.floor(proficiencyBonusValue / 2);
		case 'proficient':
			return proficiencyBonusValue;
		case 'expertise':
			return proficiencyBonusValue * 2;
	}
}

type ManualValue = { kind: 'skill'; skillId: number } | { kind: 'unknown' };

/** The first `characterValues` entry that names a skill, if any. */
function readManualValue(characterValues: unknown[]): ManualValue | undefined {
	for (const raw of characterValues) {
		if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) continue;
		const entry = raw as Record<string, unknown>;
		if (toNumber(entry.valueTypeId) !== SKILL_ENTITY_TYPE_ID) continue;
		const skillId = toNumber(entry.valueId);
		const known = skillId !== undefined && SKILLS.some((s) => s.id === skillId);
		return known ? { kind: 'skill', skillId: skillId as number } : { kind: 'unknown' };
	}
	return undefined;
}

export function computeSkills(
	modifiers: Modifier[],
	abilities: AbilityScores,
	level: number,
	characterValues: unknown[]
): Skill[] {
	const proficiencyBonusValue = proficiencyBonus(level);
	const halfOnAllChecks = halfProficiencyOnAllChecks(modifiers);
	const manualValue = readManualValue(characterValues);

	return SKILLS.map((def) => {
		const proficiency = proficiencyLevel(modifiers, def.slug, halfOnAllChecks);
		const bonus =
			abilityModifier(abilities[def.ability]) + proficiencyShare(proficiency, proficiencyBonusValue) + flatBonus(modifiers, def.slug);

		if (manualValue?.kind === 'unknown') {
			return {
				name: def.name,
				ability: abilityLabel(def.ability),
				proficiency,
				bonus: null,
				bonusReason: 'a characterValues entry names a skill id the digest does not know, so it cannot tell which skill the value changes'
			};
		}

		if (manualValue?.kind === 'skill' && manualValue.skillId === def.id) {
			return {
				name: def.name,
				ability: abilityLabel(def.ability),
				proficiency,
				bonus: null,
				bonusReason: `D&D Beyond holds a manual value for ${def.name} that the digest does not read`
			};
		}

		return { name: def.name, ability: abilityLabel(def.ability), proficiency, bonus, bonusReason: null };
	});
}
