/**
 * Draws the placeholder home-screen icons into `static/`: bold "HS" in the
 * neutral palette's light on-accent, on its light accent.
 *
 * Run by hand with `npm run generate:icons` when the art or the palette
 * changes, and commit the PNGs. The build does not run it, because `sharp`
 * versions can render different PNG bytes from the same SVG.
 */
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import sharp from 'sharp';
import { PALETTE } from '../src/lib/theme/palette.ts';
import { APPLE_TOUCH_ICON, ICONS } from '../src/lib/install/webmanifest.ts';

const here = dirname(fileURLToPath(import.meta.url));
const { accent, onAccent } = PALETTE.neutral;

/**
 * A maskable icon may be cropped to any shape that holds the centre circle of
 * 80% diameter, so its letters are drawn smaller to stay inside that circle.
 */
function iconSvg(size: number, maskable: boolean): string {
	const fontSize = size * (maskable ? 0.3 : 0.42);
	return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
	<rect width="${size}" height="${size}" fill="${accent.light}"/>
	<text x="50%" y="50%" dominant-baseline="central" text-anchor="middle"
		font-family="sans-serif" font-weight="700" font-size="${fontSize}"
		fill="${onAccent.light}">HS</text>
</svg>`;
}

const targets = [
	...ICONS.map(({ file, size, purpose }) => ({ file, size, maskable: purpose === 'maskable' })),
	{ ...APPLE_TOUCH_ICON, maskable: false }
];

for (const { file, size, maskable } of targets) {
	const outPath = resolve(here, '../static', file);
	await sharp(Buffer.from(iconSvg(size, maskable))).png().toFile(outPath);
	console.log(`Wrote ${outPath}`);
}
