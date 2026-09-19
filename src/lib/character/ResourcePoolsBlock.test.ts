import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/svelte';
import ResourcePoolsBlock from './ResourcePoolsBlock.svelte';
import type { StateStore } from '$lib/state/store';

function store(): StateStore & { write: ReturnType<typeof vi.fn> } {
	return { read: vi.fn().mockResolvedValue(undefined), write: vi.fn().mockResolvedValue(undefined) };
}

describe('ResourcePoolsBlock', () => {
	it('renders labeled filled and empty dot controls', () => {
		render(ResourcePoolsBlock, {
			props: {
				pools: [{ id: 'magic', label: 'Magic', color: 'ocean', max: 4 }],
				storedPools: { magic: 2 },
				store: store(),
				id: 'sunny'
			}
		});

		expect(screen.getByText('Magic')).toBeTruthy();
		expect(screen.getByRole('button', { name: 'Magic: 1 remaining' }).getAttribute('data-pool-dot')).toBe('filled');
		expect(screen.getByRole('button', { name: 'Magic: 3 remaining' }).getAttribute('data-pool-dot')).toBe('empty');
		expect(screen.queryByRole('button', { name: /reset|rest/i })).toBeNull();
	});

	it('sets the remaining uses from a selected dot', async () => {
		const state = store();
		render(ResourcePoolsBlock, {
			props: { pools: [{ id: 'magic', label: 'Magic', max: 4 }], storedPools: { magic: 2 }, store: state, id: 'sunny' }
		});
		state.write.mockClear();

		await fireEvent.click(screen.getByRole('button', { name: 'Magic: 1 remaining' }));
		expect(state.write).toHaveBeenLastCalledWith('sunny', 'pools', { magic: 0 });

		await fireEvent.click(screen.getByRole('button', { name: 'Magic: 4 remaining' }));
		expect(state.write).toHaveBeenLastCalledWith('sunny', 'pools', { magic: 4 });
	});

	it('keeps earlier pool changes in a rapid later save', async () => {
		const state = store();
		render(ResourcePoolsBlock, {
			props: {
				pools: [{ id: 'wild-shape', label: 'Wild Shape', max: 2 }, { id: 'magic', label: 'Magic', max: 4 }],
				storedPools: undefined, store: state, id: 'sunny'
			}
		});
		state.write.mockClear();

		await fireEvent.click(screen.getByRole('button', { name: 'Wild Shape: 1 remaining' }));
		await fireEvent.click(screen.getByRole('button', { name: 'Magic: 3 remaining' }));
		expect(state.write).toHaveBeenLastCalledWith('sunny', 'pools', { 'wild-shape': 0, magic: 2 });
	});

	it('keeps clamped controls usable after a correction write fails', async () => {
		const state = store();
		state.write.mockRejectedValue(new Error('storage unavailable'));
		render(ResourcePoolsBlock, {
			props: { pools: [{ id: 'magic', label: 'Magic', max: 2 }], storedPools: { magic: 4 }, store: state, id: 'sunny' }
		});

		expect(screen.getByRole('button', { name: 'Magic: 2 remaining' })).toBeTruthy();
		await fireEvent.click(screen.getByRole('button', { name: 'Magic: 1 remaining' }));
		expect(state.write).toHaveBeenLastCalledWith('sunny', 'pools', { magic: 0 });
	});
});
