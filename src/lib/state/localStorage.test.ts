import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createLocalStorageStore } from './localStorage';

describe('localStorage store — persistence and key layout', () => {
	beforeEach(() => {
		localStorage.clear();
	});

	it('survives a simulated reload (a fresh store instance reads the value)', async () => {
		await createLocalStorageStore().write('sunny', 'hp', 30);

		// A new instance stands in for a reload: it shares the same localStorage.
		const reloaded = createLocalStorageStore();
		expect(await reloaded.read('sunny', 'hp')).toBe(30);
	});

	it('uses one application-scoped storage key per id and key', async () => {
		const store = createLocalStorageStore();
		await store.write('sunny', 'hp', 30);

		expect(localStorage.length).toBe(1);
		const storageKey = localStorage.key(0) as string;
		// App-scoped so it never clashes with another app on the same origin.
		expect(storageKey.startsWith('hero-slate')).toBe(true);
	});

	it('maps each id and key to a distinct storage key (injective layout)', async () => {
		const store = createLocalStorageStore();
		await store.write('sunny', 'hp', 1);
		await store.write('ash', 'hp', 2);
		await store.write('sunny', 'pools', 3);

		expect(localStorage.length).toBe(3);
	});

	it('does not collide when a delimiter could run coordinates together', async () => {
		const store = createLocalStorageStore();
		// "a:b" + "c" and "a" + "b:c" would share a naive "a:b:c" combined key.
		await store.write('a:b', 'c', 'first');
		await store.write('a', 'b:c', 'second');

		expect(await store.read('a:b', 'c')).toBe('first');
		expect(await store.read('a', 'b:c')).toBe('second');
	});
});

describe('localStorage store — resilience', () => {
	beforeEach(() => {
		localStorage.clear();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('reads undefined when storage is unavailable or blocked', async () => {
		const store = createLocalStorageStore();
		vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
			throw new Error('blocked');
		});

		expect(await store.read('sunny', 'hp')).toBeUndefined();
	});

	it('treats a corrupt (non-JSON) stored value as absent', async () => {
		const store = createLocalStorageStore();
		await store.write('sunny', 'hp', 30);
		// Corrupt the stored value in place.
		const storageKey = localStorage.key(0) as string;
		localStorage.setItem(storageKey, 'not json {');

		expect(await store.read('sunny', 'hp')).toBeUndefined();
	});

	it('fails a write quietly when it cannot persist', async () => {
		const store = createLocalStorageStore();
		vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
			throw new Error('full');
		});

		await expect(store.write('sunny', 'hp', 30)).resolves.toBeUndefined();
	});

	it('treats a syntactically-JSON but non-finite stored value as absent', async () => {
		const store = createLocalStorageStore();
		await store.write('sunny', 'hp', 30);
		// 1e400 is valid JSON syntax but JSON.parse yields Infinity, not a JSON value.
		const storageKey = localStorage.key(0) as string;
		localStorage.setItem(storageKey, '1e400');

		expect(await store.read('sunny', 'hp')).toBeUndefined();
	});
});

describe('localStorage store — runtime JSON rejection', () => {
	beforeEach(() => {
		localStorage.clear();
	});

	it('rejects NaN and leaves the prior value in place', async () => {
		const store = createLocalStorageStore();
		await store.write('sunny', 'hp', 30);
		await store.write('sunny', 'hp', NaN as unknown as number);

		expect(await store.read('sunny', 'hp')).toBe(30);
	});

	it('persists nothing when a Date is written', async () => {
		const store = createLocalStorageStore();
		await store.write('sunny', 'hp', new Date() as unknown as number);

		expect(await store.read('sunny', 'hp')).toBeUndefined();
		expect(localStorage.length).toBe(0);
	});
});

describe('localStorage store — safe without a window', () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('constructs, reads, and writes without raising when localStorage throws on access', async () => {
		// Simulate a no-window / disabled-storage environment: the getter throws.
		const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
		Object.defineProperty(globalThis, 'localStorage', {
			configurable: true,
			get() {
				throw new Error('localStorage is not available');
			}
		});

		try {
			let store!: ReturnType<typeof createLocalStorageStore>;
			expect(() => {
				store = createLocalStorageStore();
			}).not.toThrow();

			await expect(store.read('sunny', 'hp')).resolves.toBeUndefined();
			await expect(store.write('sunny', 'hp', 30)).resolves.toBeUndefined();
		} finally {
			if (descriptor) {
				Object.defineProperty(globalThis, 'localStorage', descriptor);
			}
		}
	});
});
