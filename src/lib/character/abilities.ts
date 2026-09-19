/**
 * Resolve the loosely-typed `abilities` field into a render-ready list.
 *
 * Follows the domain-resolver pattern: coerce authored data, fall back safely,
 * never throw. Each valid entry (see `validEntries`) becomes a `ResolvedAbility`
 * with its label, a display modifier (computed or authored, see `abilityModifier`),
 * and its raw score — only when the authored `value` is a finite number, otherwise
 * `null`.
 */
import { validEntries } from './entries';
import { abilityModifier } from './modifier';

export interface ResolvedAbility {
	/** The authored label, rendered as text. */
	label: string;
	/** The display modifier: signed computed value, authored override, or "—". */
	modifier: string;
	/** The raw score when the authored value is a finite number; otherwise null. */
	score: number | null;
}

/** Resolve `abilities` into an ordered list of render-ready entries. */
export function resolveAbilities(input: unknown): ResolvedAbility[] {
	return validEntries(input).map((entry) => ({
		label: entry.label,
		modifier: abilityModifier(entry.value, entry.modifier),
		score: typeof entry.value === 'number' && Number.isFinite(entry.value) ? entry.value : null
	}));
}
