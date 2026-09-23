/**
 * Fetch a character's raw JSON from the D&D Beyond character service.
 *
 * Maps every HTTP outcome to a typed result: a private character (403), a
 * missing one (404), a network failure, or a response whose body is not
 * JSON. Takes an injectable fetch, in the same way `createYamlProvider`
 * does, so every outcome is testable without a network.
 */

/** The minimal HTTP response surface this module reads. `fetch`'s `Response` satisfies it. */
export interface DdbHttpResponse {
	status: number;
	text(): Promise<string>;
}

/** The fetch shape this module depends on; the global `fetch` is assignable to it. */
export type DdbFetchLike = (url: string) => Promise<DdbHttpResponse>;

export type FetchCharacterResult =
	| { status: 'ok'; body: unknown }
	| { status: 'private'; message: string }
	| { status: 'not-found'; message: string }
	| { status: 'failed'; message: string };

const PRIVATE_MESSAGE = 'This character is private. Set it to Public on D&D Beyond and retry.';

export async function fetchCharacter(
	id: string,
	fetchFn: DdbFetchLike = fetch
): Promise<FetchCharacterResult> {
	let response: DdbHttpResponse;
	try {
		response = await fetchFn(`https://character-service.dndbeyond.com/character/v5/character/${id}`);
	} catch {
		return { status: 'failed', message: 'the network request to the character service failed' };
	}

	if (response.status === 403) {
		return { status: 'private', message: PRIVATE_MESSAGE };
	}
	if (response.status === 404) {
		return { status: 'not-found', message: `character ${id} was not found` };
	}
	if (response.status < 200 || response.status >= 300) {
		return { status: 'failed', message: `the character service answered with status ${response.status}` };
	}

	let raw: string;
	try {
		raw = await response.text();
	} catch {
		return { status: 'failed', message: 'failed to read the character service response body' };
	}

	let parsed: unknown;
	try {
		parsed = JSON.parse(raw);
	} catch {
		return { status: 'failed', message: 'the character service response body is not valid JSON' };
	}

	return { status: 'ok', body: parsed };
}
