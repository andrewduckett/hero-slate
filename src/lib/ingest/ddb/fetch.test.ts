import { describe, it, expect } from 'vitest';
import { fetchCharacter, type DdbFetchLike, type DdbHttpResponse } from './fetch';

function res(opts: { status?: number; body?: string; throwOnText?: boolean }): DdbHttpResponse {
	const { status = 200, body = '', throwOnText = false } = opts;
	return {
		status,
		text: async () => {
			if (throwOnText) throw new Error('body read failed');
			return body;
		}
	};
}

function fetchReturning(response: DdbHttpResponse): { fn: DdbFetchLike; calls: string[] } {
	const calls: string[] = [];
	const fn: DdbFetchLike = async (url) => {
		calls.push(url);
		return response;
	};
	return { fn, calls };
}

describe('fetchCharacter', () => {
	it('requests the character-service URL for the given id', async () => {
		const { fn, calls } = fetchReturning(res({ body: '{"data":{}}' }));

		await fetchCharacter('154922980', fn);

		expect(calls).toEqual(['https://character-service.dndbeyond.com/character/v5/character/154922980']);
	});

	it('returns the parsed body on a 200 JSON response', async () => {
		const { fn } = fetchReturning(res({ body: '{"data":{"name":"Urven"}}' }));

		const result = await fetchCharacter('154922980', fn);

		expect(result).toEqual({ status: 'ok', body: { data: { name: 'Urven' } } });
	});

	it('maps a 403 to private, with a message telling the Author to set it Public', async () => {
		const { fn } = fetchReturning(res({ status: 403 }));

		const result = await fetchCharacter('154922980', fn);

		expect(result.status).toBe('private');
		if (result.status === 'private') {
			expect(result.message).toMatch(/public/i);
			expect(result.message).toMatch(/retry/i);
		}
	});

	it('maps a 404 to not-found', async () => {
		const { fn } = fetchReturning(res({ status: 404 }));

		const result = await fetchCharacter('154922980', fn);

		expect(result.status).toBe('not-found');
	});

	it('maps a rejected fetch to failed', async () => {
		const fn: DdbFetchLike = async () => {
			throw new Error('network down');
		};

		const result = await fetchCharacter('154922980', fn);

		expect(result.status).toBe('failed');
	});

	it('maps a 200 response with a non-JSON body to failed', async () => {
		const { fn } = fetchReturning(res({ body: 'not json' }));

		const result = await fetchCharacter('154922980', fn);

		expect(result.status).toBe('failed');
	});
});
