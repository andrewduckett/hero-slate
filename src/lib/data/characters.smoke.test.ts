import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { parse as parseYaml } from 'yaml';
import { createYamlProvider, type FetchLike } from './yaml';

// Checks only that each shipped character loads, so authors can edit values freely.
const charactersDir = resolve(process.cwd(), 'static/characters');
const ids = readdirSync(charactersDir)
	.filter((file) => file.endsWith('.yaml') && file !== 'manifest.yaml')
	.map((file) => file.slice(0, -'.yaml'.length));

const serveShipped: FetchLike = async (url) => {
	const match = /^\/characters\/([^/]+)\.yaml$/.exec(url);
	const id = match?.[1];
	const found = id !== undefined && (ids.includes(id) || id === 'manifest');
	return {
		status: found ? 200 : 404,
		headers: { get: (name) => (name.toLowerCase() === 'content-type' ? 'application/yaml' : null) },
		text: async () => (found ? readFileSync(resolve(charactersDir, `${id}.yaml`), 'utf8') : '')
	};
};

describe('shipped characters', () => {
	// Guards against a moved folder or wrong path passing with zero files checked.
	it('includes at least one YAML file', () => {
		expect(ids.length).toBeGreaterThan(0);
	});

	it.each(ids)('%s loads as a found character', async (id) => {
		const result = await createYamlProvider(serveShipped).getCharacter(id);

		expect(result).toMatchObject({ status: 'found' });
	});

	// An avatar is named after its character, so a misnamed image never shows.
	it('names every shipped image after a shipped character', () => {
		const images = readdirSync(charactersDir).filter((file) => file.endsWith('.png'));

		const orphans = images.filter((file) => !ids.includes(file.slice(0, -'.png'.length)));
		expect(orphans).toEqual([]);
	});

	// Fails on drift either way: a file the manifest omits, or a line with no file.
	it('lists exactly the shipped characters through the manifest', async () => {
		const result = await createYamlProvider(serveShipped).listCharacters();

		const manifest = parseYaml(readFileSync(resolve(charactersDir, 'manifest.yaml'), 'utf8'));
		expect(result).toMatchObject({ status: 'found' });
		const listed = result.status === 'found' ? result.characters.map((c) => c.id) : [];
		expect(listed).toEqual(manifest.characters);
		expect([...listed].sort()).toEqual([...ids].sort());
	});
});
