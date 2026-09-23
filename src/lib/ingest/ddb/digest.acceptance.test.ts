import { describe, it, expect } from 'vitest';
import { computeDigest } from './digest';
import urven from './fixtures/urven.json';

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
	});
});
