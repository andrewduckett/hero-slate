/**
 * Compute Armor Class from an allowlist of understood sources: worn armor
 * with its Dexterity cap, an equipped shield, monk and barbarian Unarmored
 * Defense, flat item bonuses, and a D&D Beyond override. Any Armor Class
 * source outside that list reports Armor Class as `null`, with a reason
 * naming the source — an allowlist fails safe, so a new kind of effect
 * never produces a guessed number.
 *
 * The Unarmored Defense modifier shape and the override's `characterValues`
 * `typeId` (34) follow the shape documented by community D&D Beyond tooling.
 * Urven's fixture confirms the monk case (`statId: 5`, Wisdom); the
 * barbarian case (`statId: 3`, Constitution) and the override are untested
 * against a live fixture, per design.md's open question.
 */
import type { AbilityScores, Modifier } from './digest';
import { abilityModifier } from './rules';

export type ArmorClassResult = { value: number; reason: null } | { value: null; reason: string };

const SHIELD_TYPE_ID = 4;
const LIGHT_ARMOR_TYPE_ID = 1;
const MEDIUM_ARMOR_TYPE_ID = 2;
const HEAVY_ARMOR_TYPE_ID = 3;
const AC_OVERRIDE_TYPE_ID = 34;
const WISDOM_STAT_ID = 5;
const CONSTITUTION_STAT_ID = 3;

class UnknownSource extends Error {}

function unknown(reason: string): never {
	throw new UnknownSource(reason);
}

function asRecord(value: unknown): Record<string, unknown> | undefined {
	return typeof value === 'object' && value !== null && !Array.isArray(value)
		? (value as Record<string, unknown>)
		: undefined;
}

interface WornArmor {
	base: number;
	dexCap: number;
}

/** Scan equipped inventory items for worn armor and a shield. */
function readEquippedArmor(inventory: unknown[]): { armor?: WornArmor; shieldBonus: number } {
	let armor: WornArmor | undefined;
	let shieldBonus = 0;

	for (const raw of inventory) {
		const item = asRecord(raw);
		if (!item || item.equipped !== true) continue;
		const definition = asRecord(item.definition);
		if (!definition || definition.filterType !== 'Armor') continue;

		const name = typeof definition.name === 'string' ? definition.name : 'unnamed item';
		const armorTypeId = definition.armorTypeId;

		if (armorTypeId === SHIELD_TYPE_ID) {
			shieldBonus += typeof definition.armorClass === 'number' ? definition.armorClass : 0;
			continue;
		}
		if (
			armorTypeId === LIGHT_ARMOR_TYPE_ID ||
			armorTypeId === MEDIUM_ARMOR_TYPE_ID ||
			armorTypeId === HEAVY_ARMOR_TYPE_ID
		) {
			if (typeof definition.armorClass !== 'number') {
				unknown(`equipped armor "${name}" has no Armor Class value`);
			}
			const dexCap =
				armorTypeId === LIGHT_ARMOR_TYPE_ID ? Infinity : armorTypeId === MEDIUM_ARMOR_TYPE_ID ? 2 : 0;
			armor = { base: definition.armorClass, dexCap };
			continue;
		}
		unknown(`equipped armor "${name}" has an unrecognized armor type`);
	}

	return { armor, shieldBonus };
}

/** Scan modifiers for the two Unarmored Defense rules; each set-type entry must match a known ability. */
function readUnarmoredDefense(
	modifiers: Modifier[],
	abilities: AbilityScores
): { monk?: number; barbarian?: number } {
	const dexMod = abilityModifier(abilities.dexterity);
	let monk: number | undefined;
	let barbarian: number | undefined;

	for (const modifier of modifiers) {
		if (modifier.subType !== 'unarmored-armor-class') continue;
		if (modifier.type !== 'set') {
			unknown(`an unarmored-armor-class modifier of type "${String(modifier.type)}"`);
		}
		if (modifier.statId === WISDOM_STAT_ID) {
			monk = 10 + dexMod + abilityModifier(abilities.wisdom);
		} else if (modifier.statId === CONSTITUTION_STAT_ID) {
			barbarian = 10 + dexMod + abilityModifier(abilities.constitution);
		} else {
			unknown(`an unarmored-armor-class modifier for an unrecognized ability (statId ${String(modifier.statId)})`);
		}
	}

	return { monk, barbarian };
}

/** Sum flat `bonus`-type `armor-class` modifiers; any other type on that subType is unrecognized. */
function readFlatBonus(modifiers: Modifier[]): number {
	let total = 0;
	for (const modifier of modifiers) {
		if (modifier.subType !== 'armor-class') continue;
		if (modifier.type !== 'bonus') {
			unknown(`an armor-class modifier of type "${String(modifier.type)}"`);
		}
		total += typeof modifier.value === 'number' ? modifier.value : 0;
	}
	return total;
}

function readOverride(characterValues: unknown[]): number | undefined {
	for (const raw of characterValues) {
		const entry = asRecord(raw);
		if (entry && entry.typeId === AC_OVERRIDE_TYPE_ID && typeof entry.value === 'number') {
			return entry.value;
		}
	}
	return undefined;
}

export function computeArmorClass(
	inventory: unknown[],
	modifiers: Modifier[],
	characterValues: unknown[],
	abilities: AbilityScores
): ArmorClassResult {
	try {
		const override = readOverride(characterValues);
		if (override !== undefined) {
			return { value: override, reason: null };
		}

		const dexMod = abilityModifier(abilities.dexterity);
		const { armor, shieldBonus } = readEquippedArmor(inventory);
		const holdsShield = shieldBonus > 0;
		const { monk, barbarian } = readUnarmoredDefense(modifiers, abilities);

		let base: number;
		if (armor) {
			base = armor.base + Math.min(dexMod, armor.dexCap);
		} else {
			const candidates = [10 + dexMod];
			if (barbarian !== undefined) candidates.push(barbarian);
			if (monk !== undefined && !holdsShield) candidates.push(monk);
			base = Math.max(...candidates);
		}

		base += shieldBonus;
		base += readFlatBonus(modifiers);

		return { value: base, reason: null };
	} catch (error) {
		if (error instanceof UnknownSource) {
			return { value: null, reason: error.message };
		}
		throw error;
	}
}
