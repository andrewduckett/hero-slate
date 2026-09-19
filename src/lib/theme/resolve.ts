/**
 * Resolves a character's authored `color` to a known palette name.
 *
 * The provider has already rejected a non-string `color` as `invalid`, so this
 * only ever sees a string or `undefined`. It returns the name only on an exact
 * match against the fixed set; anything else — an unknown name, an empty or
 * whitespace string, a different case, a raw `#rrggbb` or `rgb(...)` value, or
 * `undefined` — resolves to `neutral`. So no unmatched value ever reaches the
 * `data-palette` attribute, and a raw color is never honored as a color.
 */
import { PALETTE_NAMES, DEFAULT_PALETTE, type PaletteName } from './palette';

const KNOWN = new Set<string>(PALETTE_NAMES);

/** Resolve an authored color to a palette name, falling back to `neutral`. */
export function resolvePalette(name: string | undefined): PaletteName {
	if (name !== undefined && KNOWN.has(name)) {
		return name as PaletteName;
	}
	return DEFAULT_PALETTE;
}
