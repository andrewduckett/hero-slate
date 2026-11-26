import { describe, it, expect } from 'vitest';
import { listChanges } from './changes';

const IDENTITY = { name: 'Sunny Thornwood', level: 7, class: 'Druid', color: 'forest' };

describe('listChanges — fields', () => {
	it('reports a changed level with its saved and draft values', () => {
		expect(listChanges(IDENTITY, { ...IDENTITY, level: 8 })).toEqual(['  - changed level: 7 → 8']);
	});

	it('says No changes when the draft has the same content as the saved file', () => {
		expect(listChanges(IDENTITY, { ...IDENTITY })).toEqual(['  - No changes']);
	});

	it('reports an unknown top-level block the draft adds, with its value', () => {
		expect(listChanges(IDENTITY, { ...IDENTITY, notes: 'Owes Pip a biscuit' })).toEqual([
			'  - added notes: "Owes Pip a biscuit"'
		]);
	});

	it('reports a top-level field the draft removes, with its saved value', () => {
		const { class: _removed, ...withoutClass } = IDENTITY;
		expect(listChanges(IDENTITY, withoutClass)).toEqual(['  - removed class: "Druid"']);
	});

	it('reports a changed hit point maximum by its own key', () => {
		const saved = { ...IDENTITY, hitPoints: { max: 52 } };
		expect(listChanges(saved, { ...IDENTITY, hitPoints: { max: 60 } })).toEqual([
			'  - changed hitPoints.max: 52 → 60'
		]);
	});
});

describe('listChanges — list entries', () => {
	const abilities = [
		{ label: 'Strength', value: 8 },
		{ label: 'Wisdom', value: 20 }
	];

	it('reports a renamed ability label as one removal and one addition', () => {
		const draft = { abilities: [abilities[0], { label: 'Wits', value: 20 }] };
		expect(listChanges({ abilities }, draft)).toEqual([
			'  - removed "Wisdom" from abilities',
			'  - added "Wits" to abilities'
		]);
	});

	const wildShape = { id: 'wild-shape', label: 'Wild Shape', max: 3 };

	it('reports a changed field of a pool matched by its id', () => {
		const draft = { pools: [{ ...wildShape, max: 4 }] };
		expect(listChanges({ pools: [wildShape] }, draft)).toEqual(['  - changed pool wild-shape max: 3 → 4']);
	});

	it('reports a pool the draft adds by its id', () => {
		const draft = { pools: [wildShape, { id: 'slots-5', label: '5th Level', max: 1 }] };
		expect(listChanges({ pools: [wildShape] }, draft)).toEqual(['  - added pool slots-5']);
	});

	it('lists an added link the app would drop, matched by its url', () => {
		const draft = { links: [{ label: 'Map', url: 'http://example.com/map' }] };
		expect(listChanges({}, draft)).toEqual(['  - added link http://example.com/map']);
	});

	it('reports a changed combat value matched by its label', () => {
		const saved = { combat: [{ label: 'Speed', value: 30 }] };
		expect(listChanges(saved, { combat: [{ label: 'Speed', value: 35 }] })).toEqual([
			'  - changed "Speed" in combat value: 30 → 35'
		]);
	});

	it('pairs entries that share a key in their order', () => {
		const saved = { abilities: [{ label: 'Luck', value: 1 }, { label: 'Luck', value: 2 }] };
		const draft = { abilities: [{ label: 'Luck', value: 1 }, { label: 'Luck', value: 3 }] };
		expect(listChanges(saved, draft)).toEqual(['  - changed "Luck" in abilities value: 2 → 3']);
	});
});
