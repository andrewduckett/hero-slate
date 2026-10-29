/**
 * Resolves a character's authored `avatar` to an image source, or to no avatar.
 *
 * The provider carries any string through, so this is the only place a value
 * becomes a URL. It accepts a site path only: a string starting with `/` that a
 * browser, parsing it against the site's origin, keeps on that origin with the
 * path as written. A `startsWith('/')` check alone is not enough, because
 * browsers read `/\host/x` as `//host/x` and strip tabs and newlines inside a
 * URL, both of which reach another host. The page requests nothing from
 * another host (decision 0005), so anything else resolves to no avatar.
 */

// A private origin no real site uses, so the parse can only compare, never fetch.
const BASE = 'https://hero-slate.invalid';
const BASE_ORIGIN = new URL(BASE).origin;

/** Resolve an authored avatar to a site-path image source, or `undefined`. */
export function resolveAvatar(value: unknown): string | undefined {
	if (typeof value !== 'string' || !value.startsWith('/')) {
		return undefined;
	}
	let parsed: URL;
	try {
		parsed = new URL(value, BASE);
	} catch {
		return undefined;
	}
	return parsed.origin === BASE_ORIGIN && parsed.pathname === value ? value : undefined;
}
