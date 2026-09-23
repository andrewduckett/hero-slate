import { describe, it, expect } from 'vitest';
import { computeDigest } from './digest';
import urven from './fixtures/urven.json';
import zip from './fixtures/zip.json';

describe('computeDigest — Urven acceptance', () => {
	it('digests Urven\'s recorded D&D Beyond response', () => {
		const result = computeDigest(urven);

		expect(result.status).toBe('ok');
		if (result.status !== 'ok') return;

		expect(result.digest.level).toBe(6);
		expect(result.digest.abilities).toEqual({
			strength: 14,
			dexterity: 20,
			constitution: 16,
			intelligence: 10,
			wisdom: 14,
			charisma: 11
		});
		expect(result.digest.armorClass).toBe(17);
		expect(result.digest.speed).toBe(45);
		expect(result.digest.initiative).toBe(5);
		expect(result.digest.hitPointsMax).toBe(54);

		expect(result.digest.limitedUses).toEqual([
			{ name: 'Focus Points', source: 'class', max: 6, maxReason: null, reset: 'short rest' },
			{ name: 'Uncanny Metabolism', source: 'class', max: 1, maxReason: null, reset: 'long rest' },
			{ name: 'Stillness of Kaurth', source: 'feat', max: 2, maxReason: null, reset: 'long rest' },
			{ name: 'Jump', source: 'feat', max: 1, maxReason: null, reset: 'long rest' }
		]);
		expect(result.digest.spellSlots).toEqual([]);
		expect(result.digest.pactMagic).toBeNull();
	});
});

describe('computeDigest — Zip acceptance', () => {
	it("digests Zip's recorded D&D Beyond response", () => {
		const result = computeDigest(zip);

		expect(result.status).toBe('ok');
		if (result.status !== 'ok') return;

		expect(result.digest.spellSlots).toEqual([{ level: 1, slots: 3 }]);
		expect(result.digest.pactMagic).toBeNull();

		expect(result.digest.limitedUses).toContainEqual({
			name: 'Fury of the Small',
			source: 'species',
			max: 2,
			maxReason: null,
			reset: 'long rest'
		});
		expect(result.digest.limitedUses).toContainEqual({
			name: 'Arcane Recovery',
			source: 'class',
			max: 1,
			maxReason: null,
			reset: 'long rest'
		});
		expect(result.digest.limitedUses).toContainEqual({
			name: 'Find Familiar',
			source: 'feat',
			max: 1,
			maxReason: null,
			reset: 'long rest'
		});
		const names = result.digest.limitedUses.map((u) => u.name);
		expect(names).not.toContain('Freedom of Movement');
		expect(names).not.toContain('Grease');
	});
});
