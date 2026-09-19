/**
 * Extract the valid entries from a loosely-typed `abilities` or `combat` field.
 *
 * A valid entry is a non-array object whose `label` is a string with at least one
 * non-whitespace character. Every other list member — `null`, a boolean, a number,
 * a string, an array, or an object with a missing, empty, whitespace-only, or
 * non-string label — is dropped. Valid entries keep their authored order and are
 * never deduplicated. Nested objects and arrays are never scanned or stringified.
 * A non-list input yields an empty list. Reading never throws.
 */

/** A list member that qualifies as a valid stat entry. */
export interface RawEntry {
	label: string;
	value?: unknown;
	modifier?: unknown;
	[key: string]: unknown;
}

function isValidEntry(member: unknown): member is RawEntry {
	if (typeof member !== 'object' || member === null || Array.isArray(member)) {
		return false;
	}
	const label = (member as Record<string, unknown>).label;
	return typeof label === 'string' && label.trim().length > 0;
}

/** Return the valid entries from a loosely-typed list, in authored order. */
export function validEntries(input: unknown): RawEntry[] {
	if (!Array.isArray(input)) {
		return [];
	}
	return input.filter(isValidEntry);
}
