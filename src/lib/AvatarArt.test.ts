import { describe, it, expect } from 'vitest';
import { render, fireEvent } from '@testing-library/svelte';
import { flushSync } from 'svelte';
import AvatarArt from './AvatarArt.svelte';

/** Render with `showing` bound to a plain variable, as `bind:showing` would. */
function renderBound(avatar: unknown) {
	const bound = { showing: false };
	const view = render(AvatarArt, {
		props: {
			avatar,
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
	it('renders a decorative image for a site-path avatar', () => {
		const { container } = render(AvatarArt, { props: { avatar: '/characters/test-hero.png' } });
		const img = container.querySelector('img');
		expect(img?.getAttribute('src')).toBe('/characters/test-hero.png');
		expect(img?.getAttribute('alt')).toBe('');
	});

	it.each<[string, unknown]>([
		['a remote URL', 'https://example.test/hero.png'],
		['the empty string', ''],
		['undefined', undefined]
	])('renders no element for %s', (_label, avatar) => {
		const { container } = render(AvatarArt, { props: { avatar } });
		expect(container.innerHTML.replace(/<!---->/g, '').trim()).toBe('');
	});

	it('removes the image after it fails to load', async () => {
		const { container } = render(AvatarArt, { props: { avatar: '/characters/missing.png' } });
		await fireEvent.error(container.querySelector('img')!);
		expect(container.querySelector('img')).toBeNull();
	});

	it('reports showing while the image is in the DOM', () => {
		const { bound } = renderBound('/characters/test-hero.png');
		expect(bound.showing).toBe(true);
	});

	it('reports not showing for an avatar that does not resolve', () => {
		const { bound } = renderBound('https://example.test/hero.png');
		expect(bound.showing).toBe(false);
	});

	it('reports not showing after the image fails to load', async () => {
		const { container, bound } = renderBound('/characters/missing.png');
		await fireEvent.error(container.querySelector('img')!);
		flushSync();
		expect(bound.showing).toBe(false);
	});
});
