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

	it('renders valid resource pools', () => {
		render(CharacterView, {
			props: {
				result: { status: 'found', character: { ...sunny, pools: [{ id: 'magic', label: 'Magic', max: 2 }] } },
				storedPools: { magic: 1 }
			}
		});

		expect(screen.getByRole('button', { name: 'Magic: 1 remaining' })).toBeTruthy();
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

/** A character with every block, for the order and heading tests. */
const full: Character = {
	...sunny,
	abilities: [{ label: 'Strength', value: 10 }],
	combat: [{ label: 'Armor Class', value: 16 }],
	hitPoints: { max: 45 },
	pools: [{ id: 'magic', label: 'Magic', max: 2 }],
	sections: [{ title: 'Your Turn', rows: [{ title: 'Attack', body: 'Claws' }] }]
};

/** The `data-block` names in the sheet, in document order. */
function blockOrder(container: HTMLElement): string[] {
	return [...container.querySelectorAll('[data-block]')].map((el) => el.getAttribute('data-block') ?? '');
}

/** The group heading texts in the sheet, in document order. */
function groupHeadings(container: HTMLElement): string[] {
	return [...container.querySelectorAll('[data-group-heading]')].map((el) => el.textContent?.trim() ?? '');
}

describe('CharacterView: sheet block order', () => {
	it('renders a full character in the fixed order', () => {
		const { container } = render(CharacterView, { props: { result: { status: 'found', character: full } } });

		expect(blockOrder(container)).toEqual(['header', 'abilities', 'combat', 'hit-points', 'pools', 'sections']);
	});

	it('keeps the remaining blocks in order when the hit points tracker is missing', () => {
		const character: Character = { ...full, hitPoints: undefined };
		const { container } = render(CharacterView, { props: { result: { status: 'found', character } } });

		expect(blockOrder(container)).toEqual(['header', 'abilities', 'combat', 'pools', 'sections']);
		expect(container.querySelector('[aria-label="Hit points"]')).toBeNull();
	});

	it('renders the abilities before the hit points tracker', () => {
		const character: Character = { ...sunny, abilities: full.abilities, hitPoints: { max: 10 } };
		const { container } = render(CharacterView, { props: { result: { status: 'found', character } } });

		const abilities = container.querySelector('[data-block="abilities"]') as HTMLElement;
		const hitPoints = container.querySelector('[data-block="hit-points"]') as HTMLElement;
		expect(abilities).toBeTruthy();
		expect(hitPoints).toBeTruthy();
		expect(abilities.compareDocumentPosition(hitPoints) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
	});
});

describe('CharacterView: group headings', () => {
	it('shows Stats, Health, and Pools, in order, each directly before its group', () => {
		const { container } = render(CharacterView, { props: { result: { status: 'found', character: full } } });

		expect(groupHeadings(container)).toEqual(['Stats', 'Health', 'Pools']);

		const firstBlockAfter = (heading: string) => {
			const el = [...container.querySelectorAll('[data-group-heading]')].find(
				(h) => h.textContent?.trim() === heading
			) as HTMLElement;
			return el.nextElementSibling?.getAttribute('data-block');
		};
		expect(firstBlockAfter('Stats')).toBe('abilities');
		expect(firstBlockAfter('Health')).toBe('hit-points');
		expect(firstBlockAfter('Pools')).toBe('pools');
	});

	it('shows no Health heading when there are no hit points to track', () => {
		const character: Character = { ...full, hitPoints: undefined };
		const { container } = render(CharacterView, { props: { result: { status: 'found', character } } });

		expect(groupHeadings(container)).toEqual(['Stats', 'Pools']);
	});

	it('shows the Stats heading above the combat block when no abilities are valid', () => {
		const character: Character = { ...sunny, abilities: [null], combat: full.combat };
		const { container } = render(CharacterView, { props: { result: { status: 'found', character } } });

		expect(groupHeadings(container)).toEqual(['Stats']);
		const heading = container.querySelector('[data-group-heading]') as HTMLElement;
		expect(heading.nextElementSibling?.getAttribute('data-block')).toBe('combat');
	});

	it('shows no group headings for a character with only a name', () => {
		const { container } = render(CharacterView, { props: { result: { status: 'found', character: sunny } } });

		expect(groupHeadings(container)).toEqual([]);
	});
});
