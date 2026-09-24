/**
 * Compute each limited use's maximum from D&D Beyond's own `limitedUse`
 * rule: a fixed number of uses, plus an optional ability modifier or
 * proficiency bonus. A field of an unexpected type inside one rule gives
 * that entry an unknown maximum, with a reason naming the field — it never
 * fails the whole digest, following the same fail-safe pattern as
 * `armorClass.ts`.
 */
import { ABILITY_ORDER, type AbilityKey, type AbilityScores } from './digest';
import { abilityModifier, proficiencyBonus } from './rules';

export type LimitedUseSource = 'class' | 'species' | 'background' | 'feat';
export type ResetWord = 'short rest' | 'long rest' | 'dawn';

export interface LimitedUse {
	name: string;
	source: LimitedUseSource;
	max: number | null;
	maxReason: string | null;
	reset: ResetWord | null;
}

/** One D&D Beyond `limitedUse` rule, already sorted into its source group. */
export interface LimitedUseEntry {
	name: string;
	source: LimitedUseSource;
	rule: Record<string, unknown>;
}

const RESET_WORDS: Record<number, ResetWord> = { 1: 'short rest', 2: 'long rest', 3: 'dawn' };

const ADD_OPERATOR = 1;

class UnknownMax extends Error {}

function unknownMax(reason: string): never {
	throw new UnknownMax(reason);
}

function abilityKey(id: unknown): AbilityKey | undefined {
	return typeof id === 'number' ? ABILITY_ORDER[id - 1] : undefined;
}

function readReset(rule: Record<string, unknown>): ResetWord | null {
	const code = rule.resetType;
	return typeof code === 'number' ? (RESET_WORDS[code] ?? null) : null;
}

function computeMax(rule: Record<string, unknown>, abilities: AbilityScores, level: number): number {
	const rawMaxUses = rule.maxUses;
	let total: number;
	if (rawMaxUses === undefined || rawMaxUses === null) {
		total = 0;
	} else if (typeof rawMaxUses === 'number' && Number.isFinite(rawMaxUses)) {
		total = rawMaxUses;
	} else {
		unknownMax(`"maxUses" is ${JSON.stringify(rawMaxUses)}, not a number`);
	}

	const statId = rule.statModifierUsesId;
	if (statId !== undefined && statId !== null) {
		const key = abilityKey(statId);
		if (!key) {
			unknownMax(`"statModifierUsesId" ${JSON.stringify(statId)} does not name a known ability`);
		}
		total += abilityModifier(abilities[key]);
	}

	const useProficiencyBonus = rule.useProficiencyBonus;
	if (useProficiencyBonus === true) {
		const operator = rule.proficiencyBonusOperator;
		if (operator !== ADD_OPERATOR) {
			unknownMax(`"proficiencyBonusOperator" ${JSON.stringify(operator)} is not the add operator`);
		}
		total += proficiencyBonus(level);
	} else if (useProficiencyBonus !== undefined && useProficiencyBonus !== null && useProficiencyBonus !== false) {
		unknownMax(`"useProficiencyBonus" is ${JSON.stringify(useProficiencyBonus)}, not a boolean`);
	}

	return total;
}

export function computeLimitedUses(
	entries: LimitedUseEntry[],
	abilities: AbilityScores,
	level: number
): LimitedUse[] {
	const results: LimitedUse[] = [];

	for (const entry of entries) {
		const reset = readReset(entry.rule);
		try {
			const max = computeMax(entry.rule, abilities, level);
			if (max <= 0) continue;
			results.push({ name: entry.name, source: entry.source, max, maxReason: null, reset });
		} catch (error) {
			if (error instanceof UnknownMax) {
				results.push({ name: entry.name, source: entry.source, max: null, maxReason: error.message, reset });
				continue;
			}
			throw error;
		}
	}

	return results;
}
