import { parse as parseYaml } from 'yaml';
import type { Character } from '$lib/types';
import type { CharacterProvider, GetCharacterResult } from './provider';

/** The minimal HTTP response surface the provider reads. `fetch`'s `Response` satisfies it. */
export interface HttpResponse {
	status: number;
	headers: { get(name: string): string | null };
	text(): Promise<string>;
}

/** The fetch shape the provider depends on; the global `fetch` is assignable to it. */
export type FetchLike = (url: string) => Promise<HttpResponse>;

/** Logical ids are lowercase, start alphanumeric, then alphanumeric or hyphen. */
export const ID_GRAMMAR = /^[a-z0-9][a-z0-9-]*$/;

/**
 * A `CharacterProvider` backed by a YAML asset fetched at runtime.
 *
 * It validates the id, fetches `/characters/<id>.yaml`, maps the HTTP status,
 * guards against the SPA fallback shell, parses the body, stamps the id from
 * the request, and validates identity fields. No path throws: every outcome
 * maps to a typed result.
 *
 * @param fetchFn injectable for testing; defaults to the global `fetch`.
 */
export function createYamlProvider(fetchFn: FetchLike = fetch): CharacterProvider {
	return {
		async getCharacter(id: string): Promise<GetCharacterResult> {
			// 1. Validate the id at the boundary — no fetch for a bad id.
			if (!ID_GRAMMAR.test(id)) {
				return { status: 'invalid', reason: 'id does not match the allowed grammar' };
			}

			// 2. Fetch; a rejected fetch is a transient error.
			let response: HttpResponse;
			try {
				response = await fetchFn(`/characters/${id}.yaml`);
			} catch {
				return { status: 'error' };
			}

			// 3. Map the status. 404 is a missing character; any other non-2xx is transient.
			if (response.status === 404) {
				return { status: 'not-found' };
			}
			if (response.status < 200 || response.status >= 300) {
				return { status: 'error' };
			}

			// 4. Read the body; a read failure is transient.
			let raw: string;
			try {
				raw = await response.text();
			} catch {
				return { status: 'error' };
			}

			// The SPA fallback shell is served as text/html at 200 for a missing asset.
			const contentType = response.headers.get('content-type') ?? '';
			if (contentType.toLowerCase().includes('text/html')) {
				return { status: 'not-found' };
			}

			// 5. Parse. Unparseable YAML is invalid; a non-mapping body is not a character.
			let parsed: unknown;
			try {
				parsed = parseYaml(raw);
			} catch {
				return { status: 'invalid', reason: 'body is not parseable YAML' };
			}

			if (!isMapping(parsed)) {
				return { status: 'not-found' };
			}

			// 6. Validate identity and stamp the id from the request.
			return toFoundOrInvalid(id, parsed);
		}
	};
}

/** A YAML mapping is a plain object — not null, not an array. */
function isMapping(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Validate the identity fields (`name`, `level`, `class`, `color`) a character
 * body must satisfy. Returns a reason string on the first violation found, or
 * `undefined` when every field is valid. Shared with the ingest tools so they
 * apply the same rules the provider does, instead of copying them.
 */
export function checkIdentity(body: Record<string, unknown>): string | undefined {
	// name: required, non-empty string.
	if (typeof body.name !== 'string' || body.name.length === 0) {
		return 'name is required and must be a non-empty string';
	}

	// level: optional; a finite number when present.
	if (body.level !== undefined && (typeof body.level !== 'number' || !Number.isFinite(body.level))) {
		return 'level must be a finite number';
	}

	// class: optional; a string when present.
	if (body.class !== undefined && typeof body.class !== 'string') {
		return 'class must be a string';
	}

	// color: optional; a string when present. The provider does not resolve it
	// against the palette, so an unknown palette name is valid data here.
	if (body.color !== undefined && typeof body.color !== 'string') {
		return 'color must be a string';
	}

	return undefined;
}

/** Validate identity fields, reject a conflicting file id, and stamp the request id. */
function toFoundOrInvalid(id: string, body: Record<string, unknown>): GetCharacterResult {
	// The file must not claim a different id than the one requested.
	if (body.id !== undefined && body.id !== id) {
		return { status: 'invalid', reason: 'file id conflicts with the request id' };
	}

	const reason = checkIdentity(body);
	if (reason !== undefined) {
		return { status: 'invalid', reason };
	}

	// Provisional fields pass through unchanged; the request id is authoritative.
	const character = { ...body, id } as Character;
	return { status: 'found', character };
}
