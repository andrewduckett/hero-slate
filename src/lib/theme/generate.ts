/**
 * Generates `palette.css` from the typed `palette.ts` module.
 *
 * `palette.css` is build output, never hand-edited. The generator emits:
 * - `:root` light tokens for the base colors (surface, raised, foreground,
 *   muted), and applies the surface and foreground to the page background and
 *   body text.
 * - a `[data-palette="<name>"]` rule per name mapping `--accent`/`--on-accent`
 *   to that name's light values.
 * - a `@media (prefers-color-scheme: dark)` block that overrides all of the
 *   above with the dark values, so mode switching stays pure CSS.
 *
 * The output is deterministic: a match test regenerates it and asserts the
 * committed file is identical, so a stale copy fails CI.
 */
import { PALETTE, PALETTE_NAMES, BASE } from './palette.ts';

/** A marker line so no one mistakes the emitted file for a source of truth. */
const HEADER = `/* Generated from src/lib/theme/palette.ts by src/lib/theme/generate.ts. Do not edit by hand. */`;

/** Emit the base tokens and their application to the page, for one mode. */
function baseRule(mode: 'light' | 'dark'): string {
	return [
		`\t--surface: ${BASE.surface[mode]};`,
		`\t--raised: ${BASE.raised[mode]};`,
		`\t--foreground: ${BASE.foreground[mode]};`,
		`\t--muted: ${BASE.muted[mode]};`,
		`\t--structural: ${BASE.structural[mode]};`
	].join('\n');
}

/** Emit a single `[data-palette="<name>"]` rule for one mode. */
function paletteRule(name: (typeof PALETTE_NAMES)[number], mode: 'light' | 'dark'): string {
	const p = PALETTE[name];
	return [
		`[data-palette="${name}"] {`,
		`\t--accent: ${p.accent[mode]};`,
		`\t--on-accent: ${p.onAccent[mode]};`,
		`\t--tint: ${p.tint[mode]};`,
		`\t--deep: ${p.deep[mode]};`,
		`}`
	].join('\n');
}

/** Build the full stylesheet as a deterministic string. */
export function generatePaletteCss(): string {
	const lightAccents = PALETTE_NAMES.map((name) => paletteRule(name, 'light')).join('\n\n');

	const darkAccents = PALETTE_NAMES.map((name) =>
		paletteRule(name, 'dark')
			.split('\n')
			.map((line) => `\t${line}`)
			.join('\n')
	).join('\n\n');

	const root = [
		`:root {`,
		`\tcolor-scheme: light dark;`,
		baseRule('light'),
		`\tbackground-color: var(--surface);`,
		`\tcolor: var(--foreground);`,
		`}`
	].join('\n');

	const dark = [
		`@media (prefers-color-scheme: dark) {`,
		`\t:root {`,
		baseRule('dark')
			.split('\n')
			.map((line) => `\t${line}`)
			.join('\n'),
		`\t}`,
		``,
		darkAccents,
		`}`
	].join('\n');

	return [HEADER, ``, root, ``, lightAccents, ``, dark, ``].join('\n');
}
