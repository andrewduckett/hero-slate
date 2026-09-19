import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import CombatBlock from './CombatBlock.svelte';

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
