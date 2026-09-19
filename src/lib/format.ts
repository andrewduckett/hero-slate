/**
 * Build a character's descriptor line from level and class.
 *
 * Pure and missing-field-proof:
 * - Prefixes level with "Level " only when level is a finite number.
 * - Prints class as authored (no case change) when it is a non-empty string.
 * - Joins the present parts with a single space.
 * - Returns "" when neither part is present.
 * - Never throws on a missing, null, or wrong-typed field.
 */
export function formatIdentity(input: { level?: unknown; class?: unknown } | null | undefined): string {
	const source = input ?? {};

	const level = source.level;
	const klass = source.class;

	const parts: string[] = [];

	if (typeof level === 'number' && Number.isFinite(level)) {
		parts.push(`Level ${level}`);
	}

	if (typeof klass === 'string' && klass.length > 0) {
		parts.push(klass);
	}

	return parts.join(' ');
}
