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
