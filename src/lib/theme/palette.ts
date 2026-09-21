/**
 * The single source of truth for every theme color value.
 *
 * The resolver, the contrast test, and the generated `palette.css` all trace
 * back to this module, so a name and its values can never drift apart. CSS
 * cannot import a TypeScript module, so the stylesheet is generated from here
 * (see `generate.ts`) rather than hand-written.
 *
 * Every value is an opaque sRGB color written as `#rrggbb`. One canonical
 * format keeps the computed contrast ratio equal to what the browser paints.
 * No value carries an alpha channel.
 */

/** The device color scheme a value belongs to. */
export type Mode = 'light' | 'dark';

/** A color with a value for each mode. */
export interface ModePair {
	light: string;
	dark: string;
}

/** One palette name's accent and the text/icon color drawn on it. */
export interface Palette {
	/** The header background color. */
	accent: ModePair;
	/** The color of text or icons drawn on the accent; the contrast-checked pairing. */
	onAccent: ModePair;
	/** A soft background wash drawn on the raised surface. */
	tint: ModePair;
	/** The family color used as text, icon, or border on any surface or on the tint. */
	deep: ModePair;
}

/** The base colors shared across all characters: page, cards, and text. */
export interface Base {
	/** The page background. */
	surface: ModePair;
	/** The background of cards and tiles, drawn on the surface. */
	raised: ModePair;
	/** The default body text color. */
	foreground: ModePair;
	/** Secondary text, such as labels and raw scores. */
	muted: ModePair;
	/** A warm shared color for tile borders and secondary labels. */
	structural: ModePair;
}

/**
 * The complete set of palette names, in canonical order. `neutral` is the
 * default a character falls back to. The resolver imports this list, so it
 * accepts exactly the names the stylesheet defines.
 */
export const PALETTE_NAMES = ['forest', 'fire', 'ocean', 'berry', 'sun', 'neutral'] as const;

/** A name in the fixed palette set. */
export type PaletteName = (typeof PALETTE_NAMES)[number];

/**
 * Each palette's accent/on-accent pair for both modes. The light pair pairs a
 * dark accent with white text; the dark pair pairs a light accent with dark
 * text. Every pair meets WCAG AA (4.5:1); the contrast test enforces it.
 */
export const PALETTE: Record<PaletteName, Palette> = {
	forest: {
		accent: { light: '#2f5d3a', dark: '#7fd8a0' },
		onAccent: { light: '#ffffff', dark: '#06301a' },
		tint: { light: '#cfe3bf', dark: '#2c4636' },
		deep: { light: '#2f5d3a', dark: '#7fd8a0' }
	},
	fire: {
		accent: { light: '#c0392b', dark: '#ff9f8a' },
		onAccent: { light: '#ffffff', dark: '#3a0d06' },
		tint: { light: '#fbe2df', dark: '#4a2f2a' },
		deep: { light: '#a8342e', dark: '#ff9f8a' }
	},
	ocean: {
		accent: { light: '#2d79a6', dark: '#8fc4ff' },
		onAccent: { light: '#ffffff', dark: '#062146' },
		tint: { light: '#d8e9f1', dark: '#2b3c4f' },
		deep: { light: '#1f5d80', dark: '#8fc4ff' }
	},
	berry: {
		accent: { light: '#b5356a', dark: '#f0a6d0' },
		onAccent: { light: '#ffffff', dark: '#3d0a29' },
		tint: { light: '#f8dcea', dark: '#46303e' },
		deep: { light: '#8e2953', dark: '#f0a6d0' }
	},
	sun: {
		accent: { light: '#e9a23b', dark: '#ffd86b' },
		onAccent: { light: '#3a2905', dark: '#3a2905' },
		tint: { light: '#f5e5c9', dark: '#453a24' },
		deep: { light: '#7d5010', dark: '#ffd86b' }
	},
	neutral: {
		accent: { light: '#4a4a42', dark: '#c9d1d9' },
		onAccent: { light: '#ffffff', dark: '#14171a' },
		tint: { light: '#e8e3d6', dark: '#383d42' },
		deep: { light: '#4a4a42', dark: '#c9d1d9' }
	}
};

/**
 * The shared base colors, independent of the accent palette. In each mode the
 * foreground and the muted text meet 4.5:1 on both the surface and the raised
 * surface, and every accent meets 4.5:1 on both; the contrast tests enforce it.
 */
export const BASE: Base = {
	surface: { light: '#f7f2e8', dark: '#14171a' },
	raised: { light: '#ffffff', dark: '#1e2327' },
	foreground: { light: '#1a1d21', dark: '#e6e9ec' },
	muted: { light: '#5c5a55', dark: '#a9b0b8' },
	structural: { light: '#6b4a2b', dark: '#b9a68a' }
};

/** The palette a bad or missing color falls back to. */
export const DEFAULT_PALETTE: PaletteName = 'neutral';
