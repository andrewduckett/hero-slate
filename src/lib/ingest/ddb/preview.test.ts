import { describe, it, expect } from 'vitest';
import { renderPreview } from './preview';

describe('renderPreview', () => {
	it('draws a computed ability modifier', () => {
		const draft = { name: 'Sunny', abilities: [{ label: 'Dexterity', value: 20 }] };
		const lines = renderPreview(draft);
		const text = lines.join('\n');
		expect(text).toContain('Dexterity');
		expect(text).toContain('20');
		expect(text).toContain('+5');
	});

	it('draws combat entries', () => {
		const draft = { name: 'Sunny', combat: [{ label: 'Armor Class', value: 15 }] };
		const text = renderPreview(draft).join('\n');
		expect(text).toContain('Armor Class');
		expect(text).toContain('15');
	});

	it('draws hit points', () => {
		const draft = { name: 'Sunny', hitPoints: { max: 30 } };
		const text = renderPreview(draft).join('\n');
		expect(text).toContain('30');
	});

	it('leaves out an ability entry the app would drop', () => {
		const draft = {
			name: 'Sunny',
			abilities: [
				{ label: 'Strength', value: 14 },
				{ value: 10 }
			]
		};
		const text = renderPreview(draft).join('\n');
		expect(text).toContain('Strength');
		expect(text).not.toContain('10');
	});

	it('lists sections, but not pools, under Not previewed', () => {
		const draft = {
			name: 'Sunny',
			pools: [{ id: 'ki', label: 'Ki', max: 5 }],
			sections: [{ title: 'Your Turn', rows: [{ title: 'Attack', body: 'swipe!' }] }]
		};
		const text = renderPreview(draft).join('\n');
		expect(text).toMatch(/not previewed/i);
		expect(text).not.toContain('pools');
		expect(text).toContain('sections');
		expect(text).not.toContain('Your Turn');
		expect(text).not.toContain('swipe!');
	});

	it('draws a pool as its label followed by one dot per use', () => {
		const draft = { name: 'Sunny', pools: [{ id: 'focus', label: 'Focus Points', max: 6 }] };
		const text = renderPreview(draft).join('\n');
		expect(text).toContain('Focus Points');
		expect(text).toContain('o'.repeat(6));
	});

	it('does not draw a pool the app would drop', () => {
		const draft = { name: 'Sunny', pools: [{ id: 'sorcery', label: 'Sorcery Points', max: 13 }] };
		const text = renderPreview(draft).join('\n');
		expect(text).not.toContain('Sorcery Points');
	});

	it('draws the character name', () => {
		const text = renderPreview({ name: 'Sunny Thornwood' }).join('\n');
		expect(text).toContain('Sunny Thornwood');
	});

	it('uses ASCII borders with no right-hand border', () => {
		const draft = { name: '🐻‍❄️ Urven, the Silent Maw', abilities: [{ label: 'Dexterity', value: 20 }] };
		const lines = renderPreview(draft);
		expect(lines.length).toBeGreaterThan(0);
		for (const line of lines) {
			// A content line starts with a border character but never closes with one too —
			// there is no fixed-width right edge for an emoji name to misalign against.
			const trimmed = line.trimEnd();
			if (trimmed.length > 1) {
				expect(trimmed[trimmed.length - 1]).not.toMatch(/[|]/);
			}
		}
	});
});
