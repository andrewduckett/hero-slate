/**
 * Compute a character's spells and spellcasting summary. D&D Beyond lists
 * the same spell once for each way the character gets it; this module
 * groups those records by name into cast ways (design D3) and derives each
 * way's status, casting ability, and numbers.
 *
 * `digest.ts` type-checks each spell record's shape down to a plain object
 * and sorts it into its source group; this module reads that record's
 * loosely-typed fields itself and fails safe to "unknown" per number, the
 * same pattern `actions.ts` and `limitedUses.ts` use for one entry's
 * problem.
 */
import { ABILITY_ORDER, type AbilityKey, type AbilityScores, type Modifier } from './digest';
import { abilityModifier, abilityLabel, proficiencyBonus } from './rules';
import { computeSingleLimitedUse, type SingleLimitedUse } from './limitedUses';

export type SpellSource = 'class' | 'class feature' | 'species' | 'background' | 'feat';
export type SpellStatus = 'cantrip' | 'always' | 'granted' | 'prepared' | 'not-prepared';

export interface SpellWay {
	source: SpellSource;
	className: string | null;
	status: SpellStatus;
	usesSlot: boolean;
	limitedUse: SingleLimitedUse | null;
	castingAbility: string | null;
	castingAbilityReason: string | null;
	toHit: number | null;
	toHitReason: string | null;
	damage: string | null;
	damageReason: string | null;
	healing: string | null;
	healingReason: string | null;
	saveDc: number | null;
	saveDcReason: string | null;
}

export interface Spell {
	name: string;
	level: number;
	concentration: boolean;
	ritual: boolean;
	saveAbility: string | null;
	ways: SpellWay[];
}

export interface SpellcastingClassSummary {
	className: string;
	ability: string;
	spellAttack: number | null;
	spellAttackReason: string | null;
	saveDc: number | null;
	saveDcReason: string | null;
}

/** One raw spell record, already sorted into its source group by `digest.ts`. */
export interface SpellRecordEntry {
	source: SpellSource;
	classId: number | undefined;
	record: Record<string, unknown>;
}

/** One class's `id`, name, level, and spellcasting ability (from its own or its subclass's definition). */
export interface SpellClassInfo {
	id: number | undefined;
	name: string;
	level: number;
	ability: AbilityKey | undefined;
}

function asRecord(value: unknown): Record<string, unknown> | undefined {
	return typeof value === 'object' && value !== null && !Array.isArray(value) ? (value as Record<string, unknown>) : undefined;
}

function abilityFromId(id: unknown): AbilityKey | undefined {
	return typeof id === 'number' ? ABILITY_ORDER[id - 1] : undefined;
}

function readDiceString(dice: unknown): string | undefined {
	const record = asRecord(dice);
	const value = record?.diceString;
	return typeof value === 'string' ? value.replace(/\s+/g, '') : undefined;
}

function formatSigned(value: number): string {
	return value > 0 ? `+${value}` : `${value}`;
}

function readRule(value: unknown): Record<string, unknown> | undefined {
	if (value === undefined || value === null) return undefined;
	return asRecord(value) ?? {};
}

function hasBonusSubtypeContaining(modifiers: Modifier[], needle: string): boolean {
	return modifiers.some((m) => m.type === 'bonus' && typeof m.subType === 'string' && m.subType.includes(needle));
}

function definitionOf(record: Record<string, unknown>): Record<string, unknown> {
	return asRecord(record.definition) ?? {};
}

function spellName(record: Record<string, unknown>): string {
	const value = definitionOf(record).name;
	return typeof value === 'string' ? value : '';
}

interface CastingAbilityResult {
	key: AbilityKey | undefined;
	label: string | null;
	reason: string | null;
}

function computeCastingAbility(entry: SpellRecordEntry, classes: SpellClassInfo[]): CastingAbilityResult {
	const own = abilityFromId(entry.record.spellCastingAbilityId);
	if (own) return { key: own, label: abilityLabel(own), reason: null };

	if (entry.source === 'class') {
		const match = classes.find((c) => c.id !== undefined && c.id === entry.classId);
		if (match?.ability) return { key: match.ability, label: abilityLabel(match.ability), reason: null };
		return {
			key: undefined,
			label: null,
			reason: match
				? `the spell names no casting ability, and ${match.name} names no spellcasting ability`
				: 'the spell names no casting ability, and its class id does not match a class on the sheet'
		};
	}

	if (entry.source === 'class feature') {
		const spellcasters = classes.filter((c): c is SpellClassInfo & { ability: AbilityKey } => c.ability !== undefined);
		if (spellcasters.length === 1) {
			const [only] = spellcasters;
			return { key: only.ability, label: abilityLabel(only.ability), reason: null };
		}
		return {
			key: undefined,
			label: null,
			reason:
				spellcasters.length === 0
					? 'the spell names no casting ability, and the character has no spellcasting class'
					: 'the spell names no casting ability, and the character has more than one spellcasting class'
		};
	}

	return { key: undefined, label: null, reason: 'the spell names no casting ability' };
}

