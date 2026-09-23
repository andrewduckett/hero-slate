/**
 * Compare a draft's entries against a digest, and warn on a mismatch.
 *
 * Matches labels case-insensitively via a small alias table, so a rename is
 * the Author's right: an unrecognized label is silently skipped, as is a
 * digest fact that is `null`. Mismatches never block the preview. The name
 * is never compared.
 */
import { ABILITY_ORDER, type AbilityKey, type Digest } from './digest';
import { validEntries } from '$lib/character/entries';

const ABILITY_ALIASES: Record<string, AbilityKey> = {
	strength: 'strength',
	str: 'strength',
	dexterity: 'dexterity',
	dex: 'dexterity',
	constitution: 'constitution',
	con: 'constitution',
	intelligence: 'intelligence',
	int: 'intelligence',
	wisdom: 'wisdom',
	wis: 'wisdom',
	charisma: 'charisma',
	cha: 'charisma'
};

type CombatFact = 'armorClass' | 'speed' | 'initiative';

const COMBAT_ALIASES: Record<string, CombatFact> = {
	'armor class': 'armorClass',
	ac: 'armorClass',
	speed: 'speed',
	initiative: 'initiative',
	init: 'initiative'
};

function normalize(label: string): string {
	return label.trim().toLowerCase();
}

/** A finite number, or a signed numeric string such as `"+5"`, read as its number. */
function toNumber(value: unknown): number | undefined {
	if (typeof value === 'number' && Number.isFinite(value)) return value;
	if (typeof value === 'string' && /^[+-]?\d+(\.\d+)?$/.test(value.trim())) {
		return Number(value.trim());
	}
	return undefined;
}

function mismatch(label: string, draftValue: number, digestValue: number): string {
	return `${label}: the draft shows ${draftValue}, but D&D Beyond says ${digestValue}`;
}

export function crosscheckDraft(draft: Record<string, unknown>, digest: Digest): string[] {
	const warnings: string[] = [];

	const level = toNumber(draft.level);
	if (level !== undefined && level !== digest.level) {
		warnings.push(mismatch('Level', level, digest.level));
	}

	for (const entry of validEntries(draft.abilities)) {
		const key = ABILITY_ALIASES[normalize(entry.label)];
		if (!key || !ABILITY_ORDER.includes(key)) continue;
		const value = toNumber(entry.value);
		if (value === undefined) continue;
		const digestValue = digest.abilities[key];
		if (value !== digestValue) {
			warnings.push(mismatch(entry.label, value, digestValue));
		}
	}

	for (const entry of validEntries(draft.combat)) {
		const fact = COMBAT_ALIASES[normalize(entry.label)];
		if (!fact) continue;
		const digestValue = digest[fact];
		if (digestValue === null) continue;
		const value = toNumber(entry.value);
		if (value === undefined) continue;
		if (value !== digestValue) {
			warnings.push(mismatch(entry.label, value, digestValue));
		}
	}

	const hitPoints = draft.hitPoints;
	if (typeof hitPoints === 'object' && hitPoints !== null && !Array.isArray(hitPoints)) {
		const max = toNumber((hitPoints as Record<string, unknown>).max);
		if (max !== undefined && max !== digest.hitPointsMax) {
			warnings.push(mismatch('Hit Points', max, digest.hitPointsMax));
		}
	}

	return warnings;
}
