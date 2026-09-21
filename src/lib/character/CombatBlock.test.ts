import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import CombatBlock from './CombatBlock.svelte';
import { ROLE_PALETTE } from '$lib/theme/roles';

describe('CombatBlock', () => {
	it('renders each label with its value (string verbatim, finite number as its value)', () => {
		const { container } = render(CombatBlock, {
			props: {
				combat: [
					{ label: 'Armor Class', value: 16 },
					{ label: 'Speed', value: 30 },
					{ label: 'Initiative', value: '+2' }
				]
			}
		});

		const rows = container.querySelectorAll('.combat-entry');
		expect(rows).toHaveLength(3);

		const labels = [...rows].map((row) => row.querySelector('.label')?.textContent);
		expect(labels).toEqual(['Armor Class', 'Speed', 'Initiative']);

		const values = [...rows].map((row) => row.querySelector('.value')?.textContent);
		expect(values).toEqual(['16', '30', '+2']);
	});

	it('shows an em dash for a non-renderable value', () => {
		const { container } = render(CombatBlock, {
			props: { combat: [{ label: 'Armor Class', value: null }] }
		});

		expect(container.querySelector('.value')?.textContent).toBe('—');
	});

	it('renders nothing when the resolved list is empty', () => {
		const { container } = render(CombatBlock, {
			props: { combat: [null, 7, { value: 16 }] }
		});

		expect(container.querySelector('.combat')).toBeNull();
		expect(container.querySelector('.combat-entry')).toBeNull();
	});

	it('renders an authored value as text, not markup', () => {
		const { container } = render(CombatBlock, {
			props: { combat: [{ label: 'Armor Class', value: '<img src=x>' }] }
		});

		expect(screen.getByText('<img src=x>')).toBeTruthy();
		expect(container.querySelector('img')).toBeNull();
	});
});

describe('CombatBlock — palette roles', () => {
	it("sets armor to ocean, speed to forest, and initiative to sun on a forest character", () => {
		const { container } = render(CombatBlock, {
			props: {
				combat: [
					{ label: 'Armor Class', value: 16 },
					{ label: 'Speed', value: 30 },
					{ label: 'Initiative', value: '+2' }
				],
				palette: 'forest'
			}
		});

		const rows = [...container.querySelectorAll('.combat-entry')];
		expect(rows).toHaveLength(3);
		expect(rows[0].getAttribute('data-palette')).toBe(ROLE_PALETTE.armor);
		expect(rows[1].getAttribute('data-palette')).toBe(ROLE_PALETTE.speed);
		expect(rows[2].getAttribute('data-palette')).toBe(ROLE_PALETTE.initiative);
	});

	it('an unrecognised label falls back to the character palette', () => {
		const { container } = render(CombatBlock, {
			props: {
				combat: [{ label: 'Carrying Capacity', value: 150 }],
				palette: 'forest'
			}
		});

		const entry = container.querySelector('.combat-entry');
		expect(entry?.getAttribute('data-palette')).toBe('forest');
		expect(entry?.querySelector('.label')?.textContent).toBe('Carrying Capacity');
		expect(entry?.querySelector('.value')?.textContent).toBe('150');
	});
});
