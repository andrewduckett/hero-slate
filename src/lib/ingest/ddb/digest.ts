/**
 * Compute a character's digest of facts from the D&D Beyond character-service
 * response body.
 *
 * Sorts fields into required and optional, per the spec: a required field
 * that is missing, `null`, or of an unexpected type makes the response
 * unreadable; an optional field reads a missing or `null` value as "none",
 * and a present, non-null, wrong-typed value as unreadable. Every check
 * names the field it failed on, using the internal `Unreadable` signal
 * caught once at the top of `computeDigest` — this keeps the field-reading
 * code a flat sequence of checks instead of nested early returns.
 */

export const ABILITY_ORDER = [
	'strength',
	'dexterity',
	'constitution',
	'intelligence',
	'wisdom',
	'charisma'
] as const;

export type AbilityKey = (typeof ABILITY_ORDER)[number];

export interface DigestClass {
	name: string;
	subclass?: string;
	level: number;
}

export type AbilityScores = Record<AbilityKey, number>;

export interface Digest {
	name: string;
	classes: DigestClass[];
	level: number;
	abilities: AbilityScores;
	armorClass: number | null;
	armorClassReason: string | null;
	speed: number;
	initiative: number;
	hitPointsMax: number;
}

export type DigestResult = { status: 'ok'; digest: Digest } | { status: 'unreadable'; message: string };

/** A D&D Beyond modifier entry, loosely typed; callers read only the fields they need. */
export type Modifier = Record<string, unknown>;

const MODIFIER_GROUPS = ['race', 'class', 'background', 'item', 'feat', 'condition'] as const;

class Unreadable extends Error {}

function fail(field: string): never {
	throw new Unreadable(field);
}

function asRecord(value: unknown, field: string): Record<string, unknown> {
	if (typeof value !== 'object' || value === null || Array.isArray(value)) {
		fail(field);
	}
	return value as Record<string, unknown>;
}

function requiredString(value: unknown, field: string): string {
	if (typeof value !== 'string') fail(field);
	return value;
}

function requiredNumber(value: unknown, field: string): number {
	if (typeof value !== 'number' || !Number.isFinite(value)) fail(field);
	return value;
}

function requiredArray(value: unknown, field: string): unknown[] {
	if (!Array.isArray(value)) fail(field);
	return value;
}

/** An optional field: `undefined`/`null` means none; anything else must satisfy `read`. */
function optionalField<T>(value: unknown, field: string, read: (v: unknown) => T): T | undefined {
	if (value === undefined || value === null) return undefined;
	return read(value);
}

function ability(id: unknown): AbilityKey | undefined {
	return typeof id === 'number' ? ABILITY_ORDER[id - 1] : undefined;
}

function readClasses(raw: unknown): { classes: DigestClass[]; level: number } {
	const list = requiredArray(raw, 'classes');
	if (list.length === 0) fail('classes');

	const classes = list.map((entry) => {
		const record = asRecord(entry, 'classes');
		const level = requiredNumber(record.level, 'classes');
		const definition = optionalField(record.definition, 'classes', (v) => asRecord(v, 'classes'));
		const name = typeof definition?.name === 'string' ? definition.name : '';
		const subclassDefinition = optionalField(record.subclassDefinition, 'classes', (v) => asRecord(v, 'classes'));
		const subclass = typeof subclassDefinition?.name === 'string' ? subclassDefinition.name : undefined;
		return subclass !== undefined ? { name, subclass, level } : { name, level };
	});

	return { classes, level: classes.reduce((sum, c) => sum + c.level, 0) };
}

/** Read the six base scores from `stats` (required: all six abilities present and numeric). */
function readBaseScores(raw: unknown, field: string): AbilityScores {
	const list = requiredArray(raw, field);
	const scores: Partial<AbilityScores> = {};
	for (const entry of list) {
		const record = asRecord(entry, field);
		const key = ability(record.id);
		if (!key) continue;
		scores[key] = requiredNumber(record.value, field);
	}
	for (const key of ABILITY_ORDER) {
		if (scores[key] === undefined) fail(field);
	}
	return scores as AbilityScores;
}

/** Read an optional bonus/override list: entries with a `null` value mean "none" for that ability. */
function readAbilityAdjustments(raw: unknown, field: string): Partial<AbilityScores> {
	const list = requiredArray(raw, field);
	const adjustments: Partial<AbilityScores> = {};
	for (const entry of list) {
		const record = asRecord(entry, field);
		const key = ability(record.id);
		if (!key) continue;
		const value = record.value;
		if (value === null || value === undefined) continue;
		adjustments[key] = requiredNumber(value, field);
	}
	return adjustments;
}

function readModifiers(raw: unknown): Modifier[] {
	const record = asRecord(raw, 'modifiers');
	const all: Modifier[] = [];
	for (const group of MODIFIER_GROUPS) {
		const list = optionalField(record[group], `modifiers.${group}`, (v) => requiredArray(v, `modifiers.${group}`));
		for (const entry of list ?? []) {
			all.push(asRecord(entry, `modifiers.${group}`));
		}
	}
	return all;
}

