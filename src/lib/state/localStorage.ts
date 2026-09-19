/**
 * A per-device localStorage implementation of the `StateStore` interface.
 *
 * It persists each value under an application-scoped, injective storage key built
 * from the character's logical id and the tracker key. That layout maps to a
 * future `(owner, character_id, key)` database record — the owner comes from the
 * signed-in account, not from the interface, so no owner passes through here.
 *
 * Three durability rules shape the code:
 * - It defers and guards every localStorage access, so it imports and constructs
 *   safely with no `window` and under the app's disabled server-side rendering.
 * - It tolerates a missing, blocked, full, or corrupt store: a read that cannot
 *   reach a faithful value resolves `undefined`, and a write that cannot persist
 *   fails quietly rather than raising.
 * - It validates a value as JSON at runtime before writing, because a type alone
 *   cannot guard a JavaScript caller, an `any`, or a cast. A rejected write fails
 *   quietly and leaves any existing stored value in place.
 */
import type { JsonValue, StateStore } from './store';

// Application scope: every storage key starts here, so state never clashes with
// another app on the same origin. It stands in for the future record's owner column.
const APP_SCOPE = 'hero-slate';

/**
 * Build the storage key for an id and a tracker key. Each coordinate is
 * percent-encoded before being joined with ":", so the layout is injective — a
 * delimiter inside an id or key is escaped and can never run two coordinates
 * together into a shared key.
 */
function storageKey(id: string, key: string): string {
	return `${APP_SCOPE}:${encodeURIComponent(id)}:${encodeURIComponent(key)}`;
}

/**
 * Reach localStorage lazily and safely. Returns `null` when it is absent or its
 * access throws (a no-window environment, or storage blocked by the browser).
 * Never touched at construction time.
 */
function getStorage(): Storage | null {
	try {
		const storage = (globalThis as { localStorage?: Storage }).localStorage;
		return storage ?? null;
	} catch {
		return null;
	}
}

/**
 * Check a value is a JSON value before writing. Rejects a non-finite number,
 * `undefined`, a function, a symbol, a `Date` or other non-plain object, and a
 * circular reference — every value serialization would silently change or drop.
 */
function isJsonValue(value: unknown, seen: Set<object> = new Set()): boolean {
	if (value === null) return true;
	const type = typeof value;
	if (type === 'boolean' || type === 'string') return true;
	if (type === 'number') return Number.isFinite(value);
	if (type !== 'object') return false; // undefined, function, symbol, bigint

	const object = value as object;
	if (seen.has(object)) return false; // circular reference
	seen.add(object);
	try {
		if (Array.isArray(object)) {
			return object.every((item) => isJsonValue(item, seen));
		}
		// Only plain objects are JSON objects; a Date, Map, or class instance is not.
		const prototype = Object.getPrototypeOf(object);
		if (prototype !== Object.prototype && prototype !== null) return false;
		return Object.values(object).every((item) => isJsonValue(item, seen));
	} finally {
		seen.delete(object);
	}
}

/** Create a localStorage-backed state store. */
export function createLocalStorageStore(): StateStore {
	return {
		async read(id: string, key: string): Promise<JsonValue | undefined> {
			const storage = getStorage();
			if (storage === null) return undefined;

			let raw: string | null;
			try {
				raw = storage.getItem(storageKey(id, key));
			} catch {
				return undefined;
			}
			if (raw === null) return undefined;

			let parsed: unknown;
			try {
				parsed = JSON.parse(raw);
			} catch {
				return undefined; // corrupt, non-JSON value
			}
			// A stored string may be syntactically JSON yet parse to a non-JSON value
			// (e.g. "1e400" → Infinity); treat that as absent too.
			if (!isJsonValue(parsed)) return undefined;
			return parsed as JsonValue;
		},

		async write(id: string, key: string, value: JsonValue): Promise<void> {
			// Reject at runtime before writing, so a bad value leaves the prior one intact.
			if (!isJsonValue(value)) return;

			const storage = getStorage();
			if (storage === null) return;

			try {
				storage.setItem(storageKey(id, key), JSON.stringify(value));
			} catch {
				// Full or blocked: fail quietly, leaving any existing value in place.
			}
		}
	};
}
