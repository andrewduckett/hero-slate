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
