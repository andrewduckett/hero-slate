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
import { resolvePools } from '$lib/character/pools';

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
	return label.trim().toLowerCase().replace(/\s+/g, ' ');
}

const ORDINAL_SUFFIX: Record<number, string> = {
	1: 'st',
	2: 'nd',
	3: 'rd',
	4: 'th',
	5: 'th',
	6: 'th',
	7: 'th',
	8: 'th',
	9: 'th'
};

/** The five slot-label forms the spec defines, as one anchored expression. */
const SLOT_LABEL =
	/^(?:l(?<ln>[1-9]) slots|level (?<lv>[1-9]) slots|level (?<lvs>[1-9]) spell slots|(?<ord>[1-9])(?<ordSuffix>st|nd|rd|th) level slots|(?<ords>[1-9])(?<ordsSuffix>st|nd|rd|th) level spell slots)$/;

const PACT_LABEL = /^pact (slots|magic)$/;

/** The spell level a normalized label names, or `undefined` when it is not one of the five slot-label forms. */
function slotLabelLevel(label: string): number | undefined {
	const match = SLOT_LABEL.exec(label);
	if (!match?.groups) return undefined;
	const { ln, lv, lvs, ord, ordSuffix, ords, ordsSuffix } = match.groups;
	if (ln) return Number(ln);
	if (lv) return Number(lv);
	if (lvs) return Number(lvs);
	if (ord && ordSuffix === ORDINAL_SUFFIX[Number(ord)]) return Number(ord);
	if (ords && ordsSuffix === ORDINAL_SUFFIX[Number(ords)]) return Number(ords);
	return undefined;
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

	const limitedUses = digest.limitedUses ?? [];
	const spellSlots = digest.spellSlots ?? null;
	const pactMagic = digest.pactMagic ?? null;

	for (const pool of resolvePools(draft.pools, null)) {
		const label = normalize(pool.label);

		const limitedUse = limitedUses.find((use) => normalize(use.name) === label);
		if (limitedUse) {
			if (limitedUse.max !== null && pool.max !== limitedUse.max) {
				warnings.push(mismatch(pool.label, pool.max, limitedUse.max));
			}
			continue;
		}

		const slotLevel = slotLabelLevel(label);
		if (slotLevel !== undefined) {
			if (spellSlots !== null) {
				const digestSlots = spellSlots.find((entry) => entry.level === slotLevel)?.slots ?? 0;
				if (pool.max !== digestSlots) {
					warnings.push(mismatch(pool.label, pool.max, digestSlots));
				}
			}
			continue;
		}

		if (PACT_LABEL.test(label)) {
			if (pactMagic !== null && pool.max !== pactMagic.slots) {
				warnings.push(mismatch(pool.label, pool.max, pactMagic.slots));
			}
		}
	}

	return warnings;
}
