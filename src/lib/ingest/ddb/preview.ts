/**
 * Draw an ASCII preview of a draft character file, using the same resolvers
 * the app uses, so the preview matches the rendered sheet. Draws only the
 * story-16 blocks — identity, abilities, combat, and hit points — and lists
 * any other top-level block under "Not previewed" without drawing it.
 *
 * Emoji in names vary in display width, so the border has no right-hand
 * side: a fixed-width right edge would never line up.
 */
import { resolveAbilities } from '$lib/character/abilities';
import { resolveCombat } from '$lib/character/combat';
import { resolveHitPoints } from '$lib/character/hitPoints';
import { resolvePools } from '$lib/character/pools';

const DRAWN_BLOCKS = new Set(['id', 'name', 'level', 'class', 'color', 'abilities', 'combat', 'hitPoints', 'pools']);

function border(): string {
	return '+' + '-'.repeat(40);
}

export function renderPreview(draft: Record<string, unknown>): string[] {
	const lines: string[] = [];

	lines.push(border());
	lines.push(`| ${typeof draft.name === 'string' ? draft.name : '(no name)'}`);

	const level = typeof draft.level === 'number' ? draft.level : undefined;
	const characterClass = typeof draft.class === 'string' ? draft.class : undefined;
	if (level !== undefined || characterClass !== undefined) {
		const parts = [level !== undefined ? `Level ${level}` : undefined, characterClass].filter(Boolean);
		lines.push(`| ${parts.join(' ')}`);
	}

	const abilities = resolveAbilities(draft.abilities);
	if (abilities.length > 0) {
		lines.push('|');
		lines.push('| Abilities');
		for (const ability of abilities) {
			const score = ability.score ?? '—';
			lines.push(`|   ${ability.label}: ${score} (${ability.modifier})`);
		}
	}

	const combat = resolveCombat(draft.combat);
	if (combat.length > 0) {
		lines.push('|');
		lines.push('| Combat');
		for (const entry of combat) {
			lines.push(`|   ${entry.label}: ${entry.value}`);
		}
	}

	const hitPoints = resolveHitPoints(draft.hitPoints, null);
	if (hitPoints !== null) {
		lines.push('|');
		lines.push('| Hit Points');
		lines.push(`|   Max: ${hitPoints.max}`);
	}

	const pools = resolvePools(draft.pools, null);
	if (pools.length > 0) {
		lines.push('|');
		lines.push('| Pools');
		for (const pool of pools) {
			lines.push(`|   ${pool.label}: ${'o'.repeat(pool.max)}`);
		}
	}

	const otherBlocks = Object.keys(draft).filter((key) => !DRAWN_BLOCKS.has(key));
	if (otherBlocks.length > 0) {
		lines.push('|');
		lines.push(`| Not previewed: ${otherBlocks.join(', ')}`);
	}

	lines.push(border());

	return lines;
}
