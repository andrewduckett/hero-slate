import { describe, it, expect } from 'vitest';
import { crosscheckDraft } from './crosscheck';
import type { Digest } from './digest';

function digest(overrides: Partial<Digest> = {}): Digest {
	return {
		name: 'Urven, the Silent Maw',
		classes: [{ name: 'Monk', level: 6 }],
		level: 6,
		abilities: { strength: 14, dexterity: 20, constitution: 16, intelligence: 10, wisdom: 14, charisma: 11 },
		armorClass: 17,
		armorClassReason: null,
		speed: 45,
		initiative: 5,
		hitPointsMax: 54,
		...overrides
	};
}

describe('crosscheckDraft', () => {
	it('warns on a level mismatch', () => {
		const warnings = crosscheckDraft({ level: 5 }, digest({ level: 6 }));
		expect(warnings.length).toBeGreaterThan(0);
	});

	it('does not warn when level matches', () => {
		const warnings = crosscheckDraft({ level: 6 }, digest({ level: 6 }));
		expect(warnings).toEqual([]);
	});

	it('matches an ability by its full name', () => {
		const draft = { abilities: [{ label: 'Dexterity', value: 18 }] };
		const warnings = crosscheckDraft(draft, digest());
		expect(warnings.length).toBeGreaterThan(0);
		expect(warnings.join(' ')).toMatch(/dexterity/i);
	});

	it('matches an ability by its abbreviation, case-insensitively', () => {
		const str = crosscheckDraft({ abilities: [{ label: 'Str', value: 10 }] }, digest());
		expect(str.length).toBeGreaterThan(0);

		const STR = crosscheckDraft({ abilities: [{ label: 'STR', value: 10 }] }, digest());
		expect(STR.length).toBeGreaterThan(0);
	});

	it('matches Armor Class written as AC', () => {
		const warnings = crosscheckDraft({ combat: [{ label: 'AC', value: 10 }] }, digest({ armorClass: 17 }));
		expect(warnings.length).toBeGreaterThan(0);
	});

	it('reads a signed initiative string as its number, with no false mismatch', () => {
		const warnings = crosscheckDraft({ combat: [{ label: 'Initiative', value: '+5' }] }, digest({ initiative: 5 }));
		expect(warnings).toEqual([]);
	});

	it('warns on a maximum hit points mismatch', () => {
		const warnings = crosscheckDraft({ hitPoints: { max: 40 } }, digest({ hitPointsMax: 54 }));
		expect(warnings.length).toBeGreaterThan(0);
	});

	it('skips a renamed label it does not recognize', () => {
		const warnings = crosscheckDraft({ abilities: [{ label: 'Quickness', value: 5 }] }, digest());
		expect(warnings).toEqual([]);
	});

	it('skips a digest fact that is null', () => {
		const warnings = crosscheckDraft(
			{ combat: [{ label: 'Armor Class', value: 10 }] },
			digest({ armorClass: null, armorClassReason: 'an unrecognized source' })
		);
		expect(warnings).toEqual([]);
	});

	it('never compares the name', () => {
		const warnings = crosscheckDraft({ name: 'Someone Else' }, digest({ name: 'Urven' }));
		expect(warnings).toEqual([]);
	});
});
