import { describe, it, expect, vi } from 'vitest';
import { createYamlProvider, type FetchLike, type HttpResponse } from './yaml';

/** Build a mock HTTP response with just the surface the provider reads. */
function res(opts: {
	status?: number;
	contentType?: string | null;
	body?: string;
	throwOnText?: boolean;
}): HttpResponse {
	const { status = 200, contentType = 'application/yaml', body = '', throwOnText = false } = opts;
	return {
		status,
		headers: { get: (name: string) => (name.toLowerCase() === 'content-type' ? contentType : null) },
		text: async () => {
			if (throwOnText) throw new Error('body read failed');
			return body;
		}
	};
}

/** A fetch that returns one canned response and records the URLs it was called with. */
function fetchReturning(response: HttpResponse): { fn: FetchLike; calls: string[] } {
	const calls: string[] = [];
	const fn: FetchLike = async (url) => {
		calls.push(url);
		return response;
	};
	return { fn, calls };
}

describe('createYamlProvider', () => {
	it('rejects a malformed id before any fetch', async () => {
		const { fn, calls } = fetchReturning(res({}));
		const provider = createYamlProvider(fn);

		const result = await provider.getCharacter('../secret');

		expect(result.status).toBe('invalid');
		expect(calls).toHaveLength(0);
	});

	it('reports the reserved manifest id as not-found before any fetch', async () => {
		const { fn, calls } = fetchReturning(res({ body: 'name: Manifest' }));
		const provider = createYamlProvider(fn);

		const result = await provider.getCharacter('manifest');

		expect(result.status).toBe('not-found');
		expect(calls).toHaveLength(0);
	});

	it('fetches the fixed asset path for a valid id', async () => {
		const { fn, calls } = fetchReturning(res({ body: 'name: Test Hero' }));
		const provider = createYamlProvider(fn);

		await provider.getCharacter('test-hero');

		expect(calls).toEqual(['/characters/test-hero.yaml']);
	});

	it('stamps the id from the request, ignoring an absent file id', async () => {
		const { fn } = fetchReturning(res({ body: 'name: Test Hero\nlevel: 6\nclass: Druid' }));
		const provider = createYamlProvider(fn);

		const result = await provider.getCharacter('test-hero');

		expect(result.status).toBe('found');
		if (result.status === 'found') {
			expect(result.character.id).toBe('test-hero');
			expect(result.character.name).toBe('Test Hero');
			expect(result.character.level).toBe(6);
			expect(result.character.class).toBe('Druid');
		}
	});

	it('rejects a conflicting file id as invalid', async () => {
		const { fn } = fetchReturning(res({ body: 'id: other-hero\nname: Test Hero' }));
		const provider = createYamlProvider(fn);

		const result = await provider.getCharacter('test-hero');

		expect(result.status).toBe('invalid');
	});

	it('accepts a matching file id', async () => {
		const { fn } = fetchReturning(res({ body: 'id: test-hero\nname: Test Hero' }));
		const provider = createYamlProvider(fn);

		const result = await provider.getCharacter('test-hero');

		expect(result.status).toBe('found');
	});

	it('treats a missing name as invalid', async () => {
		const { fn } = fetchReturning(res({ body: 'level: 6\nclass: Druid' }));
		const provider = createYamlProvider(fn);

		const result = await provider.getCharacter('test-hero');

		expect(result.status).toBe('invalid');
	});

	it('treats an empty name as invalid', async () => {
		const { fn } = fetchReturning(res({ body: 'name: ""' }));
		const provider = createYamlProvider(fn);

		expect((await provider.getCharacter('test-hero')).status).toBe('invalid');
	});

	it('treats a non-number level as invalid', async () => {
		const { fn } = fetchReturning(res({ body: 'name: Test Hero\nlevel: "six"' }));
		const provider = createYamlProvider(fn);

		expect((await provider.getCharacter('test-hero')).status).toBe('invalid');
	});

	it('treats a non-finite level as invalid', async () => {
		const { fn } = fetchReturning(res({ body: 'name: Test Hero\nlevel: .inf' }));
		const provider = createYamlProvider(fn);

		expect((await provider.getCharacter('test-hero')).status).toBe('invalid');

		const nan = fetchReturning(res({ body: 'name: Test Hero\nlevel: .nan' }));
		expect((await createYamlProvider(nan.fn).getCharacter('test-hero')).status).toBe('invalid');
	});

	it('treats a non-string class as invalid', async () => {
		const { fn } = fetchReturning(res({ body: 'name: Test Hero\nclass: 42' }));
		const provider = createYamlProvider(fn);

		expect((await provider.getCharacter('test-hero')).status).toBe('invalid');
	});

	it('treats a non-string color as invalid', async () => {
		const num = fetchReturning(res({ body: 'name: Test Hero\ncolor: 42' }));
		expect((await createYamlProvider(num.fn).getCharacter('test-hero')).status).toBe('invalid');

		const list = fetchReturning(res({ body: 'name: Test Hero\ncolor:\n  - forest' }));
		expect((await createYamlProvider(list.fn).getCharacter('test-hero')).status).toBe('invalid');
	});

	it('carries a known color string through unresolved', async () => {
		const { fn } = fetchReturning(res({ body: 'name: Test Hero\ncolor: forest' }));
		const result = await createYamlProvider(fn).getCharacter('test-hero');

		expect(result.status).toBe('found');
		if (result.status === 'found') {
			expect(result.character.color).toBe('forest');
		}
	});

	it('carries an unknown color name through as valid data', async () => {
		const { fn } = fetchReturning(res({ body: 'name: Test Hero\ncolor: rainbow' }));
		const result = await createYamlProvider(fn).getCharacter('test-hero');

		expect(result.status).toBe('found');
		if (result.status === 'found') {
			expect(result.character.color).toBe('rainbow');
		}
	});

	it('reports an absent color as absent, not defaulted', async () => {
		const { fn } = fetchReturning(res({ body: 'name: Test Hero' }));
		const result = await createYamlProvider(fn).getCharacter('test-hero');

		expect(result.status).toBe('found');
		if (result.status === 'found') {
			expect(result.character.color).toBeUndefined();
		}
	});

	it("names a found character's avatar after its id", async () => {
		const { fn } = fetchReturning(res({ body: 'name: Test Hero' }));
		const result = await createYamlProvider(fn).getCharacter('test-hero');

		expect(result.status === 'found' && result.character.avatar).toBe('/characters/test-hero.png');
	});

	it.each([
		['a remote URL', 'https://example.test/hero.png'],
		['a site path', '/characters/other.png'],
		['a number', '42']
	])('ignores an authored avatar that is %s', async (_label, value) => {
		const { fn } = fetchReturning(res({ body: `name: Test Hero\navatar: ${value}` }));
		const result = await createYamlProvider(fn).getCharacter('test-hero');

		expect(result.status === 'found' && result.character.avatar).toBe('/characters/test-hero.png');
	});

	it('carries provisional fields through unchanged', async () => {
		const body = [
			'name: Test Hero',
			'abilities:',
			'  str: 10',
			'  wis: 18',
			'sections:',
			'  - title: Spells',
			'    body: Goodberry'
		].join('\n');
		const { fn } = fetchReturning(res({ body }));
		const provider = createYamlProvider(fn);

		const result = await provider.getCharacter('test-hero');

		expect(result.status).toBe('found');
		if (result.status === 'found') {
			expect(result.character.abilities).toEqual({ str: 10, wis: 18 });
			expect(result.character.sections).toEqual([{ title: 'Spells', body: 'Goodberry' }]);
		}
	});

	it('maps a 404 to not-found', async () => {
		const { fn } = fetchReturning(res({ status: 404, body: 'not found' }));
		const provider = createYamlProvider(fn);

		expect((await provider.getCharacter('nobody')).status).toBe('not-found');
	});

	it('maps non-404 client and server statuses to error', async () => {
		for (const status of [403, 429, 503]) {
			const { fn } = fetchReturning(res({ status, body: '' }));
			const provider = createYamlProvider(fn);
			expect((await provider.getCharacter('test-hero')).status).toBe('error');
		}
	});

	it('maps a rejected fetch to error', async () => {
		const fn: FetchLike = async () => {
			throw new Error('network down');
		};
		const provider = createYamlProvider(fn);

		expect((await provider.getCharacter('test-hero')).status).toBe('error');
	});

	it('maps a body-read failure to error', async () => {
		const { fn } = fetchReturning(res({ throwOnText: true }));
		const provider = createYamlProvider(fn);

		expect((await provider.getCharacter('test-hero')).status).toBe('error');
	});

	it('treats a 200 text/html shell as not-found without validating identity', async () => {
		const { fn } = fetchReturning(
			res({ status: 200, contentType: 'text/html', body: '<!doctype html><html></html>' })
		);
		const provider = createYamlProvider(fn);

		expect((await provider.getCharacter('test-hero')).status).toBe('not-found');
	});

	it('treats a non-mapping body as not-found', async () => {
		const { fn } = fetchReturning(res({ body: 'just a string' }));
		const provider = createYamlProvider(fn);

		expect((await provider.getCharacter('test-hero')).status).toBe('not-found');
	});

	it('treats an unparseable non-HTML body as invalid', async () => {
		const { fn } = fetchReturning(res({ contentType: 'application/yaml', body: 'name: "unterminated' }));
		const provider = createYamlProvider(fn);

		expect((await provider.getCharacter('test-hero')).status).toBe('invalid');
	});

	it('never throws across any path', async () => {
		const fn: FetchLike = async () => {
			throw new Error('boom');
		};
		const provider = createYamlProvider(fn);
		await expect(provider.getCharacter('test-hero')).resolves.toBeDefined();
	});
});

