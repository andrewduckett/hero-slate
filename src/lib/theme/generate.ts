/**
 * Generates `palette.css` from the typed `palette.ts` module.
 *
 * `palette.css` is build output, never hand-edited. The generator emits four
 * contexts so each mode is reachable two ways — device media query and an
 * explicit `data-theme` choice:
 *
 * 1. `:root` dark base (no media, no data-theme) — dark is the resting default.
 * 2. `@media (prefers-color-scheme: light)` — light values for a device that
 *    prefers light.
 * 3. `:root[data-theme="dark"]` / `[data-palette]` — explicit dark choice.
 * 4. `:root[data-theme="light"]` / `[data-palette]` — explicit light choice.
 *
 * Each context sets `color-scheme` so native controls match.
 * The choice selectors have higher specificity than the media-query selectors,
 * so the choice always wins whatever the device prefers.
 *
 * The output is deterministic: a match test regenerates it and asserts the
 * committed file is identical, so a stale copy fails CI.
 */
import { PALETTE, PALETTE_NAMES, BASE } from './palette.ts';

/** A marker line so no one mistakes the emitted file for a source of truth. */
const HEADER = `/* Generated from src/lib/theme/palette.ts by src/lib/theme/generate.ts. Do not edit by hand. */`;

/** Emit the base tokens for one mode (no application rules). */
function baseTokens(mode: 'light' | 'dark'): string {
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

/** Indent every line of a block by one tab. */
function indent(text: string): string {
	return text
		.split('\n')
		.map((line) => `\t${line}`)
		.join('\n');
}

/** Build the full stylesheet as a deterministic string. */
export function generatePaletteCss(): string {
	// --- Context 1: dark base (no media, no data-theme) ---
	const darkRoot = [
		`:root {`,
		`\tcolor-scheme: dark light;`,
		baseTokens('dark'),
		`\tbackground-color: var(--surface);`,
		`\tcolor: var(--foreground);`,
		`}`
	].join('\n');

	const darkAccents = PALETTE_NAMES.map((name) => paletteRule(name, 'dark')).join('\n\n');

	// --- Context 2: light device via media query ---
	const lightRootInner = [
		`:root {`,
		`\tcolor-scheme: light;`,
		baseTokens('light'),
		`}`
	].join('\n');

	const lightAccentsInner = PALETTE_NAMES.map((name) => paletteRule(name, 'light')).join('\n\n');

	const lightMedia = [
		`@media (prefers-color-scheme: light) {`,
		indent(lightRootInner),
		``,
		indent(lightAccentsInner),
		`}`
	].join('\n');

	// --- Context 3: explicit dark choice ---
	const darkChoiceRoot = [
		`:root[data-theme="dark"] {`,
		`\tcolor-scheme: dark;`,
		baseTokens('dark'),
		`}`
	].join('\n');

	const darkChoiceAccents = PALETTE_NAMES.map((name) => {
		const p = PALETTE[name];
		return [
			`:root[data-theme="dark"] [data-palette="${name}"] {`,
			`\t--accent: ${p.accent['dark']};`,
			`\t--on-accent: ${p.onAccent['dark']};`,
			`\t--tint: ${p.tint['dark']};`,
			`\t--deep: ${p.deep['dark']};`,
			`}`
		].join('\n');
	}).join('\n\n');

	// --- Context 4: explicit light choice ---
	const lightChoiceRoot = [
		`:root[data-theme="light"] {`,
		`\tcolor-scheme: light;`,
		baseTokens('light'),
		`}`
	].join('\n');

	const lightChoiceAccents = PALETTE_NAMES.map((name) => {
		const p = PALETTE[name];
		return [
			`:root[data-theme="light"] [data-palette="${name}"] {`,
			`\t--accent: ${p.accent['light']};`,
			`\t--on-accent: ${p.onAccent['light']};`,
			`\t--tint: ${p.tint['light']};`,
			`\t--deep: ${p.deep['light']};`,
			`}`
		].join('\n');
	}).join('\n\n');

	return [
		HEADER,
		``,
		darkRoot,
		``,
		darkAccents,
		``,
		lightMedia,
		``,
		darkChoiceRoot,
		``,
		darkChoiceAccents,
		``,
		lightChoiceRoot,
		``,
		lightChoiceAccents,
		``
	].join('\n');
}
