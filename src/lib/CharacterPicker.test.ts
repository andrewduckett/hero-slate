import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import CharacterPicker from './CharacterPicker.svelte';
import type { CharacterProvider, CharacterSummary, ListCharactersResult } from '#lib/data/provider';

/** A provider whose listing returns the given (possibly pending) result. */
function listing(result: Promise<ListCharactersResult> | ListCharactersResult): CharacterProvider {
	return {
		getCharacter: () => Promise.resolve({ status: 'not-found' }),
		listCharacters: () => Promise.resolve(result)
	};
}

function found(...characters: CharacterSummary[]): CharacterProvider {
	return listing({ status: 'found', characters });
}

const sunny: CharacterSummary = { id: 'sunny', name: 'Sunny Thornwood', level: 7, class: 'Druid', color: 'forest' };
const gimdak: CharacterSummary = { id: 'gimdak', name: 'Gimdak Steelward', level: 5, class: 'Fighter' };
const urven: CharacterSummary = { id: 'urven', name: 'Urven, the Silent Maw' };

describe('CharacterPicker', () => {
	it('shows the home header in the neutral palette', () => {
		const { container } = render(CharacterPicker, { props: { provider: found() } });

		const header = container.querySelector('[data-block="header"]');
		expect(header?.getAttribute('data-palette')).toBe('neutral');
		expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Hero Slate');
		expect(screen.getByText('Choose your hero')).toBeTruthy();
	});

	it('shows no avatar in the home header', async () => {
		const withAvatar: CharacterSummary = { id: 'test-hero', name: 'Test Hero', avatar: '/characters/test-hero.png' };
		const { container } = render(CharacterPicker, { props: { provider: found(withAvatar) } });

		await screen.findByText('Test Hero');
		expect(container.querySelector('[data-block="header"] img')).toBeNull();
	});

	it('shows Loading… and no cards while the listing is pending', () => {
		render(CharacterPicker, { props: { provider: listing(new Promise(() => {})) } });

		expect(screen.getByText('Loading…')).toBeTruthy();
		expect(screen.queryAllByRole('listitem')).toHaveLength(0);
	});

	it('shows one card per summary in listing order', async () => {
		render(CharacterPicker, { props: { provider: found(sunny, gimdak, urven) } });

		const cards = await screen.findAllByRole('listitem');
		expect(cards.map((card) => card.querySelector('[data-card-name]')?.textContent)).toEqual([
			'Sunny Thornwood',
			'Gimdak Steelward',
			'Urven, the Silent Maw'
		]);
	});

	it('shows the descriptor line beneath the name', async () => {
		render(CharacterPicker, { props: { provider: found(sunny) } });

		expect(await screen.findByText('Level 7 Druid')).toBeTruthy();
	});

	it('shows no descriptor element for a character without level or class', async () => {
		const { container } = render(CharacterPicker, { props: { provider: found(urven) } });

		await screen.findByText('Urven, the Silent Maw');
		expect(container.querySelector('[data-card-descriptor]')).toBeNull();
	});

	it('renders an authored name as text, not markup', async () => {
		const { container } = render(CharacterPicker, {
			props: { provider: found({ id: 'test-hero', name: '<b>x</b>' }) }
		});

		expect(await screen.findByText('<b>x</b>')).toBeTruthy();
		expect(container.querySelector('li b')).toBeNull();
	});

	it('links each card to its sheet, named after the character', async () => {
		render(CharacterPicker, { props: { provider: found(sunny) } });

		const link = await screen.findByRole('link', { name: /Sunny Thornwood/ });
		expect(link.getAttribute('href')).toBe('/sunny');
	});

	it.each([
		['a known color', 'forest', 'forest'],
		['an unknown color', 'rainbow', 'neutral'],
		['no color', undefined, 'neutral']
	])('gives a card with %s the resolved palette', async (_label, color, palette) => {
		render(CharacterPicker, { props: { provider: found({ id: 'test-hero', name: 'Test Hero', color }) } });

		const card = await screen.findByRole('listitem');
		expect(card.getAttribute('data-palette')).toBe(palette);
	});

	it('shows a retry message and no cards when the listing fails', async () => {
		render(CharacterPicker, { props: { provider: listing({ status: 'error' }) } });

		expect(await screen.findByText('Could not load characters. Try again.')).toBeTruthy();
		expect(screen.queryAllByRole('listitem')).toHaveLength(0);
	});

	it('shows an empty message and no cards for an empty roster', async () => {
		render(CharacterPicker, { props: { provider: found() } });

		expect(await screen.findByText('No characters yet.')).toBeTruthy();
		expect(screen.queryAllByRole('listitem')).toHaveLength(0);
	});

	it('removes Loading… once the listing resolves', async () => {
		render(CharacterPicker, { props: { provider: found(sunny) } });

		await screen.findByRole('listitem');
		expect(screen.queryByText('Loading…')).toBeNull();
	});

	describe('card avatar', () => {
		const hero: CharacterSummary = { id: 'test-hero', name: 'Test Hero', avatar: '/characters/test-hero.png' };

		it('shows the image for a summary with an avatar', async () => {
			render(CharacterPicker, { props: { provider: found(hero) } });

			const card = await screen.findByRole('listitem');
			const img = card.querySelector('img');
			expect(img?.getAttribute('src')).toBe('/characters/test-hero.png');
			expect(img?.getAttribute('alt')).toBe('');
		});

		it('shows no image for a summary without an avatar', async () => {
			render(CharacterPicker, { props: { provider: found({ id: 'test-hero', name: 'Test Hero' }) } });

			const card = await screen.findByRole('listitem');
			expect(card.querySelector('img')).toBeNull();
		});

		it('drops the image after it fails to load', async () => {
			render(CharacterPicker, { props: { provider: found({ ...hero, avatar: '/characters/missing.png' }) } });

			const card = await screen.findByRole('listitem');
			await fireEvent.error(card.querySelector('img')!);
			expect(card.querySelector('img')).toBeNull();
			expect(card.querySelector('a')?.hasAttribute('data-avatar')).toBe(false);
		});

		it('marks the card with data-avatar while the image shows', async () => {
			render(CharacterPicker, { props: { provider: found(hero) } });

			const card = await screen.findByRole('listitem');
			expect(card.querySelector('a')?.hasAttribute('data-avatar')).toBe(true);
		});

		it("keeps the link's accessible name to the character's own text", async () => {
			render(CharacterPicker, { props: { provider: found({ ...hero, level: 3, class: 'Bard' }) } });

			expect(await screen.findByRole('link', { name: 'Test Hero Level 3 Bard' })).toBeTruthy();
		});
	});
});
