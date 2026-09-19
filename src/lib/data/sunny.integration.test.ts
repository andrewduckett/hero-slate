import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createYamlProvider, type FetchLike } from './yaml';
import { resolveAbilities } from '$lib/character/abilities';
import { resolveCombat } from '$lib/character/combat';
import { resolveHitPoints } from '$lib/character/hitPoints';

// Prove the shipped sample file parses to a valid `found` character.
const sunnyPath = resolve(process.cwd(), 'static/characters/sunny.yaml');
const sunnyYaml = readFileSync(sunnyPath, 'utf8');

const serveSunny: FetchLike = async (url) => ({
	status: url === '/characters/sunny.yaml' ? 200 : 404,
	headers: { get: (name) => (name.toLowerCase() === 'content-type' ? 'application/yaml' : null) },
	text: async () => sunnyYaml
});

describe('shipped sunny.yaml', () => {
	it('loads as a found character with the expected identity', async () => {
		const result = await createYamlProvider(serveSunny).getCharacter('sunny');

		expect(result.status).toBe('found');
		if (result.status === 'found') {
			expect(result.character.id).toBe('sunny');
			expect(result.character.name).toBe('Sunny Thornwood');
			expect(result.character.level).toBe(6);
			expect(result.character.class).toBe('Druid');
			expect(result.character.color).toBe('forest');
		}
	});

	it('resolves abilities to an ordered list with the authored labels and values', async () => {
		const result = await createYamlProvider(serveSunny).getCharacter('sunny');

		expect(result.status).toBe('found');
		if (result.status === 'found') {
			const abilities = resolveAbilities(result.character.abilities);
			expect(abilities.map((e) => e.label)).toEqual([
				'Strength',
				'Dexterity',
				'Constitution',
				'Intelligence',
				'Wisdom',
				'Charisma'
			]);
			expect(abilities.map((e) => e.score)).toEqual([10, 14, 14, 10, 18, 12]);
		}
	});

	it('resolves combat to an ordered list with the authored labels and values', async () => {
		const result = await createYamlProvider(serveSunny).getCharacter('sunny');

		expect(result.status).toBe('found');
		if (result.status === 'found') {
			const combat = resolveCombat(result.character.combat);
			expect(combat.map((e) => e.label)).toEqual(['Armor Class', 'Speed', 'Initiative']);
			expect(combat.map((e) => e.value)).toEqual(['15', '30', '+2']);
		}
	});

	it('resolves hit points to full health from the authored max, with no stored current', async () => {
		const result = await createYamlProvider(serveSunny).getCharacter('sunny');

		expect(result.status).toBe('found');
		if (result.status === 'found') {
			// The file supplies only `max`; a new character starts at full health.
			expect(resolveHitPoints(result.character.hitPoints, undefined)).toEqual({
				current: 45,
				max: 45
			});
		}
	});
});
