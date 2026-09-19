/**
 * Resolve a character's hit points from the authored `hitPoints` data and the
 * stored current value.
 *
 * Follows the domain-resolver pattern: coerce loosely-typed data, fall back
 * safely, never throw. The definition supplies `max`; the current value is store
 * state, never read from the file. `max` counts only when it is an integer
 * greater than 0 — otherwise the character has no hit points to track and this
 * returns `null`. A stored current counts only when it is a finite integer, and
 * is then clamped to `0..max`; anything else starts the character at `max`.
 *
 * The store keeps `current` opaque, so this layer owns every reconciliation rule.
 */

export interface ResolvedHitPoints {
	/** Current hit points, clamped to `0..max`. */
	current: number;
	/** Maximum hit points, an integer greater than 0. */
	max: number;
}

/** Read `max` only when it is an integer greater than 0; otherwise `null`. */
function readMax(hitPoints: unknown): number | null {
	if (typeof hitPoints !== 'object' || hitPoints === null || Array.isArray(hitPoints)) {
		return null;
	}
	const max = (hitPoints as Record<string, unknown>).max;
	if (typeof max === 'number' && Number.isInteger(max) && max > 0) {
		return max;
	}
	return null;
}

/**
 * Resolve hit points, or `null` when the character has none to track. `stored` is
 * the value read from the state store under the "hp" key.
 */
export function resolveHitPoints(hitPoints: unknown, stored: unknown): ResolvedHitPoints | null {
	const max = readMax(hitPoints);
	if (max === null) {
		return null;
	}
	if (typeof stored === 'number' && Number.isInteger(stored)) {
		return { current: Math.min(max, Math.max(0, stored)), max };
	}
	return { current: max, max };
}
