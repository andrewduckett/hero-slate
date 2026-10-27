import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createYamlProvider, type FetchLike } from './yaml';
import { resolveAbilities } from '#lib/character/abilities';
import { resolveCombat } from '#lib/character/combat';
import { resolveHitPoints } from '#lib/character/hitPoints';

// The fixture is owned by this test, so editing a shipped character never breaks it.
const fixturePath = resolve(process.cwd(), 'src/lib/data/test-hero.yaml');
const fixtureYaml = readFileSync(fixturePath, 'utf8');

const serveFixture: FetchLike = async (url) => ({
	status: url === '/characters/test-hero.yaml' ? 200 : 404,
	headers: { get: (name) => (name.toLowerCase() === 'content-type' ? 'application/yaml' : null) },
	text: async () => fixtureYaml
});

describe('YAML provider with a real YAML file', () => {
	it('loads as a found character with the expected identity', async () => {
		const result = await createYamlProvider(serveFixture).getCharacter('test-hero');

		expect(result.status).toBe('found');
		if (result.status === 'found') {
			expect(result.character.id).toBe('test-hero');
			expect(result.character.name).toBe('Test Hero');
			expect(result.character.level).toBe(3);
			expect(result.character.class).toBe('Fighter');
			expect(result.character.color).toBe('ocean');
		}
	});

	it('resolves abilities to an ordered list with the authored labels and values', async () => {
		const result = await createYamlProvider(serveFixture).getCharacter('test-hero');

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
			expect(abilities.map((e) => e.score)).toEqual([16, 12, 14, 10, 13, 8]);
		}
	});

	it('resolves combat to an ordered list with the authored labels and values', async () => {
		const result = await createYamlProvider(serveFixture).getCharacter('test-hero');

		expect(result.status).toBe('found');
		if (result.status === 'found') {
			const combat = resolveCombat(result.character.combat);
			expect(combat.map((e) => e.label)).toEqual(['Armor Class', 'Speed', 'Initiative']);
			expect(combat.map((e) => e.value)).toEqual(['17', '30', '+1']);
		}
	});

	it('resolves hit points to full health from the authored max, with no stored current', async () => {
		const result = await createYamlProvider(serveFixture).getCharacter('test-hero');

		expect(result.status).toBe('found');
		if (result.status === 'found') {
			// The file supplies only `max`; a new character starts at full health.
			expect(resolveHitPoints(result.character.hitPoints, undefined)).toEqual({
				current: 28,
				max: 28
			});
		}
	});
});
