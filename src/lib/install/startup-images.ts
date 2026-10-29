/**
 * The iPad startup images: one per screen of every iPad on sale, in each
 * orientation. `scripts/generate-icons.ts` draws them, `src/app.html` links
 * them, and the tests check both against this list.
 *
 * iPad shows a startup image only when its link's media query matches the
 * screen exactly, so a screen missing here shows a plain screen instead.
 */

export interface StartupScreen {
	name: string;
	/** Portrait width and height in points. */
	width: number;
	height: number;
	pixelRatio: number;
}

export interface StartupImage {
	file: string;
	/** Width and height in pixels, swapped in landscape. */
	width: number;
	height: number;
	orientation: 'portrait' | 'landscape';
	media: string;
}

export const STARTUP_SCREENS: readonly StartupScreen[] = [
	{ name: 'iPad mini 8.3"', width: 744, height: 1133, pixelRatio: 2 },
	{ name: 'iPad, iPad Air 11"', width: 820, height: 1180, pixelRatio: 2 },
	{ name: 'iPad Pro 11"', width: 834, height: 1210, pixelRatio: 2 },
	{ name: 'iPad Air 13"', width: 1024, height: 1366, pixelRatio: 2 },
	{ name: 'iPad Pro 13"', width: 1032, height: 1376, pixelRatio: 2 }
];

function startupImage(screen: StartupScreen, orientation: StartupImage['orientation']): StartupImage {
	const short = screen.width * screen.pixelRatio;
	const long = screen.height * screen.pixelRatio;
	const [width, height] = orientation === 'portrait' ? [short, long] : [long, short];
	// iPad reports the portrait points as device-width and device-height in both orientations.
	const media =
		`(device-width: ${screen.width}px) and (device-height: ${screen.height}px)` +
		` and (-webkit-device-pixel-ratio: ${screen.pixelRatio}) and (orientation: ${orientation})`;
	return { file: `startup/${width}x${height}.png`, width, height, orientation, media };
}

export const STARTUP_IMAGES: readonly StartupImage[] = STARTUP_SCREENS.flatMap((screen) => [
	startupImage(screen, 'portrait'),
	startupImage(screen, 'landscape')
]);
