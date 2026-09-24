/**
 * Compute the character's actions: its class, species, background, and feat
 * features, plus its equipped weapons. Each number field is known, unknown
 * (with a reason), or not applicable (design.md D5) — the digest never
 * guesses a to-hit, damage, or save DC it cannot prove.
 *
 * `digest.ts` type-checks each feature action's shape down to a plain
 * record; this module reads that record's loosely-typed fields itself and
 * fails safe to "unknown" per number, the same pattern `armorClass.ts` and
 * `limitedUses.ts` use for one entry's problem.
 */
import { ABILITY_ORDER, type AbilityKey, type AbilityScores, type Modifier } from './digest';
import { abilityModifier, abilityLabel, proficiencyBonus } from './rules';

export type ActionSource = 'class' | 'species' | 'background' | 'feat' | 'weapon';
export type Activation = 'action' | 'bonus action' | 'reaction';

export interface Action {
	name: string;
	source: ActionSource;
	activation: Activation | null;
	toHit: number | null;
	toHitReason: string | null;
	damage: string | null;
	damageReason: string | null;
	saveDc: number | null;
	saveDcReason: string | null;
	saveAbility: string | null;
}

/** One raw `class`/`race`/`background`/`feat` action record, already sorted into its source group. */
export interface FeatureActionEntry {
	name: string;
	source: Exclude<ActionSource, 'weapon'>;
	record: Record<string, unknown>;
}

const ACTIVATION_WORDS: Record<number, Activation> = { 1: 'action', 3: 'bonus action', 4: 'reaction' };

const WEAPON_BONUS_SUBTYPES = new Set([
	'weapon-attacks',
	'melee-weapon-attacks',
	'ranged-weapon-attacks',
	'weapon-damage',
	'melee-weapon-damage',
	'ranged-weapon-damage'
]);

function abilityFromStatId(id: unknown): AbilityKey | undefined {
	return typeof id === 'number' ? ABILITY_ORDER[id - 1] : undefined;
}

function isAttack(record: Record<string, unknown>): boolean {
	return record.attackTypeRange !== null && record.attackTypeRange !== undefined;
}

function readActivation(record: Record<string, unknown>): Activation | null {
	const activation = record.activation;
	if (typeof activation !== 'object' || activation === null) return null;
	const code = (activation as Record<string, unknown>).activationType;
	return typeof code === 'number' ? (ACTIVATION_WORDS[code] ?? null) : null;
}

/** A `{ diceString }` shape, its spaces removed, or `undefined` when there is no readable dice string. */
function readDiceString(dice: unknown): string | undefined {
	if (typeof dice !== 'object' || dice === null) return undefined;
	const value = (dice as Record<string, unknown>).diceString;
	return typeof value === 'string' ? value.replace(/\s+/g, '') : undefined;
}

function formatSigned(value: number): string {
	return value > 0 ? `+${value}` : `${value}`;
}

interface NumberResult<T> {
	value: T | null;
	reason: string | null;
}

function computeFeatureToHit(record: Record<string, unknown>, abilities: AbilityScores, proficiencyBonusValue: number): NumberResult<number> {
	if (!isAttack(record)) return { value: null, reason: null };

	const namedAbility = abilityFromStatId(record.abilityModifierStatId);
	let base: number;
	if (namedAbility) {
		base = abilityModifier(abilities[namedAbility]);
	} else if (record.isMartialArts === true) {
		base = Math.max(abilityModifier(abilities.strength), abilityModifier(abilities.dexterity));
	} else {
		return { value: null, reason: 'the action names no ability and is not marked as martial arts' };
	}

	const proficient = record.isProficient === true;
	return { value: base + (proficient ? proficiencyBonusValue : 0), reason: null };
}

function computeFeatureDamage(record: Record<string, unknown>): NumberResult<string> {
	const diceString = readDiceString(record.dice);
	if (diceString !== undefined) return { value: diceString, reason: null };
	if (isAttack(record)) return { value: null, reason: 'the action has no dice' };
	return { value: null, reason: null };
}

interface SaveResult {
	saveDc: number | null;
	saveDcReason: string | null;
	saveAbility: string | null;
}

function computeSaveDc(record: Record<string, unknown>, abilities: AbilityScores, proficiencyBonusValue: number): SaveResult {
	const saveAbilityKey = abilityFromStatId(record.saveStatId);
	if (!saveAbilityKey) return { saveDc: null, saveDcReason: null, saveAbility: null };

	const saveAbility = abilityLabel(saveAbilityKey);
	const fixed = record.fixedSaveDc;
	if (typeof fixed === 'number') return { saveDc: fixed, saveDcReason: null, saveAbility };

	const namedAbility = abilityFromStatId(record.abilityModifierStatId);
	if (namedAbility) {
		return {
			saveDc: 8 + proficiencyBonusValue + abilityModifier(abilities[namedAbility]),
			saveDcReason: null,
			saveAbility
		};
	}

	return { saveDc: null, saveDcReason: 'the action has a save with no fixed DC and no named ability', saveAbility };
}

function computeFeatureAction(entry: FeatureActionEntry, abilities: AbilityScores, proficiencyBonusValue: number): Action {
	const { record } = entry;
	const toHit = computeFeatureToHit(record, abilities, proficiencyBonusValue);
	const damage = computeFeatureDamage(record);
	const save = computeSaveDc(record, abilities, proficiencyBonusValue);

	return {
		name: entry.name,
		source: entry.source,
		activation: readActivation(record),
		toHit: toHit.value,
		toHitReason: toHit.reason,
		damage: damage.value,
		damageReason: damage.reason,
		saveDc: save.saveDc,
		saveDcReason: save.saveDcReason,
		saveAbility: save.saveAbility
	};
}

