/**
 * WCAG 2.1 relative-contrast math over opaque sRGB `#rrggbb` colors.
 *
 * Used both to check the typed palette values and to re-check the values
 * emitted to `palette.css`, so the shipped stylesheet cannot pass with a pair
 * that drops below the readable minimum.
 */

/** The WCAG AA minimum contrast ratio for normal-size text. */
export const WCAG_AA = 4.5;

/** Parse an opaque `#rrggbb` string into its three 0–255 channels. */
function channels(hex: string): [number, number, number] {
	const match = /^#([0-9a-fA-F]{6})$/.exec(hex.trim());
	if (!match) {
		throw new Error(`not an opaque #rrggbb color: ${hex}`);
	}
	const n = parseInt(match[1], 16);
	return [(n >> 16) & 0xff, (n >> 8) & 0xff, n & 0xff];
}

/** Linearize one 0–255 sRGB channel per the WCAG formula. */
function linearize(value: number): number {
	const c = value / 255;
	return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

/** The WCAG relative luminance of an opaque `#rrggbb` color. */
export function relativeLuminance(hex: string): number {
	const [r, g, b] = channels(hex);
	return 0.2126 * linearize(r) + 0.7152 * linearize(g) + 0.0722 * linearize(b);
}

/**
 * The WCAG contrast ratio between two opaque colors, from 1:1 to 21:1. Order
 * does not matter: the lighter color is always the numerator.
 */
export function contrastRatio(a: string, b: string): number {
	const la = relativeLuminance(a);
	const lb = relativeLuminance(b);
	const lighter = Math.max(la, lb);
	const darker = Math.min(la, lb);
	return (lighter + 0.05) / (darker + 0.05);
}
