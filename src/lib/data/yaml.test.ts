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

	it('fetches the fixed asset path for a valid id', async () => {
		const { fn, calls } = fetchReturning(res({ body: 'name: Sunny Thornwood' }));
		const provider = createYamlProvider(fn);

		await provider.getCharacter('sunny');

		expect(calls).toEqual(['/characters/sunny.yaml']);
	});

	it('stamps the id from the request, ignoring an absent file id', async () => {
		const { fn } = fetchReturning(res({ body: 'name: Sunny Thornwood\nlevel: 6\nclass: Druid' }));
		const provider = createYamlProvider(fn);

		const result = await provider.getCharacter('sunny');

		expect(result.status).toBe('found');
		if (result.status === 'found') {
			expect(result.character.id).toBe('sunny');
			expect(result.character.name).toBe('Sunny Thornwood');
			expect(result.character.level).toBe(6);
			expect(result.character.class).toBe('Druid');
		}
	});

	it('rejects a conflicting file id as invalid', async () => {
		const { fn } = fetchReturning(res({ body: 'id: moon\nname: Sunny Thornwood' }));
		const provider = createYamlProvider(fn);

		const result = await provider.getCharacter('sunny');

		expect(result.status).toBe('invalid');
	});

	it('accepts a matching file id', async () => {
		const { fn } = fetchReturning(res({ body: 'id: sunny\nname: Sunny Thornwood' }));
		const provider = createYamlProvider(fn);

		const result = await provider.getCharacter('sunny');

		expect(result.status).toBe('found');
	});

	it('treats a missing name as invalid', async () => {
		const { fn } = fetchReturning(res({ body: 'level: 6\nclass: Druid' }));
		const provider = createYamlProvider(fn);

		const result = await provider.getCharacter('sunny');

		expect(result.status).toBe('invalid');
	});

	it('treats an empty name as invalid', async () => {
		const { fn } = fetchReturning(res({ body: 'name: ""' }));
		const provider = createYamlProvider(fn);

		expect((await provider.getCharacter('sunny')).status).toBe('invalid');
	});

	it('treats a non-number level as invalid', async () => {
		const { fn } = fetchReturning(res({ body: 'name: Sunny\nlevel: "six"' }));
		const provider = createYamlProvider(fn);

		expect((await provider.getCharacter('sunny')).status).toBe('invalid');
	});

	it('treats a non-finite level as invalid', async () => {
		const { fn } = fetchReturning(res({ body: 'name: Sunny\nlevel: .inf' }));
		const provider = createYamlProvider(fn);

		expect((await provider.getCharacter('sunny')).status).toBe('invalid');

		const nan = fetchReturning(res({ body: 'name: Sunny\nlevel: .nan' }));
		expect((await createYamlProvider(nan.fn).getCharacter('sunny')).status).toBe('invalid');
	});

	it('treats a non-string class as invalid', async () => {
		const { fn } = fetchReturning(res({ body: 'name: Sunny\nclass: 42' }));
		const provider = createYamlProvider(fn);

		expect((await provider.getCharacter('sunny')).status).toBe('invalid');
	});

	it('treats a non-string color as invalid', async () => {
		const num = fetchReturning(res({ body: 'name: Sunny\ncolor: 42' }));
		expect((await createYamlProvider(num.fn).getCharacter('sunny')).status).toBe('invalid');

		const list = fetchReturning(res({ body: 'name: Sunny\ncolor:\n  - forest' }));
		expect((await createYamlProvider(list.fn).getCharacter('sunny')).status).toBe('invalid');
	});

	it('carries a known color string through unresolved', async () => {
		const { fn } = fetchReturning(res({ body: 'name: Sunny\ncolor: forest' }));
		const result = await createYamlProvider(fn).getCharacter('sunny');

		expect(result.status).toBe('found');
		if (result.status === 'found') {
			expect(result.character.color).toBe('forest');
		}
	});

	it('carries an unknown color name through as valid data', async () => {
		const { fn } = fetchReturning(res({ body: 'name: Sunny\ncolor: rainbow' }));
		const result = await createYamlProvider(fn).getCharacter('sunny');

		expect(result.status).toBe('found');
		if (result.status === 'found') {
			expect(result.character.color).toBe('rainbow');
		}
	});

	it('reports an absent color as absent, not defaulted', async () => {
		const { fn } = fetchReturning(res({ body: 'name: Sunny' }));
		const result = await createYamlProvider(fn).getCharacter('sunny');

		expect(result.status).toBe('found');
		if (result.status === 'found') {
			expect(result.character.color).toBeUndefined();
		}
	});

	it('carries provisional fields through unchanged', async () => {
		const body = [
			'name: Sunny Thornwood',
			'abilities:',
			'  str: 10',
			'  wis: 18',
			'sections:',
			'  - title: Spells',
			'    body: Goodberry'
		].join('\n');
		const { fn } = fetchReturning(res({ body }));
		const provider = createYamlProvider(fn);

		const result = await provider.getCharacter('sunny');

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
			expect((await provider.getCharacter('sunny')).status).toBe('error');
		}
	});

	it('maps a rejected fetch to error', async () => {
		const fn: FetchLike = async () => {
			throw new Error('network down');
		};
		const provider = createYamlProvider(fn);

		expect((await provider.getCharacter('sunny')).status).toBe('error');
	});

	it('maps a body-read failure to error', async () => {
		const { fn } = fetchReturning(res({ throwOnText: true }));
		const provider = createYamlProvider(fn);

		expect((await provider.getCharacter('sunny')).status).toBe('error');
	});

	it('treats a 200 text/html shell as not-found without validating identity', async () => {
		const { fn } = fetchReturning(
			res({ status: 200, contentType: 'text/html', body: '<!doctype html><html></html>' })
		);
		const provider = createYamlProvider(fn);

		expect((await provider.getCharacter('sunny')).status).toBe('not-found');
	});

	it('treats a non-mapping body as not-found', async () => {
		const { fn } = fetchReturning(res({ body: 'just a string' }));
		const provider = createYamlProvider(fn);

		expect((await provider.getCharacter('sunny')).status).toBe('not-found');
	});

	it('treats an unparseable non-HTML body as invalid', async () => {
		const { fn } = fetchReturning(res({ contentType: 'application/yaml', body: 'name: "unterminated' }));
		const provider = createYamlProvider(fn);

		expect((await provider.getCharacter('sunny')).status).toBe('invalid');
	});

	it('never throws across any path', async () => {
		const fn: FetchLike = async () => {
			throw new Error('boom');
		};
		const provider = createYamlProvider(fn);
		await expect(provider.getCharacter('sunny')).resolves.toBeDefined();
	});
});
