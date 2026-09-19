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
}

/** The base pair shared across all characters: the page background and body text. */
export interface Base {
	/** The page background. */
	surface: ModePair;
	/** The default body text color. */
	foreground: ModePair;
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
		accent: { light: '#1b7f43', dark: '#7fd8a0' },
		onAccent: { light: '#ffffff', dark: '#06301a' }
	},
	fire: {
		accent: { light: '#c0392b', dark: '#ff9f8a' },
		onAccent: { light: '#ffffff', dark: '#3a0d06' }
	},
	ocean: {
		accent: { light: '#1a66d6', dark: '#8fc4ff' },
		onAccent: { light: '#ffffff', dark: '#062146' }
	},
	berry: {
		accent: { light: '#a83278', dark: '#f0a6d0' },
		onAccent: { light: '#ffffff', dark: '#3d0a29' }
	},
	sun: {
		accent: { light: '#8a5a12', dark: '#ffd86b' },
		onAccent: { light: '#ffffff', dark: '#3a2905' }
	},
	neutral: {
		accent: { light: '#444b53', dark: '#c9d1d9' },
		onAccent: { light: '#ffffff', dark: '#14171a' }
	}
};

/**
 * The shared surface and foreground, independent of the accent palette. The
 * foreground meets 4.5:1 against the surface in each mode; the contrast test
 * enforces it.
 */
export const BASE: Base = {
	surface: { light: '#ffffff', dark: '#14171a' },
	foreground: { light: '#1a1d21', dark: '#e6e9ec' }
};

/** The palette a bad or missing color falls back to. */
export const DEFAULT_PALETTE: PaletteName = 'neutral';
