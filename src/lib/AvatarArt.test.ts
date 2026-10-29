import { describe, it, expect } from 'vitest';
import { render, fireEvent } from '@testing-library/svelte';
import { flushSync } from 'svelte';
import AvatarArt from './AvatarArt.svelte';

/** Render with `showing` bound to a plain variable, as `bind:showing` would. */
function renderBound(src: string | undefined) {
	const bound = { showing: false };
	const view = render(AvatarArt, {
		props: {
			src,
			get showing() {
				return bound.showing;
			},
			set showing(value: boolean) {
				bound.showing = value;
			}
		}
	});
	flushSync();
	return { ...view, bound };
}

describe('AvatarArt', () => {
	it('renders a decorative image for a source', () => {
		const { container } = render(AvatarArt, { props: { src: '/characters/test-hero.png' } });
		const img = container.querySelector('img');
		expect(img?.getAttribute('src')).toBe('/characters/test-hero.png');
		expect(img?.getAttribute('alt')).toBe('');
	});

	it('renders no element without a source', () => {
		const { container } = render(AvatarArt, { props: { src: undefined } });
		expect(container.innerHTML.replace(/<!---->/g, '').trim()).toBe('');
	});

	it('removes the image after it fails to load', async () => {
		const { container } = render(AvatarArt, { props: { src: '/characters/missing.png' } });
		await fireEvent.error(container.querySelector('img')!);
		expect(container.querySelector('img')).toBeNull();
	});

	it('reports showing while the image is in the DOM', () => {
		const { bound } = renderBound('/characters/test-hero.png');
		expect(bound.showing).toBe(true);
	});

	it('reports not showing without a source', () => {
		const { bound } = renderBound(undefined);
		expect(bound.showing).toBe(false);
	});

	it('reports not showing after the image fails to load', async () => {
		const { container, bound } = renderBound('/characters/missing.png');
		await fireEvent.error(container.querySelector('img')!);
		flushSync();
		expect(bound.showing).toBe(false);
	});
});
