import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import HitPointsBlock from './HitPointsBlock.svelte';
import type { StateStore } from '$lib/state/store';

/** A store spy whose reads and writes resolve immediately. */
function fakeStore(): StateStore & { write: ReturnType<typeof vi.fn> } {
	return {
		read: vi.fn().mockResolvedValue(undefined),
		write: vi.fn().mockResolvedValue(undefined)
	};
}

function normalize(text: string | null | undefined): string {
	return (text ?? '').replace(/\s+/g, ' ').trim();
}

describe('HitPointsBlock — rendering', () => {
	it('shows the readout, the progress bar, and the four adjustment controls', () => {
		const { container } = render(HitPointsBlock, {
			props: { hitPoints: { max: 45 }, storedCurrent: 30, store: fakeStore(), id: 'sunny' }
		});

		expect(normalize(container.querySelector('.readout')?.textContent)).toBe('30 / 45');

		const bar = screen.getByRole('progressbar');
		expect(bar.getAttribute('aria-valuenow')).toBe('30');
		expect(bar.getAttribute('aria-valuemin')).toBe('0');
		expect(bar.getAttribute('aria-valuemax')).toBe('45');

		for (const amount of ['-5', '-1', '+1', '+5']) {
			expect(container.querySelector(`[data-hp-adjust="${amount}"]`)).toBeTruthy();
		}
	});

	it('renders no reset control', () => {
		const { container } = render(HitPointsBlock, {
			props: { hitPoints: { max: 45 }, storedCurrent: 30, store: fakeStore(), id: 'sunny' }
		});

		expect(container.querySelector('[data-hp-adjust="reset"]')).toBeNull();
		expect(screen.queryByRole('button', { name: /reset/i })).toBeNull();
	});

	it('renders no tracker when the character has no hit points to track', () => {
		const { container } = render(HitPointsBlock, {
			props: { hitPoints: { max: 0 }, storedCurrent: undefined, store: fakeStore(), id: 'sunny' }
		});

		expect(container.querySelector('.hit-points')).toBeNull();
		expect(screen.queryByRole('progressbar')).toBeNull();
	});
});

describe('HitPointsBlock — adjustment, persistence, and the down state', () => {
	it('adjusts current and clamps within 0..max', async () => {
		const { container } = render(HitPointsBlock, {
			props: { hitPoints: { max: 45 }, storedCurrent: 30, store: fakeStore(), id: 'sunny' }
		});

		await fireEvent.click(container.querySelector('[data-hp-adjust="-5"]') as HTMLElement);
		expect(normalize(container.querySelector('.readout')?.textContent)).toBe('25 / 45');
	});

	it('clamps a down-tap at zero', async () => {
		const { container } = render(HitPointsBlock, {
			props: { hitPoints: { max: 45 }, storedCurrent: 3, store: fakeStore(), id: 'sunny' }
		});

		await fireEvent.click(container.querySelector('[data-hp-adjust="-5"]') as HTMLElement);
		expect(normalize(container.querySelector('.readout')?.textContent)).toBe('0 / 45');
	});

	it('clamps an up-tap at max', async () => {
		const { container } = render(HitPointsBlock, {
			props: { hitPoints: { max: 45 }, storedCurrent: 43, store: fakeStore(), id: 'sunny' }
		});

		await fireEvent.click(container.querySelector('[data-hp-adjust="+5"]') as HTMLElement);
		expect(normalize(container.querySelector('.readout')?.textContent)).toBe('45 / 45');
	});

	it('persists the new current through the store under the "hp" key', async () => {
		const store = fakeStore();
		const { container } = render(HitPointsBlock, {
			props: { hitPoints: { max: 45 }, storedCurrent: 30, store, id: 'sunny' }
		});

		await fireEvent.click(container.querySelector('[data-hp-adjust="-5"]') as HTMLElement);
		expect(store.write).toHaveBeenCalledWith('sunny', 'hp', 25);
	});

	it('does not block the on-screen change when a write fails', async () => {
		const store: StateStore = {
			read: vi.fn().mockResolvedValue(undefined),
			write: vi.fn().mockRejectedValue(new Error('write failed'))
		};
		const { container } = render(HitPointsBlock, {
			props: { hitPoints: { max: 45 }, storedCurrent: 30, store, id: 'sunny' }
		});

		await fireEvent.click(container.querySelector('[data-hp-adjust="-1"]') as HTMLElement);
		expect(normalize(container.querySelector('.readout')?.textContent)).toBe('29 / 45');
	});

	it('applies the down state with reduced opacity at zero and clears it above zero', async () => {
		const { container } = render(HitPointsBlock, {
			props: { hitPoints: { max: 45 }, storedCurrent: 1, store: fakeStore(), id: 'sunny' }
		});

		const tracker = container.querySelector('.hit-points') as HTMLElement;
		expect(tracker.getAttribute('data-hp-state')).toBeNull();

		await fireEvent.click(container.querySelector('[data-hp-adjust="-5"]') as HTMLElement);
		expect(tracker.getAttribute('data-hp-state')).toBe('down');
		expect(Number(tracker.style.opacity)).toBeLessThan(1);

		await fireEvent.click(container.querySelector('[data-hp-adjust="+1"]') as HTMLElement);
		expect(tracker.getAttribute('data-hp-state')).toBeNull();
		expect(tracker.style.opacity === '' || Number(tracker.style.opacity) === 1).toBe(true);
	});
});
