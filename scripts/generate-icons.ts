/**
 * Draws the home-screen icons into `static/` from the slate logo: a chalk
 * slate in a wooden frame with a gold star, on the dark base surface.
 *
 * Run by hand with `npm run generate:icons` when the art or the palette
 * changes, and commit the PNGs. The build does not run it, because `sharp`
 * versions can render different PNG bytes from the same SVG.
 */
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import sharp from 'sharp';
import { BASE, PALETTE } from '../src/lib/theme/palette.ts';
import { APPLE_TOUCH_ICON, ICONS } from '../src/lib/install/webmanifest.ts';

const here = dirname(fileURLToPath(import.meta.url));
const background = BASE.surface.dark;

/** Points of a five-point star centred on (cx, cy), its first point straight up. */
function starPoints(cx: number, cy: number, outer: number, inner: number): string {
	return Array.from({ length: 10 }, (_, i) => {
		const radius = i % 2 === 0 ? outer : inner;
		const angle = -Math.PI / 2 + (i * Math.PI) / 5;
		return `${(cx + radius * Math.cos(angle)).toFixed(2)},${(cy + radius * Math.sin(angle)).toFixed(2)}`;
	}).join(' ');
}

/**
 * The logo in a 100 × 100 box. The frame is 72 × 60, so when the box is
 * scaled to 80% its farthest corner stays inside a maskable icon's safe zone.
 * Shapes only, no text, so it renders the same on any machine.
 */
function logoSvg(): string {
	return `<rect x="14" y="20" width="72" height="60" rx="6" fill="${BASE.structural.dark}"/>
	<rect x="21" y="27" width="58" height="46" rx="2" fill="${BASE.raised.dark}"/>
	<polygon points="${starPoints(50, 50, 16, 6.5)}" fill="${PALETTE.sun.deep.dark}"/>`;
}

/** An image of the given size with the logo's box `box` pixels wide, centred. */
function imageSvg(width: number, height: number, box: number): string {
	const x = (width - box) / 2;
	const y = (height - box) / 2;
	return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
	<rect width="${width}" height="${height}" fill="${background}"/>
	<g transform="translate(${x} ${y}) scale(${box / 100})">
	${logoSvg()}
	</g>
</svg>`;
}

/** A maskable icon may be cropped to the centre circle of 80% diameter, so its logo is drawn at 80%. */
const icons = [
	...ICONS.map(({ file, size, purpose }) => ({ file, size, scale: purpose === 'maskable' ? 0.8 : 1 })),
	{ ...APPLE_TOUCH_ICON, scale: 1 }
];

for (const { file, size, scale } of icons) {
	const outPath = resolve(here, '../static', file);
	await sharp(Buffer.from(imageSvg(size, size, size * scale))).png().toFile(outPath);
	console.log(`Wrote ${outPath}`);
}
