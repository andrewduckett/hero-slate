/**
 * Compare a saved character file with an edited draft, for the edit-mode
 * preview: the change list, and the warnings for silent losses an edit can
 * cause (see design.md, D-5 and D-6).
 */

type Mapping = Record<string, unknown>;

function isMapping(value: unknown): value is Mapping {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function deepEqual(a: unknown, b: unknown): boolean {
	if (a === b) return true;
	if (Array.isArray(a) && Array.isArray(b)) {
		return a.length === b.length && a.every((item, i) => deepEqual(item, b[i]));
	}
	if (isMapping(a) && isMapping(b)) {
		const keys = Object.keys(a);
		return keys.length === Object.keys(b).length && keys.every((key) => key in b && deepEqual(a[key], b[key]));
	}
	return false;
}

/** A value as the Author wrote it: a string in double quotes, a number or boolean bare, anything else as one-line JSON. */
function show(value: unknown): string {
	return JSON.stringify(value) ?? String(value);
}

/** Keys of both mappings: the saved file's in its order, then the draft's new ones in theirs. */
function unionKeys(saved: Mapping, draft: Mapping): string[] {
	return [...Object.keys(saved), ...Object.keys(draft).filter((key) => !(key in saved))];
}

function compareField(name: string, saved: Mapping, draft: Mapping, key: string): string[] {
	if (!(key in draft)) return [`removed ${name}: ${show(saved[key])}`];
	if (!(key in saved)) return [`added ${name}: ${show(draft[key])}`];
	if (deepEqual(saved[key], draft[key])) return [];
	return [`changed ${name}: ${show(saved[key])} → ${show(draft[key])}`];
}

export function listChanges(saved: Mapping, draft: Mapping): string[] {
	const lines: string[] = [];
	for (const key of unionKeys(saved, draft)) {
		const savedValue = saved[key];
		const draftValue = draft[key];
		if (key === 'hitPoints' && isMapping(savedValue) && isMapping(draftValue)) {
			for (const field of unionKeys(savedValue, draftValue)) {
				lines.push(...compareField(`hitPoints.${field}`, savedValue, draftValue, field));
			}
		} else {
			lines.push(...compareField(key, saved, draft, key));
		}
	}
	if (lines.length === 0) lines.push('No changes');
	return lines.map((line) => `  - ${line}`);
}