/** A fetch that serves YAML bodies by URL, 404s the rest, and records the URLs it was called with. */
function fetchServing(bodies: Record<string, string>): { fn: FetchLike; calls: string[] } {
	const calls: string[] = [];
	const fn: FetchLike = async (url) => {
		calls.push(url);
		const body = bodies[url];
		return body === undefined ? res({ status: 404 }) : res({ body });
	};
	return { fn, calls };
}

describe('listCharacters', () => {
	it('returns identity-only summaries in manifest order', async () => {
		const { fn } = fetchServing({
			'/characters/manifest.yaml': 'characters: [sunny, gimdak]',
			'/characters/sunny.yaml':
				'name: Sunny Thornwood\nlevel: 7\nclass: Druid\ncolor: forest\nabilities: { wis: 18 }',
			'/characters/gimdak.yaml': 'name: Gimdak Steelward'
		});

		const result = await createYamlProvider(fn).listCharacters();

		expect(result).toEqual({
			status: 'found',
			characters: [
				{
					id: 'sunny',
					name: 'Sunny Thornwood',
					level: 7,
					class: 'Druid',
					color: 'forest',
					avatar: '/characters/sunny.png'
				},
				{ id: 'gimdak', name: 'Gimdak Steelward', avatar: '/characters/gimdak.png' }
			]
		});
	});

	it("carries each character's avatar into its summary", async () => {
		const { fn } = fetchServing({
			'/characters/manifest.yaml': 'characters: [test-hero]',
			'/characters/test-hero.yaml': 'name: Test Hero'
		});

		const result = await createYamlProvider(fn).listCharacters();

		expect(result).toEqual({
			status: 'found',
			characters: [{ id: 'test-hero', name: 'Test Hero', avatar: '/characters/test-hero.png' }]
		});
	});

	it('skips malformed entries before any fetch', async () => {
		const { fn, calls } = fetchServing({
			'/characters/manifest.yaml': "characters: [sunny, '../secret', 7, manifest]",
			'/characters/sunny.yaml': 'name: Sunny Thornwood'
		});

		const result = await createYamlProvider(fn).listCharacters();

		expect(result).toEqual({ status: 'found', characters: [{ id: 'sunny', name: 'Sunny Thornwood', avatar: '/characters/sunny.png' }] });
		expect(calls).toEqual(['/characters/manifest.yaml', '/characters/sunny.yaml']);
	});

	it('lists a repeated id once, at its first position', async () => {
		const { fn } = fetchServing({
			'/characters/manifest.yaml': 'characters: [sunny, urven, sunny]',
			'/characters/sunny.yaml': 'name: Sunny Thornwood',
			'/characters/urven.yaml': 'name: Urven'
		});

		const result = await createYamlProvider(fn).listCharacters();

		expect(result.status === 'found' && result.characters.map((c) => c.id)).toEqual(['sunny', 'urven']);
	});

	it('skips entries whose definition does not load', async () => {
		const fn: FetchLike = async (url) => {
			switch (url) {
				case '/characters/manifest.yaml':
					return res({ body: 'characters: [sunny, nobody, broken, flaky]' });
				case '/characters/sunny.yaml':
					return res({ body: 'name: Sunny Thornwood' });
				case '/characters/broken.yaml':
					return res({ body: 'level: 3' });
				case '/characters/flaky.yaml':
					return res({ status: 503 });
				default:
					return res({ status: 404 });
			}
		};

		const result = await createYamlProvider(fn).listCharacters();

		expect(result).toEqual({ status: 'found', characters: [{ id: 'sunny', name: 'Sunny Thornwood', avatar: '/characters/sunny.png' }] });
	});

	it.each([
		['a 404', res({ status: 404 })],
		['the text/html shell', res({ contentType: 'text/html', body: '<!doctype html><html></html>' })],
		['a 5xx status', res({ status: 503 })],
		['a failed body read', res({ throwOnText: true })],
		['unparseable YAML', res({ body: 'characters: "unterminated' })],
		['a list body', res({ body: '- sunny' })],
		['a string body', res({ body: 'sunny' })],
		['a mapping without a characters list', res({ body: 'characters: sunny' })]
	])('returns error for a manifest that is %s', async (_label, response) => {
		const { fn } = fetchReturning(response);

		expect(await createYamlProvider(fn).listCharacters()).toEqual({ status: 'error' });
	});

	it('returns error when the manifest fetch rejects', async () => {
		const fn: FetchLike = async () => {
			throw new Error('network down');
		};

		expect(await createYamlProvider(fn).listCharacters()).toEqual({ status: 'error' });
	});

	it('returns found and empty for an empty manifest', async () => {
		const { fn } = fetchServing({ '/characters/manifest.yaml': 'characters: []' });

		expect(await createYamlProvider(fn).listCharacters()).toEqual({ status: 'found', characters: [] });
	});

	it('returns found and empty when every entry is skipped', async () => {
		const { fn } = fetchServing({ '/characters/manifest.yaml': 'characters: [nobody]' });

		const result = await createYamlProvider(fn).listCharacters();

		expect(result).toEqual({ status: 'found', characters: [] });
	});
});
