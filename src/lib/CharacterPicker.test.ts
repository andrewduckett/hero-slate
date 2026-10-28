import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/svelte';
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
});
