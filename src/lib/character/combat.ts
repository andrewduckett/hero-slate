/**
 * Resolve the loosely-typed `combat` field into a render-ready list.
 *
 * Follows the domain-resolver pattern: coerce authored data, fall back safely,
 * never throw. Each valid entry (see `validEntries`) becomes a `ResolvedCombat`
 * with its label and a display value. A string value renders verbatim; a finite
 * number renders as its parsed value; anything else — missing, `null`, a boolean,
 * a non-finite number, an array, or an object — shows an em dash ("—"). Any
 * `modifier` field on a combat entry is ignored: combat values are shown plainly.
 */
import { validEntries } from './entries';

const DASH = '—';

export interface ResolvedCombat {
	/** The authored label, rendered as text. */
	label: string;
	/** The display value: a string verbatim, a finite number's value, or "—". */
	value: string;
}

function combatValue(value: unknown): string {
	if (typeof value === 'string') {
		return value;
	}
	if (typeof value === 'number' && Number.isFinite(value)) {
		return String(value);
	}
	return DASH;
}

/** Resolve `combat` into an ordered list of render-ready entries. */
export function resolveCombat(input: unknown): ResolvedCombat[] {
	return validEntries(input).map((entry) => ({
		label: entry.label,
		value: combatValue(entry.value)
	}));
}
