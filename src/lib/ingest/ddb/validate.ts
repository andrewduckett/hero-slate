/**
 * Validate a drafted character file before the preview draws anything, and
 * before the write tool saves it.
 *
 * Reuses the provider's own rules instead of copying them: `ID_GRAMMAR` and
 * `checkIdentity` from `$lib/data/yaml`, `PALETTE_NAMES` from
 * `$lib/theme/palette`, and `validEntries` from `$lib/character/entries`.
 */
import { parse as parseYaml } from 'yaml';
import { ID_GRAMMAR, checkIdentity } from '$lib/data/yaml';
import { PALETTE_NAMES } from '$lib/theme/palette';
import { validEntries } from '$lib/character/entries';

export interface ValidationResult {
	errors: string[];
	warnings: string[];
}

function isMapping(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** `hitPoints.max` counts only when it is an integer greater than 0 — the same rule `resolveHitPoints` applies. */
function isPositiveInteger(value: unknown): boolean {
	return typeof value === 'number' && Number.isInteger(value) && value > 0;
}

export function validateDraft(text: string, targetId: string): ValidationResult {
	const errors: string[] = [];
	const warnings: string[] = [];

	let parsed: unknown;
	try {
		parsed = parseYaml(text);
	} catch {
		errors.push('the file is not parseable YAML');
		return { errors, warnings };
	}

	if (!isMapping(parsed)) {
		errors.push("the file's top level is not a mapping");
		return { errors, warnings };
	}

	if (!ID_GRAMMAR.test(targetId)) {
		errors.push(`the logical id "${targetId}" does not match the id grammar`);
	}

	if (parsed.id !== undefined && parsed.id !== targetId) {
		errors.push(`the file sets an id ("${String(parsed.id)}") that differs from the target id ("${targetId}")`);
	}

	const identityReason = checkIdentity(parsed);
	if (identityReason !== undefined) {
		errors.push(identityReason);
	}

	if (typeof parsed.color === 'string' && !(PALETTE_NAMES as readonly string[]).includes(parsed.color)) {
		warnings.push(`color "${parsed.color}" is not a palette name and will fall back to neutral`);
	}

	if (Array.isArray(parsed.abilities) && validEntries(parsed.abilities).length < parsed.abilities.length) {
		warnings.push('abilities has an entry the app would drop');
	}

	if (Array.isArray(parsed.combat) && validEntries(parsed.combat).length < parsed.combat.length) {
		warnings.push('combat has an entry the app would drop');
	}

	if (isMapping(parsed.hitPoints) && 'max' in parsed.hitPoints && !isPositiveInteger(parsed.hitPoints.max)) {
		warnings.push('hitPoints.max is present but is not an integer greater than 0');
	}

	return { errors, warnings };
}
