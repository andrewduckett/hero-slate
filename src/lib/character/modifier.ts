/**
 * Display an ability modifier from an authored score and optional override.
 *
 * Mirrors the domain-resolver pattern (see `theme/resolve.ts`): read
 * loosely-typed authored data, coerce it, fall back safely, never throw.
 *
 * - A usable authored `modifier` — a string with at least one non-whitespace
 *   character — is shown verbatim, overriding the computed value.
 * - Otherwise a finite numeric `value` yields `floor((value - 10) / 2)`, flooring
 *   toward negative infinity, displayed signed ("+" for zero or positive).
 * - With no finite value and no usable modifier, it shows an em dash ("—").
 */
const DASH = '—';

export function abilityModifier(value: unknown, modifier?: unknown): string {
	if (typeof modifier === 'string' && modifier.trim().length > 0) {
		return modifier;
	}

	if (typeof value === 'number' && Number.isFinite(value)) {
		const mod = Math.floor((value - 10) / 2);
		return mod >= 0 ? `+${mod}` : String(mod);
	}

	return DASH;
}