function readBaseSpeed(data: Record<string, unknown>): number {
	const race = asRecord(data.race, 'speed');
	const weightSpeeds = asRecord(race.weightSpeeds, 'speed');
	const normal = asRecord(weightSpeeds.normal, 'speed');
	return requiredNumber(normal.walk, 'speed');
}

function hasEquippedArmorOrShield(inventory: unknown[]): boolean {
	return inventory.some((raw) => {
		const record = asRecord(raw, 'inventory');
		if (record.equipped !== true) return false;
		const definition = optionalField(record.definition, 'inventory', (v) => asRecord(v, 'inventory'));
		return definition?.filterType === 'Armor';
	});
}

function abilityModifier(score: number): number {
	return Math.floor((score - 10) / 2);
}

/** Sum the `value` of every `bonus` modifier whose `subType` matches. */
function sumBonus(modifiers: Modifier[], subType: string): number {
	return modifiers
		.filter((m) => m.type === 'bonus' && m.subType === subType)
		.reduce((sum, m) => sum + (typeof m.value === 'number' ? m.value : 0), 0);
}

/** The highest `value` of any `set` modifier whose `subType` matches, or `undefined`. */
function maxSet(modifiers: Modifier[], subType: string): number | undefined {
	const values = modifiers
		.filter((m) => m.type === 'set' && m.subType === subType)
		.map((m) => m.value)
		.filter((v): v is number => typeof v === 'number');
	return values.length > 0 ? Math.max(...values) : undefined;
}

function computeAbilityScores(
	base: AbilityScores,
	bonusStats: Partial<AbilityScores>,
	overrideStats: Partial<AbilityScores>,
	modifiers: Modifier[]
): AbilityScores {
	const result = {} as AbilityScores;
	for (const key of ABILITY_ORDER) {
		const computed = base[key] + (bonusStats[key] ?? 0) + sumBonus(modifiers, `${key}-score`);
		const set = maxSet(modifiers, `${key}-score`);
		const withSet = set !== undefined ? Math.max(computed, set) : computed;
		result[key] = overrideStats[key] ?? withSet;
	}
	return result;
}

export function computeDigest(body: unknown): DigestResult {
	try {
		const outer = asRecord(body, 'data');
		const data = asRecord(outer.data, 'data');

		const name = requiredString(data.name, 'name');
		const { classes, level } = readClasses(data.classes);

		const baseScores = readBaseScores(data.stats, 'stats');
		const bonusStats = optionalField(data.bonusStats, 'bonusStats', (v) => readAbilityAdjustments(v, 'bonusStats')) ?? {};
		const overrideStats =
			optionalField(data.overrideStats, 'overrideStats', (v) => readAbilityAdjustments(v, 'overrideStats')) ?? {};

		const modifiers = readModifiers(data.modifiers);
		const inventory = requiredArray(data.inventory, 'inventory');

		const abilities = computeAbilityScores(baseScores, bonusStats, overrideStats, modifiers);

		const baseHitPoints = requiredNumber(data.baseHitPoints, 'baseHitPoints');
		const bonusHitPoints = optionalField(data.bonusHitPoints, 'bonusHitPoints', (v) => requiredNumber(v, 'bonusHitPoints')) ?? 0;
		const overrideHitPoints = optionalField(data.overrideHitPoints, 'overrideHitPoints', (v) =>
			requiredNumber(v, 'overrideHitPoints')
		);
		// characterValues is read here only to enforce its optional-field type rule; later
		// stories may read its contents for other overrides.
		optionalField(data.characterValues, 'characterValues', (v) => requiredArray(v, 'characterValues'));

		const constitutionModifier = abilityModifier(abilities.constitution);
		const perLevelHitPoints = sumBonus(modifiers, 'hit-points-per-level');
		const hitPointsMax =
			overrideHitPoints ?? baseHitPoints + bonusHitPoints + constitutionModifier * level + perLevelHitPoints * level;

		const baseSpeed = readBaseSpeed(data);
		const wearsArmorOrShield = hasEquippedArmorOrShield(inventory);
		const unarmoredMovement = wearsArmorOrShield ? 0 : sumBonus(modifiers, 'unarmored-movement');
		const speed = baseSpeed + sumBonus(modifiers, 'speed') + unarmoredMovement;

		const initiative = abilityModifier(abilities.dexterity) + sumBonus(modifiers, 'initiative');

		// Armor Class is computed by armorClass.ts and wired in once that module exists.
		const armorClass = null;
		const armorClassReason = 'armor class is not yet computed';

		return {
			status: 'ok',
			digest: {
				name,
				classes,
				level,
				abilities,
				armorClass,
				armorClassReason,
				speed,
				initiative,
				hitPointsMax
			}
		};
	} catch (error) {
		if (error instanceof Unreadable) {
			return { status: 'unreadable', message: `the character response is missing or misshapen: ${error.message}` };
		}
		throw error;
	}
}
