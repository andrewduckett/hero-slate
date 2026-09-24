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
		limitedUses: [],
		spellSlots: [],
		spellSlotsReason: null,
		pactMagic: null,
		pactMagicReason: null,
		skills: [],
		actions: [],
		spells: [],
		spellcasting: [],
		...overrides
	};
}

function pool(label: string, max: number, id = label.toLowerCase().replace(/\s+/g, '-')) {
	return { id, label, max };
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

	it('gives no cross-check warning for a stale skill pill in a section', () => {
		const draft = {
			sections: [{ title: 'Strengths', rows: [{ title: 'Understanding', body: 'understanding, [[+6]] bonus' }] }]
		};
		const warnings = crosscheckDraft(
			draft,
			digest({ skills: [{ name: 'Insight', ability: 'Wisdom', proficiency: 'proficient', bonus: 5, bonusReason: null }] })
		);
		expect(warnings).toEqual([]);
	});
});

describe('crosscheckDraft — pools', () => {
	const focusPoints = { name: 'Focus Points', source: 'class' as const, max: 6, maxReason: null, reset: 'short rest' as const };

	it('warns on a stale limited-use maximum, matched case-insensitively', () => {
		const warnings = crosscheckDraft(
			{ pools: [pool('focus points', 5)] },
			digest({ limitedUses: [focusPoints] })
		);
		expect(warnings.length).toBe(1);
		expect(warnings[0]).toContain('5');
		expect(warnings[0]).toContain('6');
	});

	it('skips a renamed pool that does not match any limited use', () => {
		const warnings = crosscheckDraft({ pools: [pool('Ki', 5)] }, digest({ limitedUses: [focusPoints] }));
		expect(warnings).toEqual([]);
	});

	it.each(['L1 Slots', 'level 1 slots', 'Level 1 Spell Slots', '1st Level Slots', '1ST LEVEL SPELL SLOTS'])(
		'matches the slot label form %s',
		(label) => {
			const warnings = crosscheckDraft(
				{ pools: [pool(label, 2)] },
				digest({ spellSlots: [{ level: 1, slots: 3 }] })
			);
			expect(warnings.length).toBe(1);
			expect(warnings[0]).toContain('2');
			expect(warnings[0]).toContain('3');
		}
	);

	it.each(['Slots', 'L10 Slots', '1th Level Slots'])('skips the non-slot-label %s', (label) => {
		const warnings = crosscheckDraft({ pools: [pool(label, 2)] }, digest({ spellSlots: [{ level: 1, slots: 3 }] }));
		expect(warnings).toEqual([]);
	});

	it('compares a missing slot level as zero', () => {
		const warnings = crosscheckDraft(
			{ pools: [pool('L2 Slots', 2)] },
			digest({ spellSlots: [{ level: 1, slots: 3 }] })
		);
		expect(warnings.length).toBe(1);
		expect(warnings[0]).toContain('2');
		expect(warnings[0]).toContain('0');
	});

	it('skips slot pools when spellSlots is unknown', () => {
		const warnings = crosscheckDraft(
			{ pools: [pool('L1 Slots', 2)] },
			digest({ spellSlots: null, spellSlotsReason: 'multiclass slots are not computed' })
		);
		expect(warnings).toEqual([]);
	});

	it.each(['Pact Slots', 'Pact Magic'])('matches the pact label %s', (label) => {
		const warnings = crosscheckDraft(
			{ pools: [pool(label, 1)] },
			digest({ pactMagic: { level: 3, slots: 2 } })
		);
		expect(warnings.length).toBe(1);
		expect(warnings[0]).toContain('1');
		expect(warnings[0]).toContain('2');
	});

	it('gives no pool warnings and does not crash for a digest with no pool facts', () => {
		const { limitedUses, spellSlots, spellSlotsReason, pactMagic, pactMagicReason, ...rest } = digest();
		const oldDigest = rest as Digest;
		const warnings = crosscheckDraft(
			{ pools: [pool('Focus Points', 6), pool('L1 Slots', 3), pool('Pact Slots', 1)] },
			oldDigest
		);
		expect(warnings).toEqual([]);
	});
});