interface NumberResult<T> {
	value: T | null;
	reason: string | null;
}

function computeToHit(
	definition: Record<string, unknown>,
	casting: CastingAbilityResult,
	abilities: AbilityScores,
	modifiers: Modifier[],
	level: number
): NumberResult<number> {
	if (definition.requiresAttackRoll !== true) return { value: null, reason: null };
	if (!casting.key) return { value: null, reason: casting.reason ?? 'the casting ability is unknown' };
	if (hasBonusSubtypeContaining(modifiers, 'spell-attack')) {
		return { value: null, reason: 'the character has a spell attack bonus the digest does not model' };
	}
	return { value: abilityModifier(abilities[casting.key]) + proficiencyBonus(level), reason: null };
}

function computeSaveDc(
	definition: Record<string, unknown>,
	record: Record<string, unknown>,
	casting: CastingAbilityResult,
	abilities: AbilityScores,
	modifiers: Modifier[],
	level: number
): NumberResult<number> {
	if (definition.requiresSavingThrow !== true) return { value: null, reason: null };

	const fixed = record.overrideSaveDc;
	if (typeof fixed === 'number') return { value: fixed, reason: null };

	if (hasBonusSubtypeContaining(modifiers, 'spell-save-dc')) {
		return { value: null, reason: 'the character has a spell save DC bonus the digest does not model' };
	}

	if (!casting.key) return { value: null, reason: casting.reason ?? 'the casting ability is unknown' };

	return { value: 8 + proficiencyBonus(level) + abilityModifier(abilities[casting.key]), reason: null };
}

interface ModifierMatch {
	dice: string | undefined;
	usePrimaryStat: boolean;
	higherLevelSteps: { level: number; dice: string | undefined }[];
}

function readModifierMatches(modifiers: unknown, predicate: (type: unknown, subType: unknown) => boolean): ModifierMatch[] {
	if (!Array.isArray(modifiers)) return [];
	const matches: ModifierMatch[] = [];
	for (const raw of modifiers) {
		const modifier = asRecord(raw);
		if (!modifier || !predicate(modifier.type, modifier.subType)) continue;

		const atHigherLevels = asRecord(modifier.atHigherLevels);
		const higherLevelDefinitions = atHigherLevels?.higherLevelDefinitions;
		const steps = Array.isArray(higherLevelDefinitions)
			? higherLevelDefinitions
					.map((raw) => asRecord(raw))
					.filter((s): s is Record<string, unknown> => s !== undefined)
					.map((s) => ({ level: typeof s.level === 'number' ? s.level : -Infinity, dice: readDiceString(s.dice) }))
			: [];

		matches.push({ dice: readDiceString(modifier.die), usePrimaryStat: modifier.usePrimaryStat === true, higherLevelSteps: steps });
	}
	return matches;
}

function pickCantripStep(
	steps: { level: number; dice: string | undefined }[],
	characterLevel: number,
	base: string | undefined
): string | undefined {
	const applicable = steps.filter((s) => s.level <= characterLevel && s.dice !== undefined);
	if (applicable.length === 0) return base;
	return applicable.reduce((best, step) => (step.level > best.level ? step : best)).dice;
}

function computeDamageOrHealing(
	matches: ModifierMatch[],
	spellLevel: number,
	characterLevel: number,
	casting: CastingAbilityResult,
	abilities: AbilityScores,
	label: 'damage' | 'healing'
): NumberResult<string> {
	if (matches.length === 0) return { value: null, reason: null };
	if (matches.length > 1) return { value: null, reason: `the spell has more than one ${label} modifier` };

	const [match] = matches;
	const dice = spellLevel === 0 ? pickCantripStep(match.higherLevelSteps, characterLevel, match.dice) : match.dice;
	if (dice === undefined) return { value: null, reason: `the spell's ${label} modifier has no dice string` };

	if (!match.usePrimaryStat) return { value: dice, reason: null };
	if (!casting.key) return { value: null, reason: casting.reason ?? 'the casting ability is unknown' };

	const mod = abilityModifier(abilities[casting.key]);
	return { value: mod === 0 ? dice : `${dice}${formatSigned(mod)}`, reason: null };
}

