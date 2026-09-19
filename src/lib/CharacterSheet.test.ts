import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/svelte';
import CharacterSheet from './CharacterSheet.svelte';
import type { CharacterProvider, GetCharacterResult } from '$lib/data/provider';
import type { JsonValue, StateStore } from '$lib/state/store';
import { createLocalStorageStore } from '$lib/state/localStorage';

function deferred<T>() {
	let resolve!: (value: T) => void;
	const promise = new Promise<T>((r) => {
		resolve = r;
	});
	return { promise, resolve };
}

/** A provider that returns the (possibly pending) result mapped to each id. */
function provider(map: Record<string, Promise<GetCharacterResult> | GetCharacterResult>): CharacterProvider {
	return { getCharacter: (id) => Promise.resolve(map[id]) };
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
	it('keeps the controls inert until the stored current resolves', async () => {
		const storedHp = deferred<JsonValue | undefined>();
		const store: StateStore = { read: () => storedHp.promise, write: vi.fn().mockResolvedValue(undefined) };
		render(CharacterSheet, {
			props: {
				id: 'sunny',
				provider: provider({ sunny: found('sunny', 'Sunny', { hitPoints: { max: 45 } }) }),
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
		const sunnyHp = deferred<JsonValue | undefined>();
		const store: StateStore = {
			read: (id) => (id === 'sunny' ? sunnyHp.promise : Promise.resolve(undefined)),
			write: vi.fn().mockResolvedValue(undefined)
		};
		const chars = provider({
			sunny: found('sunny', 'Sunny Thornwood', { hitPoints: { max: 45 } }),
			ash: found('ash', 'Ash Emberkin', { hitPoints: { max: 30 } })
		});

		const { rerender } = render(CharacterSheet, { props: { id: 'sunny', provider: chars, store } });

		// Navigate to Ash while Sunny's state read is still pending.
		await rerender({ id: 'ash', provider: chars, store });
		await waitFor(() => expect(screen.getByText('Ash Emberkin')).toBeTruthy());

		// Sunny's late state read now completes; it must not replace Ash.
		sunnyHp.resolve(12);
		await Promise.resolve();
		expect(screen.queryByText('Sunny Thornwood')).toBeNull();
		expect(screen.getByText('Ash Emberkin')).toBeTruthy();
	});

	it('does not overwrite a tap that follows a reduced-max load', async () => {
		// Store already holds 45; the author has since lowered max to 40.
		const store = createLocalStorageStore();
		localStorage.clear();
		await store.write('sunny', 'hp', 45);

		render(CharacterSheet, {
			props: {
				id: 'sunny',
				provider: provider({ sunny: found('sunny', 'Sunny', { hitPoints: { max: 40 } }) }),
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
		expect(await store.read('sunny', 'hp')).toBe(39);
	});
});

describe('CharacterSheet — combined-result guard (round-4)', () => {
	it("shows Ash, not Sunny, when Sunny's provider read resolves after navigation to Ash", async () => {
		const sunnyChar = deferred<GetCharacterResult>();
		const chars: CharacterProvider = {
			getCharacter: (id) =>
				id === 'sunny' ? sunnyChar.promise : Promise.resolve(found('ash', 'Ash Emberkin', { hitPoints: { max: 30 } }))
		};
		// Both ids' state reads resolve promptly; only Sunny's character read is slow.
		const store = readStore({ sunny: undefined, ash: undefined });

		const { rerender } = render(CharacterSheet, { props: { id: 'sunny', provider: chars, store } });

		await rerender({ id: 'ash', provider: chars, store });
		await waitFor(() => expect(screen.getByText('Ash Emberkin')).toBeTruthy());

		// Sunny's character read finally resolves; the guard must drop it.
		sunnyChar.resolve(found('sunny', 'Sunny Thornwood', { hitPoints: { max: 45 } }));
		await Promise.resolve();
		expect(screen.queryByText('Sunny Thornwood')).toBeNull();
		expect(screen.getByText('Ash Emberkin')).toBeTruthy();
	});
});
