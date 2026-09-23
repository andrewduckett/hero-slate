/**
 * Parse a *character reference* — the text the Author gives to name a D&D
 * Beyond character — into its numeric character id.
 *
 * Accepts a `dndbeyond.com` character URL (with an optional trailing slash,
 * trailing path segment, or query string) or a bare numeric id. Anything
 * else is unreadable, without making a network request.
 */

export type CharacterReference = { status: 'ok'; id: string } | { status: 'unreadable' };

const DIGITS_ONLY = /^[0-9]+$/;
const CHARACTER_PATH = /^\/characters\/([0-9]+)(?:\/.*)?$/;

function unreadable(): CharacterReference {
	return { status: 'unreadable' };
}

export function parseReference(input: string): CharacterReference {
	const trimmed = input.trim();
	if (trimmed.length === 0) {
		return unreadable();
	}

	if (DIGITS_ONLY.test(trimmed)) {
		return { status: 'ok', id: trimmed };
	}

	let url: URL;
	try {
		url = new URL(trimmed);
	} catch {
		return unreadable();
	}

	if (url.hostname !== 'www.dndbeyond.com' && url.hostname !== 'dndbeyond.com') {
		return unreadable();
	}

	const match = CHARACTER_PATH.exec(url.pathname);
	if (!match) {
		return unreadable();
	}

	return { status: 'ok', id: match[1] };
}
