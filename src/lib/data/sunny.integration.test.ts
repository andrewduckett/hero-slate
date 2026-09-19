import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createYamlProvider, type FetchLike } from './yaml';

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
});
