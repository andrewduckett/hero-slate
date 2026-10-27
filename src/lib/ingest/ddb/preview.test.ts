import { describe, it, expect } from 'vitest';
import { renderPreview } from './preview';

describe('renderPreview', () => {
	it('draws a computed ability modifier', () => {
		const draft = { name: 'Test Hero', abilities: [{ label: 'Dexterity', value: 20 }] };
		const lines = renderPreview(draft);
		const text = lines.join('\n');
		expect(text).toContain('Dexterity');
		expect(text).toContain('20');
		expect(text).toContain('+5');
	});

	it('draws combat entries', () => {
		const draft = { name: 'Test Hero', combat: [{ label: 'Armor Class', value: 15 }] };
		const text = renderPreview(draft).join('\n');
		expect(text).toContain('Armor Class');
		expect(text).toContain('15');
	});

	it('draws hit points', () => {
		const draft = { name: 'Test Hero', hitPoints: { max: 30 } };
		const text = renderPreview(draft).join('\n');
		expect(text).toContain('30');
	});

	it('leaves out an ability entry the app would drop', () => {
		const draft = {
			name: 'Test Hero',
			abilities: [
				{ label: 'Strength', value: 14 },
				{ value: 10 }
			]
		};
		const text = renderPreview(draft).join('\n');
		expect(text).toContain('Strength');
		expect(text).not.toContain('10');
	});

	it('lists an unrecognized block, but not pools or sections, under Not previewed', () => {
		const draft = {
			name: 'Test Hero',
			pools: [{ id: 'ki', label: 'Ki', max: 5 }],
			sections: [{ title: 'Your Turn', rows: [{ title: 'Attack', body: 'swipe!' }] }],
			notes: 'a top-level block the preview does not know'
		};
		const text = renderPreview(draft).join('\n');
		expect(text).toMatch(/not previewed/i);
		expect(text).toContain('notes');
		expect(text).not.toContain('pools');
		const notPreviewedLine = text.split('\n').find((line) => /not previewed/i.test(line)) ?? '';
		expect(notPreviewedLine).not.toContain('sections');
		expect(text).toContain('Your Turn');
		expect(text).toContain('swipe!');
	});

	it('draws a section with its palette name and a row keeping its pill', () => {
		const draft = {
			name: 'Test Hero',
			sections: [
				{
					title: 'Strengths',
					color: 'forest',
					rows: [{ title: 'Quick & Sneaky', body: 'flips and sneaking, [[+8]] bonus' }]
				}
			]
		};
		const text = renderPreview(draft).join('\n');
		expect(text).toContain('Strengths');
		expect(text).toContain('forest');
		expect(text).toContain('Quick & Sneaky');
		expect(text).toContain('flips and sneaking, [[+8]] bonus');
	});

	it('does not draw a row with no body', () => {
		const draft = {
			name: 'Test Hero',
			sections: [
				{
					title: 'Strengths',
					rows: [
						{ title: 'Has body', body: 'a prompt' },
						{ title: 'No body' }
					]
				}
			]
		};
		const text = renderPreview(draft).join('\n');
		expect(text).toContain('Has body');
		expect(text).not.toContain('No body');
	});

	it('draws a pool as its label followed by one dot per use', () => {
		const draft = { name: 'Test Hero', pools: [{ id: 'focus', label: 'Focus Points', max: 6 }] };
		const text = renderPreview(draft).join('\n');
		expect(text).toContain('Focus Points');
		expect(text).toContain('o'.repeat(6));
	});

	it('does not draw a pool the app would drop', () => {
		const draft = { name: 'Test Hero', pools: [{ id: 'sorcery', label: 'Sorcery Points', max: 101 }] };
		const text = renderPreview(draft).join('\n');
		expect(text).not.toContain('Sorcery Points');
	});

	it('draws the character name', () => {
		const text = renderPreview({ name: 'Test Hero' }).join('\n');
		expect(text).toContain('Test Hero');
	});

	it('uses ASCII borders with no right-hand border', () => {
		const draft = { name: '🐻‍❄️ Test Hero, the Brave', abilities: [{ label: 'Dexterity', value: 20 }] };
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

	it("draws a link as its label, the character's palette, and its URL", () => {
		const draft = {
			name: 'Test Hero',
			color: 'ocean',
			links: [{ label: '📜 D&D Beyond', url: 'https://www.dndbeyond.com/characters/154922980' }]
		};
		const text = renderPreview(draft).join('\n');
		expect(text).toContain('📜 D&D Beyond (ocean): https://www.dndbeyond.com/characters/154922980');
	});

	it('draws a link with no label as its hostname', () => {
		const draft = { name: 'Test Hero', links: [{ url: 'https://www.dndbeyond.com/spells' }] };
		const text = renderPreview(draft).join('\n');
		expect(text).toContain('www.dndbeyond.com (neutral): https://www.dndbeyond.com/spells');
	});

	it("draws a link's own palette over the character's", () => {
		const draft = {
			name: 'Test Hero',
			color: 'ocean',
			links: [{ label: 'Map', url: 'https://example.com/map', color: 'forest' }]
		};
		const text = renderPreview(draft).join('\n');
		expect(text).toContain('Map (forest): https://example.com/map');
	});

	it('draws links in authored order', () => {
		const draft = {
			name: 'Test Hero',
			links: [
				{ label: 'Sheet', url: 'https://www.dndbeyond.com/characters/1' },
				{ label: 'Spells', url: 'https://www.dndbeyond.com/spells' },
				{ label: 'Map', url: 'https://example.com/map' }
			]
		};
		const text = renderPreview(draft).join('\n');
		const positions = ['Sheet (', 'Spells (', 'Map ('].map((label) => text.indexOf(label));
		expect(positions.every((p) => p >= 0)).toBe(true);
		expect(positions).toEqual([...positions].sort((a, b) => a - b));
	});

	it('does not draw a link the app would drop', () => {
		const draft = { name: 'Test Hero', links: [{ label: 'Bad', url: 'javascript:alert(1)' }] };
		const text = renderPreview(draft).join('\n');
		expect(text).not.toContain('alert');
		expect(text).not.toContain('Bad');
	});

	it('draws links after sections', () => {
		const draft = {
			name: 'Test Hero',
			sections: [{ title: 'Your Turn', rows: [{ body: 'swipe!' }] }],
			links: [{ label: 'Sheet', url: 'https://www.dndbeyond.com/characters/1' }]
		};
		const text = renderPreview(draft).join('\n');
		expect(text.indexOf('| Links')).toBeGreaterThan(text.indexOf('| Sections'));
	});

	it('does not list links under Not previewed', () => {
		const draft = {
			name: 'Test Hero',
			links: [{ label: 'Sheet', url: 'https://www.dndbeyond.com/characters/1' }],
			notes: 'a top-level block the preview does not know'
		};
		const text = renderPreview(draft).join('\n');
		const notPreviewedLine = text.split('\n').find((line) => /not previewed/i.test(line)) ?? '';
		expect(notPreviewedLine).toContain('notes');
		expect(notPreviewedLine).not.toContain('links');
	});
});
