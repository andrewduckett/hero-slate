import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import CharacterView from './CharacterView.svelte';
import type { Character } from '$lib/types';

const sunny: Character = { id: 'sunny', name: 'Sunny Thornwood', level: 6, class: 'Druid' };

describe('CharacterView', () => {
	it('renders the name and descriptor for a found result', () => {
		render(CharacterView, { props: { result: { status: 'found', character: sunny } } });

		expect(screen.getByText('Sunny Thornwood')).toBeTruthy();
		expect(screen.getByText('Level 6 Druid')).toBeTruthy();
	});

	it('themes the header with the resolved palette accent and on-accent', () => {
		const { container } = render(CharacterView, {
			props: { result: { status: 'found', character: { ...sunny, color: 'forest' } } }
		});

		const root = container.querySelector('[data-palette]') as HTMLElement;
		expect(root.getAttribute('data-palette')).toBe('forest');

		const header = container.querySelector('header') as HTMLElement;
		expect(header.style.backgroundColor).toContain('var(--accent)');
		expect(header.style.color).toContain('var(--on-accent)');
	});

	it('falls back to the neutral palette for an unknown or missing color', () => {
		const unknown = render(CharacterView, {
			props: { result: { status: 'found', character: { ...sunny, color: 'rainbow' } } }
		});
		expect(unknown.container.querySelector('[data-palette]')?.getAttribute('data-palette')).toBe(
			'neutral'
		);

		const missing = render(CharacterView, {
			props: { result: { status: 'found', character: sunny } }
		});
		expect(missing.container.querySelector('[data-palette]')?.getAttribute('data-palette')).toBe(
			'neutral'
		);
	});

	it('renders the identity header, then the abilities block, then the combat block', () => {
		const character: Character = {
			...sunny,
			abilities: [{ label: 'Strength', value: 10 }],
			combat: [{ label: 'Armor Class', value: 16 }]
		};
		const { container } = render(CharacterView, {
			props: { result: { status: 'found', character } }
		});

		const article = container.querySelector('article') as HTMLElement;
		const header = article.querySelector('header') as HTMLElement;
		const abilities = article.querySelector('[aria-label="Abilities"]') as HTMLElement;
		const combat = article.querySelector('[aria-label="Combat"]') as HTMLElement;

		expect(header).toBeTruthy();
		expect(abilities).toBeTruthy();
		expect(combat).toBeTruthy();

		// Header precedes abilities, which precedes combat, in document order.
		expect(header.compareDocumentPosition(abilities) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
		expect(abilities.compareDocumentPosition(combat) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
	});

	it('renders the header with neither block, and no error, for malformed stat data', () => {
		const character: Character = {
			...sunny,
			abilities: [null, 3, { value: 10 }], // all invalid members
			combat: { armorClass: 16 } // not a list
		};

		expect(() =>
			render(CharacterView, { props: { result: { status: 'found', character } } })
		).not.toThrow();

		const { container } = render(CharacterView, {
			props: { result: { status: 'found', character } }
		});
		expect(container.querySelector('header')).toBeTruthy();
		expect(container.querySelector('[aria-label="Abilities"]')).toBeNull();
		expect(container.querySelector('[aria-label="Combat"]')).toBeNull();
	});

	it('renders the name alone when the descriptor is empty', () => {
		const nameOnly: Character = { id: 'x', name: 'Nameless One' };
		render(CharacterView, { props: { result: { status: 'found', character: nameOnly } } });

		expect(screen.getByText('Nameless One')).toBeTruthy();
		expect(screen.queryByText('Level')).toBeNull();
	});

	it('shows a generic message for not-found without echoing the id', () => {
		render(CharacterView, { props: { result: { status: 'not-found' } } });

		expect(screen.getByText('Character not found')).toBeTruthy();
	});

	it('shows the same generic message for invalid', () => {
		render(CharacterView, { props: { result: { status: 'invalid', reason: 'bad id' } } });

		expect(screen.getByText('Character not found')).toBeTruthy();
		// The reason must not leak to the page.
		expect(screen.queryByText(/bad id/)).toBeNull();
	});

	it('shows a retry message for a transient error', () => {
		render(CharacterView, { props: { result: { status: 'error' } } });

		expect(screen.getByText('Could not load this character. Try again.')).toBeTruthy();
	});
});
