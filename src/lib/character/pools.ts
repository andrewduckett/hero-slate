/** The most dots a pool may show; Lay On Hands reaches 100 at level 20. */
export const MAX_POOL_DOTS = 100;

export interface ResolvedPool {
	id: string;
	label: string;
	color?: string;
	max: number;
	current: number;
}

export function resolvePools(pools: unknown, _stored: unknown): ResolvedPool[] {
	if (!Array.isArray(pools)) return [];
	const ids = new Set<string>();
	const stored = isMap(_stored) ? _stored : null;

	return pools.flatMap((pool) => {
		if (typeof pool !== 'object' || pool === null || Array.isArray(pool)) return [];
		const { id, label, color, max } = pool as Record<string, unknown>;
		if (typeof id !== 'string' || id.length === 0) return [];
		if (typeof label !== 'string' || label.trim().length === 0) return [];
		if (typeof max !== 'number' || !Number.isInteger(max) || max < 1 || max > MAX_POOL_DOTS) return [];
		if (color !== undefined && typeof color !== 'string') return [];
		if (ids.has(id)) return [];
		ids.add(id);
		const value = stored !== null && Object.hasOwn(stored, id) ? stored[id] : undefined;
		const current = typeof value === 'number' && Number.isInteger(value) ? Math.min(max, Math.max(0, value)) : max;
		return [{ id, label, color, max, current }];
	});
}

function isMap(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
}
