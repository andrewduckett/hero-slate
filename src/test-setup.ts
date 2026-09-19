// Test-environment setup: provide a Web Storage API.
//
// The jsdom environment in this project ships without `localStorage`, so the
// per-device state store has nothing to exercise. This installs a minimal
// in-memory `Storage` implementation on the global, matching the browser API the
// store depends on (`getItem`, `setItem`, `removeItem`, `clear`, `key`,
// `length`). Tests spy on `Storage.prototype` and read `localStorage` directly,
// so both the class and the instance live on the global.

class MemoryStorage {
	#entries = new Map<string, string>();

	get length(): number {
		return this.#entries.size;
	}

	key(index: number): string | null {
		return [...this.#entries.keys()][index] ?? null;
	}

	getItem(key: string): string | null {
		return this.#entries.has(key) ? (this.#entries.get(key) as string) : null;
	}

	setItem(key: string, value: string): void {
		this.#entries.set(String(key), String(value));
	}

	removeItem(key: string): void {
		this.#entries.delete(key);
	}

	clear(): void {
		this.#entries.clear();
	}
}

// jsdom defines a `Storage` class but forbids constructing it and ships no
// `localStorage` instance. Replace it with the in-memory implementation so tests
// can construct instances and spy on `Storage.prototype`.
const globalRef = globalThis as unknown as {
	Storage: unknown;
	localStorage: Storage;
};

globalRef.Storage = MemoryStorage;
globalRef.localStorage = new MemoryStorage() as unknown as Storage;
