import { resolvePalette } from '$lib/theme/resolve';
import type { PaletteName } from '$lib/theme/palette';

export interface ResolvedRow {
	title?: string;
	body: string;
	palette: PaletteName;
}

export interface ResolvedSection {
	title: string;
	palette: PaletteName;
	rows: ResolvedRow[];
}

function isPlainObject(v: unknown): v is Record<string, unknown> {
	return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function ownString(obj: Record<string, unknown>, key: string): string | undefined {
	if (!Object.hasOwn(obj, key)) return undefined;
	const val = obj[key];
	return typeof val === 'string' ? val : undefined;
}

function resolveRows(rows: unknown, sectionPalette: PaletteName): ResolvedRow[] {
	if (!Array.isArray(rows)) return [];
	return rows.flatMap((row) => {
		if (!isPlainObject(row)) return [];
		const body = ownString(row, 'body');
		if (!body || body.length === 0) return [];
		const rawColor = ownString(row, 'color');
		const palette = rawColor !== undefined ? resolvePalette(rawColor) : sectionPalette;
		const title = ownString(row, 'title');
		const resolved: ResolvedRow = { body, palette };
		if (title && title.length > 0) resolved.title = title;
		return [resolved];
	});
}

export function resolveSections(sections: unknown): ResolvedSection[] {
	if (!Array.isArray(sections)) return [];
	return sections.flatMap((section) => {
		if (!isPlainObject(section)) return [];
		const title = ownString(section, 'title');
		if (!title || title.length === 0) return [];
		const rawColor = ownString(section, 'color');
		const palette = resolvePalette(rawColor);
		const rawRows = Object.hasOwn(section, 'rows') ? section['rows'] : undefined;
		const rows = resolveRows(rawRows, palette);
		if (rows.length === 0) return [];
		return [{ title, palette, rows }];
	});
}
