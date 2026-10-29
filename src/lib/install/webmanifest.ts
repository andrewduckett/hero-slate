/**
 * Builds the web app manifest from the typed palette, so its colours cannot
 * drift from the theme. `scripts/generate-webmanifest.ts` writes the result to
 * `static/manifest.webmanifest`.
 *
 * It sets no `start_url`, `id` or `scope` on purpose: a device then opens an
 * installed icon at the page it was added from, so an icon added from a sheet
 * opens that character.
 */
import { BASE } from '../theme/palette.ts';

export interface WebManifestIcon {
	src: string;
	sizes: string;
	type: 'image/png';
	purpose: 'any' | 'maskable';
}

export interface WebManifest {
	name: string;
	short_name: string;
	display: 'standalone';
	theme_color: string;
	background_color: string;
	icons: WebManifestIcon[];
}

export const APP_NAME = 'Hero Slate';

/** Every home-screen icon the site ships, with its pixel size. */
export const ICONS = [
	{ file: 'icon-192.png', size: 192, purpose: 'any' },
	{ file: 'icon-512.png', size: 512, purpose: 'any' },
	{ file: 'icon-512-maskable.png', size: 512, purpose: 'maskable' }
] as const;

export const APPLE_TOUCH_ICON = { file: 'apple-touch-icon.png', size: 180 } as const;

export function buildWebManifest(): WebManifest {
	return {
		name: APP_NAME,
		short_name: APP_NAME,
		display: 'standalone',
		// Dark is the resting default before any page script runs.
		theme_color: BASE.surface.dark,
		background_color: BASE.surface.dark,
		icons: ICONS.map(({ file, size, purpose }) => ({
			src: `/${file}`,
			sizes: `${size}x${size}`,
			type: 'image/png',
			purpose
		}))
	};
}

/** The exact text of `static/manifest.webmanifest`. */
export function renderWebManifest(): string {
	return `${JSON.stringify(buildWebManifest(), null, '\t')}\n`;
}
