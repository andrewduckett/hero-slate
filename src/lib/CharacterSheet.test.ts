import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/svelte';
import CharacterSheet from './CharacterSheet.svelte';
import type { CharacterProvider, GetCharacterResult } from '#lib/data/provider';
import type { JsonValue, StateStore } from '#lib/state/store';
import { createLocalStorageStore } from '#lib/state/localStorage';

function deferred<T>() {
	let resolve!: (value: T) => void;
	const promise = new Promise<T>((r) => {
		resolve = r;
	});
	return { promise, resolve };
}

/** A provider that returns the (possibly pending) result mapped to each id. */
function provider(map: Record<string, Promise<GetCharacterResult> | GetCharacterResult>): CharacterProvider {
	return {
		getCharacter: (id) => Promise.resolve(map[id]),
		listCharacters: () => Promise.resolve({ status: 'found', characters: [] })
	};
}

/** A store whose "hp" read for each id is the mapped value, and whose writes are spied. */
function readStore(
	hp: Record<string, Promise<JsonValue | undefined> | JsonValue | undefined>
): StateStore & { write: ReturnType<typeof vi.fn> } {
	return {
		read: (id) => Promise.resolve(hp[id]),
		write: vi.fn().mockResolvedValue(undefined)
	};
}

function found(id: string, name: string, extra: Record<string, unknown> = {}): GetCharacterResult {
	return { status: 'found', character: { id, name, ...extra } };
}

describe('CharacterSheet — load lifecycle', () => {
	it('waits for pool state before rendering pool controls', async () => {
		const pools = deferred<JsonValue | undefined>();
		const store: StateStore = {
			read: (_id, key) => (key === 'pools' ? pools.promise : Promise.resolve(undefined)),
			write: vi.fn().mockResolvedValue(undefined)
		};
		render(CharacterSheet, {
			props: {
				id: 'test-hero',
				provider: provider({ 'test-hero': found('test-hero', 'Test Hero', { pools: [{ id: 'magic', label: 'Magic', max: 2 }] }) }),
				store
			}
		});

		await Promise.resolve();
		expect(screen.queryByRole('button', { name: 'Magic: 1 remaining' })).toBeNull();

		pools.resolve({ magic: 1 });
		await waitFor(() => expect(screen.getByRole('button', { name: 'Magic: 1 remaining' })).toBeTruthy());
	});

	it('keeps the controls inert until the stored current resolves', async () => {
		const storedHp = deferred<JsonValue | undefined>();
		const store: StateStore = { read: () => storedHp.promise, write: vi.fn().mockResolvedValue(undefined) };
		render(CharacterSheet, {
			props: {
				id: 'test-hero',
				provider: provider({ 'test-hero': found('test-hero', 'Test Hero', { hitPoints: { max: 45 } }) }),
				store
			}
		});

		// The character read has resolved, but the state read has not: still loading.
		await Promise.resolve();
		expect(screen.queryByRole('progressbar')).toBeNull();

		storedHp.resolve(undefined);
		await waitFor(() => expect(screen.getByRole('progressbar')).toBeTruthy());
	});

	it('discards a late state read for a previous id after the route id changes', async () => {
		const testHeroHp = deferred<JsonValue | undefined>();
		const store: StateStore = {
			read: (id) => (id === 'test-hero' ? testHeroHp.promise : Promise.resolve(undefined)),
			write: vi.fn().mockResolvedValue(undefined)
		};
		const chars = provider({
			'test-hero': found('test-hero', 'Test Hero', { hitPoints: { max: 45 } }),
			'other-hero': found('other-hero', 'Other Hero', { hitPoints: { max: 30 } })
		});

		const { rerender } = render(CharacterSheet, { props: { id: 'test-hero', provider: chars, store } });

		// Navigate to Other Hero while Test Hero's state read is still pending.
		await rerender({ id: 'other-hero', provider: chars, store });
		await waitFor(() => expect(screen.getByText('Other Hero')).toBeTruthy());

		// Test Hero's late state read now completes; it must not replace Other Hero.
		testHeroHp.resolve(12);
		await Promise.resolve();
		expect(screen.queryByText('Test Hero')).toBeNull();
		expect(screen.getByText('Other Hero')).toBeTruthy();
	});

	it('does not overwrite a tap that follows a reduced-max load', async () => {
		// Store already holds 45; the author has since lowered max to 40.
		const store = createLocalStorageStore();
		localStorage.clear();
		await store.write('test-hero', 'hp', 45);

		render(CharacterSheet, {
			props: {
				id: 'test-hero',
				provider: provider({ 'test-hero': found('test-hero', 'Test Hero', { hitPoints: { max: 40 } }) }),
				store
			}
		});

		// After load the tracker clamps to 40/40 and writes that back.
		await waitFor(() => expect(screen.getByRole('progressbar')).toBeTruthy());
		const readout = () => document.querySelector('.readout')?.textContent?.replace(/\s+/g, ' ').trim();
		expect(readout()).toBe('40 / 40');

		// A tap issued after the write-back must win on the next read.
		await fireEvent.click(document.querySelector('[data-hp-adjust="-1"]') as HTMLElement);
		await waitFor(() => expect(readout()).toBe('39 / 40'));
		expect(await store.read('test-hero', 'hp')).toBe(39);
	});
});

describe('CharacterSheet — combined-result guard (round-4)', () => {
	it("shows Other Hero, not Test Hero, when Test Hero's provider read resolves after navigation to Other Hero", async () => {
		const testHeroChar = deferred<GetCharacterResult>();
		const chars: CharacterProvider = {
			getCharacter: (id) =>
				id === 'test-hero' ? testHeroChar.promise : Promise.resolve(found('other-hero', 'Other Hero', { hitPoints: { max: 30 } })),
			listCharacters: () => Promise.resolve({ status: 'found', characters: [] })
		};
		// Both ids' state reads resolve promptly; only Test Hero's character read is slow.
		const store = readStore({ 'test-hero': undefined, 'other-hero': undefined });

		const { rerender } = render(CharacterSheet, { props: { id: 'test-hero', provider: chars, store } });

		await rerender({ id: 'other-hero', provider: chars, store });
		await waitFor(() => expect(screen.getByText('Other Hero')).toBeTruthy());

		// Test Hero's character read finally resolves; the guard must drop it.
		testHeroChar.resolve(found('test-hero', 'Test Hero', { hitPoints: { max: 45 } }));
		await Promise.resolve();
		expect(screen.queryByText('Test Hero')).toBeNull();
		expect(screen.getByText('Other Hero')).toBeTruthy();
	});
});
