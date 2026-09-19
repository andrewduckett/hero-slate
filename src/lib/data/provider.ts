import type { Character } from '$lib/types';

/**
 * The result of loading a character by logical id.
 *
 * Four cases, kept distinct so callers can separate an absent character
 * (`not-found`) from a transient failure (`error`):
 * - `found`   — a validated definition.
 * - `not-found` — no such character (a 404, the SPA fallback shell, or a
 *   non-mapping body).
 * - `invalid` — the id or the definition broke a rule; carries a reason.
 * - `error`   — a transient failure (network, non-404 HTTP status, body read).
 */
export type GetCharacterResult =
	| { status: 'found'; character: Character }
	| { status: 'not-found' }
	| { status: 'invalid'; reason: string }
	| { status: 'error' };

/**
 * Loads a character definition by its stable logical id.
 *
 * Consumers depend only on this interface — never on a storage location, URL,
 * or file path — so a future hosted backend is a swap of the implementation.
 */
export interface CharacterProvider {
	getCharacter(id: string): Promise<GetCharacterResult>;
}
