import { describe, it, expect, beforeEach } from 'vitest';
import { createLocalStorageStore } from './localStorage';

// The interface contract, pinned against the concrete localStorage store. Any
// implementation of `StateStore` must satisfy these: a written value reads back,
// an unwritten id/key reads `undefined`, and distinct ids and keys never collide.
describe('StateStore contract', () => {
	beforeEach(() => {
		localStorage.clear();
	});

	it('reads back a written value for the same id and key', async () => {
		const store = createLocalStorageStore();
		await store.write('sunny', 'hp', 30);

		expect(await store.read('sunny', 'hp')).toBe(30);
	});

	it('reads undefined when nothing was written for the id and key', async () => {
		const store = createLocalStorageStore();

		expect(await store.read('sunny', 'hp')).toBeUndefined();
	});

	it('never collides across distinct ids and keys', async () => {
		const store = createLocalStorageStore();
		await store.write('sunny', 'hp', 1);
		await store.write('sunny', 'pools', 2);
		await store.write('ash', 'hp', 3);

		expect(await store.read('sunny', 'hp')).toBe(1);
		expect(await store.read('sunny', 'pools')).toBe(2);
		expect(await store.read('ash', 'hp')).toBe(3);
	});
});