interface EquippedWeapon {
	name: string;
	definition: Record<string, unknown>;
}

function asRecord(value: unknown): Record<string, unknown> | undefined {
	return typeof value === 'object' && value !== null && !Array.isArray(value) ? (value as Record<string, unknown>) : undefined;
}

/** Every distinct equipped weapon, in first-seen order. */
function readEquippedWeapons(inventory: unknown[]): EquippedWeapon[] {
	const seen = new Map<string, Record<string, unknown>>();
	for (const raw of inventory) {
		const item = asRecord(raw);
		if (!item || item.equipped !== true) continue;
		const definition = asRecord(item.definition);
		if (!definition || definition.filterType !== 'Weapon') continue;
		const name = typeof definition.name === 'string' ? definition.name : undefined;
		if (!name || seen.has(name)) continue;
		seen.set(name, definition);
	}
	return [...seen.entries()].map(([name, definition]) => ({ name, definition }));
}

function readPropertyNames(properties: unknown): Set<string> {
	const names = new Set<string>();
	if (!Array.isArray(properties)) return names;
	for (const raw of properties) {
		const property = asRecord(raw);
		if (typeof property?.name === 'string') names.add(property.name.toLowerCase());
	}
	return names;
}

/** The sum of the `bonus`/`magic` entries in a weapon definition's `grantedModifiers`, or 0 when there are none. */
function sumMagicBonus(grantedModifiers: unknown): number {
	if (!Array.isArray(grantedModifiers)) return 0;
	let total = 0;
	for (const raw of grantedModifiers) {
		const modifier = asRecord(raw);
		if (modifier?.type === 'bonus' && modifier.subType === 'magic' && typeof modifier.value === 'number') {
			total += modifier.value;
		}
	}
	return total;
}

function isWeaponProficient(modifiers: Modifier[], definition: Record<string, unknown>, name: string): boolean {
	const categoryId = definition.categoryId;
	const slug = name.toLowerCase().replace(/\s+/g, '-');
	return modifiers.some((m) => {
		if (m.type !== 'proficiency') return false;
		if (categoryId === 1 && m.subType === 'simple-weapons') return true;
		if (categoryId === 2 && m.subType === 'martial-weapons') return true;
		return m.subType === slug;
	});
}

interface WeaponNumbers {
	toHit: number | null;
	toHitReason: string | null;
	damage: string | null;
	damageReason: string | null;
}

function unknownWeapon(reason: string): WeaponNumbers {
	return { toHit: null, toHitReason: reason, damage: null, damageReason: reason };
}

function computeWeaponNumbers(
	weapon: EquippedWeapon,
	modifiers: Modifier[],
	abilities: AbilityScores,
	proficiencyBonusValue: number
): WeaponNumbers {
	const { name, definition } = weapon;

	if (modifiers.some((m) => m.type === 'monk-weapon')) {
		return unknownWeapon('the character has a Monk weapon rule the digest does not model');
	}

	const magicBonus = sumMagicBonus(definition.grantedModifiers);
	if (definition.magic === true && magicBonus === 0) {
		return unknownWeapon('the weapon is magic, and the digest finds no readable magic bonus');
	}

	if (modifiers.some((m) => m.type === 'bonus' && typeof m.subType === 'string' && WEAPON_BONUS_SUBTYPES.has(m.subType))) {
		return unknownWeapon('the character has a flat weapon attack or damage bonus the digest does not model');
	}

	const properties = readPropertyNames(definition.properties);
	const isFinesse = properties.has('finesse');
	const strMod = abilityModifier(abilities.strength);
	const dexMod = abilityModifier(abilities.dexterity);
	const ability: AbilityKey = isFinesse ? (strMod >= dexMod ? 'strength' : 'dexterity') : definition.attackType === 2 ? 'dexterity' : 'strength';
	const abilityMod = abilityModifier(abilities[ability]);

	const proficient = isWeaponProficient(modifiers, definition, name);
	const toHit = abilityMod + (proficient ? proficiencyBonusValue : 0) + magicBonus;

	const dice = readDiceString(definition.damage);
	if (dice === undefined) {
		return { toHit, toHitReason: null, damage: null, damageReason: 'the weapon definition has no damage dice' };
	}
	const damage = abilityMod === 0 ? dice : `${dice}${formatSigned(abilityMod)}`;

	return { toHit, toHitReason: null, damage, damageReason: null };
}

function computeWeaponAction(weapon: EquippedWeapon, modifiers: Modifier[], abilities: AbilityScores, proficiencyBonusValue: number): Action {
	const numbers = computeWeaponNumbers(weapon, modifiers, abilities, proficiencyBonusValue);
	return {
		name: weapon.name,
		source: 'weapon',
		activation: 'action',
		toHit: numbers.toHit,
		toHitReason: numbers.toHitReason,
		damage: numbers.damage,
		damageReason: numbers.damageReason,
		saveDc: null,
		saveDcReason: null,
		saveAbility: null
	};
}

export function computeActions(
	featureEntries: FeatureActionEntry[],
	inventory: unknown[],
	modifiers: Modifier[],
	abilities: AbilityScores,
	level: number
): Action[] {
	const proficiencyBonusValue = proficiencyBonus(level);

	const featureActions = featureEntries.map((entry) => computeFeatureAction(entry, abilities, proficiencyBonusValue));
	const weaponActions = readEquippedWeapons(inventory).map((weapon) =>
		computeWeaponAction(weapon, modifiers, abilities, proficiencyBonusValue)
	);

	return [...featureActions, ...weaponActions];
}
