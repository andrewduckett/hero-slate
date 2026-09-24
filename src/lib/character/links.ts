import { resolvePalette } from '$lib/theme/resolve';
import type { PaletteName } from '$lib/theme/palette';

export interface ResolvedLink {
	href: string;
	label: string;
	palette: PaletteName;
}

function isPlainObject(v: unknown): v is Record<string, unknown> {
	return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function ownString(obj: Record<string, unknown>, key: string): string | undefined {
	if (!Object.hasOwn(obj, key)) return undefined;
	const val = obj[key];
	return typeof val === 'string' ? val : undefined;
}

export function resolveLinks(links: unknown, characterPalette: PaletteName): ResolvedLink[] {
	if (!Array.isArray(links)) return [];
	return links.flatMap((entry) => {
		if (!isPlainObject(entry)) return [];
		const url = ownString(entry, 'url');
		if (!url) return [];

		let parsed: URL;
		try {
			parsed = new URL(url);
		} catch {
			return [];
		}
		if (parsed.protocol !== 'https:') return [];
		if (parsed.username !== '' || parsed.password !== '') return [];

		const rawLabel = ownString(entry, 'label')?.trim();
		const label = rawLabel && rawLabel.length > 0 ? rawLabel : parsed.hostname;

		const rawColor = ownString(entry, 'color');
		const palette = rawColor !== undefined ? resolvePalette(rawColor) : characterPalette;

		return [{ href: parsed.href, label, palette }];
	});
}
