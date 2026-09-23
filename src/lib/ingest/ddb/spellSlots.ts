/**
 * Compute spell slots and Pact Magic from each class's own slot table.
 * D&D Beyond's `spellSlots` field does not hold the slot count (Zip's
 * Wizard shows 0 there at every level); the real count lives in the class
 * definition's `spellRules.levelSpellSlots`, indexed by class level. A class
 * counts as a spellcaster only when D&D Beyond marks its class or subclass
 * `canCastSpells` — Urven's Monk carries a slot table it can never use.
 */

export interface SpellSlotEntry {
	level: number;
	slots: number;
}

/** One class's spellcasting shape, already read and type-checked by `digest.ts`. */
export interface SpellcastingClassInput {
	name: string;
	level: number;
	canCastSpells: boolean;
	slotTable: unknown;
	subclassCanCastSpells: boolean;
	subclassSlotTable: unknown;
}

export interface SpellSlotsResult {
	spellSlots: SpellSlotEntry[] | null;
	spellSlotsReason: string | null;
}

export interface PactMagicResult {
	pactMagic: SpellSlotEntry | null;
	pactMagicReason: string | null;
}

const WARLOCK = 'Warlock';

function isSpellcaster(c: SpellcastingClassInput): boolean {
	return c.canCastSpells || c.subclassCanCastSpells;
}

/** The slot table that can actually cast: the class's own table when it can cast, else the subclass's. */
function ownTable(c: SpellcastingClassInput): unknown {
	return c.canCastSpells ? c.slotTable : c.subclassSlotTable;
}

/** A row of numeric slot counts, one per spell level, or `undefined` when the table or row is unreadable. */
function readRow(table: unknown, level: number): number[] | undefined {
	if (!Array.isArray(table)) return undefined;
	const row = table[level];
	if (!Array.isArray(row) || row.length === 0) return undefined;
	if (!row.every((n) => typeof n === 'number' && Number.isFinite(n))) return undefined;
	return row as number[];
}

function slotEntries(row: number[]): SpellSlotEntry[] {
	const entries: SpellSlotEntry[] = [];
	row.forEach((slots, index) => {
		if (slots > 0) entries.push({ level: index + 1, slots });
	});
	return entries;
}

export function computeSpellSlots(classes: SpellcastingClassInput[]): SpellSlotsResult {
	const casters = classes.filter((c) => c.name !== WARLOCK && isSpellcaster(c));

	if (casters.length === 0) {
		return { spellSlots: [], spellSlotsReason: null };
	}
	if (casters.length > 1) {
		return { spellSlots: null, spellSlotsReason: 'multiclass slots are not computed' };
	}

	const [caster] = casters;
	const row = readRow(ownTable(caster), caster.level);
	if (row === undefined) {
		return {
			spellSlots: null,
			spellSlotsReason: `${caster.name} has no readable spell-slot row at level ${caster.level}`
		};
	}

	return { spellSlots: slotEntries(row), spellSlotsReason: null };
}

export function computePactMagic(classes: SpellcastingClassInput[]): PactMagicResult {
	const warlock = classes.find((c) => c.name === WARLOCK && c.canCastSpells);
	if (!warlock) {
		return { pactMagic: null, pactMagicReason: null };
	}

	const row = readRow(warlock.slotTable, warlock.level);
	const levelsWithSlots = row?.map((slots, index) => ({ level: index + 1, slots })).filter((e) => e.slots > 0);

	if (levelsWithSlots?.length === 1) {
		return { pactMagic: levelsWithSlots[0], pactMagicReason: null };
	}

	return { pactMagic: null, pactMagicReason: "the digest cannot read the Warlock's pact slots" };
}