function computeStatus(entry: SpellRecordEntry, spellLevel: number): SpellStatus {
	if (spellLevel === 0) return 'cantrip';
	if (entry.record.alwaysPrepared === true) return 'always';
	if (entry.source !== 'class') return 'granted';
	return entry.record.prepared === true ? 'prepared' : 'not-prepared';
}

function computeWay(entry: SpellRecordEntry, classes: SpellClassInfo[], abilities: AbilityScores, level: number, modifiers: Modifier[]): SpellWay {
	const { record } = entry;
	const definition = definitionOf(record);
	const spellLevel = typeof definition.level === 'number' ? definition.level : 0;

	const className =
		entry.source === 'class' ? (classes.find((c) => c.id !== undefined && c.id === entry.classId)?.name ?? null) : null;

	const casting = computeCastingAbility(entry, classes);
	const toHit = computeToHit(definition, casting, abilities, modifiers, level);
	const saveDc = computeSaveDc(definition, record, casting, abilities, modifiers, level);

	const damageMatches = readModifierMatches(definition.modifiers, (type) => type === 'damage');
	const healingMatches = readModifierMatches(definition.modifiers, (type, subType) => type === 'bonus' && subType === 'hit-points');
	const damage = computeDamageOrHealing(damageMatches, spellLevel, level, casting, abilities, 'damage');
	const healing = computeDamageOrHealing(healingMatches, spellLevel, level, casting, abilities, 'healing');

	const limitedUseRule = readRule(record.limitedUse);
	const limitedUse = limitedUseRule ? computeSingleLimitedUse(limitedUseRule, abilities, level) : null;

	return {
		source: entry.source,
		className,
		status: computeStatus(entry, spellLevel),
		usesSlot: record.usesSpellSlot === true,
		limitedUse,
		castingAbility: casting.label,
		castingAbilityReason: casting.reason,
		toHit: toHit.value,
		toHitReason: toHit.reason,
		damage: damage.value,
		damageReason: damage.reason,
		healing: healing.value,
		healingReason: healing.reason,
		saveDc: saveDc.value,
		saveDcReason: saveDc.reason
	};
}

interface SpellGroup {
	level: number;
	concentration: boolean;
	ritual: boolean;
	saveAbility: string | null;
	ways: SpellWay[];
}

export function computeSpells(
	entries: SpellRecordEntry[],
	classes: SpellClassInfo[],
	abilities: AbilityScores,
	level: number,
	modifiers: Modifier[]
): { spells: Spell[]; spellcasting: SpellcastingClassSummary[] } {
	const byName = new Map<string, SpellGroup>();

	for (const entry of entries) {
		const name = spellName(entry.record);
		const way = computeWay(entry, classes, abilities, level, modifiers);

		let group = byName.get(name);
		if (!group) {
			const definition = definitionOf(entry.record);
			const spellLevel = typeof definition.level === 'number' ? definition.level : 0;
			const saveAbilityKey = definition.requiresSavingThrow === true ? abilityFromId(definition.saveDcAbilityId) : undefined;
			group = {
				level: spellLevel,
				concentration: definition.concentration === true,
				ritual: definition.ritual === true,
				saveAbility: saveAbilityKey ? abilityLabel(saveAbilityKey) : null,
				ways: []
			};
			byName.set(name, group);
		}
		group.ways.push(way);
	}

	const spells = [...byName.entries()]
		.map(([name, group]) => ({ name, ...group }))
		.sort((a, b) => a.level - b.level || (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));

	const spellcasting = classes
		.filter((c): c is SpellClassInfo & { ability: AbilityKey } => c.ability !== undefined)
		.map((c) => {
			const spellAttackBlocked = hasBonusSubtypeContaining(modifiers, 'spell-attack');
			const saveDcBlocked = hasBonusSubtypeContaining(modifiers, 'spell-save-dc');
			const mod = abilityModifier(abilities[c.ability]);
			return {
				className: c.name,
				ability: abilityLabel(c.ability),
				spellAttack: spellAttackBlocked ? null : mod + proficiencyBonus(level),
				spellAttackReason: spellAttackBlocked ? 'the character has a spell attack bonus the digest does not model' : null,
				saveDc: saveDcBlocked ? null : 8 + proficiencyBonus(level) + mod,
				saveDcReason: saveDcBlocked ? 'the character has a spell save DC bonus the digest does not model' : null
			};
		});

	return { spells, spellcasting };
}
