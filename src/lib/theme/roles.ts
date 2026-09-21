import { PALETTE_NAMES, type PaletteName } from './palette';

/** The four fixed color roles: each resolves to one palette name for every character. */
export type ColorRole = 'health' | 'armor' | 'speed' | 'initiative';

/** Mapping from each role to its palette name. */
export const ROLE_PALETTE: Record<ColorRole, PaletteName> = {
	health: 'fire',
	armor: 'ocean',
	speed: 'forest',
	initiative: 'sun'
};

/**
 * The authored labels each combat role answers to.
 * Health has no labels — hit points arrive via a structured field.
 * Each label appears in at most one role's list; matching ignores case
 * and leading/trailing whitespace.
 */
const ROLE_LABELS: Record<Exclude<ColorRole, 'health'>, readonly string[]> = {
	armor: ['armor class', 'armour class', 'ac'],
	speed: ['speed'],
	initiative: ['initiative']
};

/**
 * Resolve an authored combat label to the palette name for that entry.
 * Returns the role's palette when the label matches, or the fallback
 * (the character's palette) when no role claims it.
 */
export function resolveCombatPalette(label: string, fallback: PaletteName): PaletteName {
	const normalized = label.trim().toLowerCase();
	for (const [role, labels] of Object.entries(ROLE_LABELS) as [
		Exclude<ColorRole, 'health'>,
		readonly string[]
	][]) {
		if (labels.includes(normalized)) {
			return ROLE_PALETTE[role];
		}
	}
	return fallback;
}

// Re-export for convenience
export { PALETTE_NAMES };
