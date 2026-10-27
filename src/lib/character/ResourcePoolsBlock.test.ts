import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/svelte';
import ResourcePoolsBlock from './ResourcePoolsBlock.svelte';
import type { StateStore } from '#lib/state/store';

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
				id: 'test-hero'
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
			props: { pools: [{ id: 'magic', label: 'Magic', max: 4 }], storedPools: { magic: 2 }, store: state, id: 'test-hero' }
		});
		state.write.mockClear();

		await fireEvent.click(screen.getByRole('button', { name: 'Magic: 1 remaining' }));
		expect(state.write).toHaveBeenLastCalledWith('test-hero', 'pools', { magic: 0 });

		await fireEvent.click(screen.getByRole('button', { name: 'Magic: 4 remaining' }));
		expect(state.write).toHaveBeenLastCalledWith('test-hero', 'pools', { magic: 4 });
	});

	it('keeps earlier pool changes in a rapid later save', async () => {
		const state = store();
		render(ResourcePoolsBlock, {
			props: {
				pools: [{ id: 'wild-shape', label: 'Wild Shape', max: 2 }, { id: 'magic', label: 'Magic', max: 4 }],
				storedPools: undefined, store: state, id: 'test-hero'
			}
		});
		state.write.mockClear();

		await fireEvent.click(screen.getByRole('button', { name: 'Wild Shape: 1 remaining' }));
		await fireEvent.click(screen.getByRole('button', { name: 'Magic: 3 remaining' }));
		expect(state.write).toHaveBeenLastCalledWith('test-hero', 'pools', { 'wild-shape': 0, magic: 2 });
	});

	it('keeps clamped controls usable after a correction write fails', async () => {
		const state = store();
		state.write.mockRejectedValue(new Error('storage unavailable'));
		render(ResourcePoolsBlock, {
			props: { pools: [{ id: 'magic', label: 'Magic', max: 2 }], storedPools: { magic: 4 }, store: state, id: 'test-hero' }
		});

		expect(screen.getByRole('button', { name: 'Magic: 2 remaining' })).toBeTruthy();
		await fireEvent.click(screen.getByRole('button', { name: 'Magic: 1 remaining' }));
		expect(state.write).toHaveBeenLastCalledWith('test-hero', 'pools', { magic: 0 });
	});

	describe('form', () => {
		it('draws a pool of 12 uses as dots', () => {
			const { container } = render(ResourcePoolsBlock, {
				props: { pools: [{ id: 'ki', label: 'Ki', max: 12 }], storedPools: undefined, store: store(), id: 'test-hero' }
			});

			expect(container.querySelectorAll('[data-pool-dot]')).toHaveLength(12);
			expect(container.querySelector('[data-pool-form]')?.getAttribute('data-pool-form')).toBe('dots');
			expect(container.querySelector('[data-pool-adjust]')).toBeNull();
		});

		it('draws a pool of 13 uses as a counter', () => {
			const { container } = render(ResourcePoolsBlock, {
				props: { pools: [{ id: 'lay-on-hands', label: 'Lay On Hands', max: 13 }], storedPools: undefined, store: store(), id: 'test-hero' }
			});

			expect(container.querySelector('[data-pool-form]')?.getAttribute('data-pool-form')).toBe('counter');
			expect(container.querySelector('.readout')?.textContent?.replace(/\s+/g, ' ').trim()).toBe('13 / 13');
			expect(container.querySelector('[data-pool-dot]')).toBeNull();
		});

		it('marks no card with a dot size', () => {
			const { container } = render(ResourcePoolsBlock, {
				props: { pools: [{ id: 'focus', label: 'Focus Points', max: 7 }], storedPools: undefined, store: store(), id: 'test-hero' }
			});

			expect(container.querySelector('[data-pool-size]')).toBeNull();
		});
	});

	describe('counter', () => {
		function renderCounter(stored: unknown = undefined, state = store()) {
			return render(ResourcePoolsBlock, {
				props: { pools: [{ id: 'lay-on-hands', label: 'Lay On Hands', max: 35 }], storedPools: stored, store: state, id: 'test-hero' }
			});
		}

		it('is a group named for the pool and its remaining uses', () => {
			renderCounter();

			expect(screen.getByRole('group', { name: 'Lay On Hands: 35 remaining' })).toBeTruthy();
		});

		it('has a progress bar named for the pool', () => {
			renderCounter();

			const bar = screen.getByRole('progressbar', { name: 'Lay On Hands' });
			expect(bar.getAttribute('aria-valuenow')).toBe('35');
			expect(bar.getAttribute('aria-valuemin')).toBe('0');
			expect(bar.getAttribute('aria-valuemax')).toBe('35');
		});

		it('offers spend and restore controls in order, each named for the pool', () => {
			const { container } = renderCounter();

			const controls = [...container.querySelectorAll('[data-pool-adjust]')];
			expect(controls.map((control) => control.getAttribute('aria-label'))).toEqual([
				'Lay On Hands: -5',
				'Lay On Hands: -1',
				'Lay On Hands: +1',
				'Lay On Hands: +5'
			]);
			expect(controls.map((control) => control.getAttribute('data-pool-adjust'))).toEqual(['-5', '-1', '+1', '+5']);
		});

		it.each([
			['spends uses', 35, 'Lay On Hands: -5', 30],
			['stops spending at zero', 3, 'Lay On Hands: -5', 0],
			['stops restoring at the maximum', 33, 'Lay On Hands: +5', 35]
		])('%s', async (_name, stored, control, expected) => {
			const state = store();
			const { container } = renderCounter({ 'lay-on-hands': stored }, state);
			state.write.mockClear();

			await fireEvent.click(screen.getByRole('button', { name: control }));

			expect(container.querySelector('.readout')?.textContent?.replace(/\s+/g, ' ').trim()).toBe(`${expected} / 35`);
			expect(state.write).toHaveBeenLastCalledWith('test-hero', 'pools', { 'lay-on-hands': expected });
		});

		it('looks the same at zero uses', () => {
			renderCounter({ 'lay-on-hands': 0 });

			const counter = screen.getByRole('group', { name: 'Lay On Hands: 0 remaining' });
			expect([...counter.attributes].map((attribute) => attribute.name).filter((name) => name.endsWith('-state'))).toEqual([]);
			expect(counter.style.opacity).toBe('');
		});

		it('offers no reset or rest control', () => {
			renderCounter();

			expect(screen.queryByRole('button', { name: /reset|rest(?!o)/i })).toBeNull();
		});

		it('keeps a dot change in a rapid counter save', async () => {
			const state = store();
			render(ResourcePoolsBlock, {
				props: {
					pools: [{ id: 'lay-on-hands', label: 'Lay On Hands', max: 35 }, { id: 'channel', label: 'Channel Divinity', max: 2 }],
					storedPools: undefined, store: state, id: 'test-hero'
				}
			});
			state.write.mockClear();

			await fireEvent.click(screen.getByRole('button', { name: 'Channel Divinity: 2 remaining' }));
			await fireEvent.click(screen.getByRole('button', { name: 'Lay On Hands: -1' }));
			expect(state.write).toHaveBeenLastCalledWith('test-hero', 'pools', { 'lay-on-hands': 34, channel: 1 });
		});

		it('keeps a stored count when the maximum crosses the dot limit', () => {
			const { container } = render(ResourcePoolsBlock, {
				props: { pools: [{ id: 'lay-on-hands', label: 'Lay On Hands', max: 20 }], storedPools: { 'lay-on-hands': 8 }, store: store(), id: 'test-hero' }
			});

			expect(container.querySelector('.readout')?.textContent?.replace(/\s+/g, ' ').trim()).toBe('8 / 20');
		});
	});
});
