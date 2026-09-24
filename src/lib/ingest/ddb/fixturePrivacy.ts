/**
 * Blank the personal fields of a recorded D&D Beyond character response
 * before it is committed as a fixture. A recorded response carries the
 * owner's account, their campaign roster, and their free-text backstory and
 * physical description; the digest reads none of it, so blanking it changes
 * no digest value (design D12, ADR 0010).
 */

const DESCRIPTION_FIELDS = ['gender', 'faith', 'age', 'hair', 'eyes', 'skin', 'height', 'weight'] as const;

function asRecord(value: unknown): Record<string, unknown> | undefined {
	return typeof value === 'object' && value !== null && !Array.isArray(value) ? (value as Record<string, unknown>) : undefined;
}

function blankAllFields(record: Record<string, unknown>): Record<string, unknown> {
	const result: Record<string, unknown> = {};
	for (const key of Object.keys(record)) result[key] = null;
	return result;
}

function blankDecorations(decorations: Record<string, unknown>): Record<string, unknown> {
	const result: Record<string, unknown> = {};
	for (const key of Object.keys(decorations)) {
		if (key === 'themeColor') {
			result[key] = decorations[key];
			continue;
		}
		if (key === 'defaultBackdrop') {
			const inner = asRecord(decorations[key]);
			result[key] = inner ? blankAllFields(inner) : null;
			continue;
		}
		result[key] = null;
	}
	return result;
}

/** Blank a recorded response's personal fields; every other field, including any spell list, is unchanged. */
export function blankFixture(body: unknown): unknown {
	const outer = asRecord(body);
	if (!outer) return body;
	const data = asRecord(outer.data);
	if (!data) return body;

	const blanked: Record<string, unknown> = { ...data, username: '', userId: 0, campaign: null };

	const decorations = asRecord(data.decorations);
	if (decorations) blanked.decorations = blankDecorations(decorations);

	const notes = asRecord(data.notes);
	if (notes) blanked.notes = blankAllFields(notes);

	const traits = asRecord(data.traits);
	if (traits) blanked.traits = blankAllFields(traits);

	for (const field of DESCRIPTION_FIELDS) blanked[field] = null;

	return { ...outer, data: blanked };
}

function findDecorationsIssues(decorations: Record<string, unknown>, path: string): string[] {
	const issues: string[] = [];
	for (const key of Object.keys(decorations)) {
		if (key === 'themeColor') continue;
		const value = decorations[key];
		if (key === 'defaultBackdrop') {
			const inner = asRecord(value);
			if (inner) {
				issues.push(...findAllFieldsIssues(inner, `${path}.${key}`));
			} else if (value !== null) {
				issues.push(`${path}.${key}`);
			}
			continue;
		}
		if (value !== null) issues.push(`${path}.${key}`);
	}
	return issues;
}

function findAllFieldsIssues(record: Record<string, unknown>, path: string): string[] {
	const issues: string[] = [];
	for (const key of Object.keys(record)) {
		if (record[key] !== null) issues.push(`${path}.${key}`);
	}
	return issues;
}

/** List every personal field this response still has set, by name; empty when the response is fully blanked. */
export function findPersonalFields(body: unknown): string[] {
	const outer = asRecord(body);
	if (!outer) return [];
	const data = asRecord(outer.data);
	if (!data) return [];

	const issues: string[] = [];
	if (data.username !== '') issues.push('username');
	if (data.userId !== 0) issues.push('userId');
	if (data.campaign !== null && data.campaign !== undefined) issues.push('campaign');

	const decorations = asRecord(data.decorations);
	if (decorations) issues.push(...findDecorationsIssues(decorations, 'decorations'));

	const notes = asRecord(data.notes);
	if (notes) issues.push(...findAllFieldsIssues(notes, 'notes'));

	const traits = asRecord(data.traits);
	if (traits) issues.push(...findAllFieldsIssues(traits, 'traits'));

	for (const field of DESCRIPTION_FIELDS) {
		if (data[field] !== null && data[field] !== undefined) issues.push(field);
	}

	return issues;
}
