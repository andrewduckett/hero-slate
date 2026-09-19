/**
 * The per-device state store interface.
 *
 * The store reads and writes a value by two coordinates: a character's stable
 * logical id and a caller-chosen tracker key (such as "hp"). The value is opaque
 * JSON the store never interprets — a domain resolver owns meaning. Reads and
 * writes are asynchronous, so a later network-backed implementation swaps in
 * without changing a call site. The interface exposes no storage location:
 * callers depend only on the id and the key.
 *
 * See `docs/adr/0003-per-device-state-behind-a-key-value-store-interface.md`.
 */

/**
 * A JSON value: `null`, a boolean, a finite number, a string, or an array or
 * object built from JSON values. Object keys are strings. This type disallows
 * `undefined`, so no typed caller stores a value that serialization would drop.
 */
export type JsonValue =
	| null
	| boolean
	| number
	| string
	| JsonValue[]
	| { [key: string]: JsonValue };

export interface StateStore {
	/**
	 * Read the value last written for `id` and `key`. Resolves `undefined` when
	 * nothing was written, or when the stored value cannot be read faithfully.
	 */
	read(id: string, key: string): Promise<JsonValue | undefined>;

	/**
	 * Write `value` for `id` and `key`. Within one store instance the
	 * later-issued write survives, so rapid taps agree with the next read. A
	 * write that cannot persist — or a value that is not a JSON value — fails
	 * quietly and leaves any existing stored value in place.
	 */
	write(id: string, key: string, value: JsonValue): Promise<void>;
}
