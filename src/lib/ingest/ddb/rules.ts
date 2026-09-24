/**
 * Shared D&D Beyond formulas: the ability modifier and the proficiency
 * bonus. Every module that derives a number from an ability score or the
 * character's level uses these two, so the rule lives in one place.
 */
import type { AbilityKey } from './digest';

export function abilityModifier(score: number): number {
	return Math.floor((score - 10) / 2);
}

export function proficiencyBonus(level: number): number {
	return 2 + Math.floor((level - 1) / 4);
}

const ABILITY_LABELS: Record<AbilityKey, string> = {
	strength: 'Strength',
	dexterity: 'Dexterity',
	constitution: 'Constitution',
	intelligence: 'Intelligence',
	wisdom: 'Wisdom',
	charisma: 'Charisma'
};

/** The ability's display name, such as "Dexterity" for `dexterity`. */
export function abilityLabel(key: AbilityKey): string {
	return ABILITY_LABELS[key];
}
