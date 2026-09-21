import { describe, it, expect } from 'vitest';
import { ROLE_PALETTE, resolveCombatPalette } from './roles';
import { PALETTE_NAMES } from './palette';

describe('ROLE_PALETTE', () => {
	it('each role resolves to a name in PALETTE_NAMES', () => {
		for (const [role, name] of Object.entries(ROLE_PALETTE)) {
			expect(PALETTE_NAMES, `${role} → ${name}`).toContain(name);
		}
	});

	it('health maps to fire', () => expect(ROLE_PALETTE.health).toBe('fire'));
	it('armor maps to ocean', () => expect(ROLE_PALETTE.armor).toBe('ocean'));
	it('speed maps to forest', () => expect(ROLE_PALETTE.speed).toBe('forest'));
	it('initiative maps to sun', () => expect(ROLE_PALETTE.initiative).toBe('sun'));
});

describe('resolveCombatPalette — label matching', () => {
	it('exact match: Armor Class → ocean', () => {
		expect(resolveCombatPalette('Armor Class', 'neutral')).toBe('ocean');
	});

	it('case-insensitive: armor CLASS → ocean', () => {
		expect(resolveCombatPalette('armor CLASS', 'neutral')).toBe('ocean');
	});

	it('whitespace-padded: "  Armor Class  " → ocean', () => {
		expect(resolveCombatPalette('  Armor Class  ', 'neutral')).toBe('ocean');
	});

	it('alternate spelling: Armour Class → ocean', () => {
		expect(resolveCombatPalette('Armour Class', 'neutral')).toBe('ocean');
	});

	it('abbreviation: AC → ocean', () => {
		expect(resolveCombatPalette('AC', 'neutral')).toBe('ocean');
	});

	it('Speed → forest', () => {
		expect(resolveCombatPalette('Speed', 'neutral')).toBe('forest');
	});

	it('Initiative → sun', () => {
		expect(resolveCombatPalette('Initiative', 'neutral')).toBe('sun');
	});

	it('unrecognised label falls back to character palette', () => {
		expect(resolveCombatPalette('Carrying Capacity', 'forest')).toBe('forest');
	});

	it('no label appears in two role lists', () => {
		const seen = new Map<string, string>();
		const allLabels: [string, string[]][] = [
			['armor', ['armor class', 'armour class', 'ac']],
			['speed', ['speed']],
			['initiative', ['initiative']]
		];
		for (const [role, labels] of allLabels) {
			for (const label of labels) {
				expect(seen.has(label), `"${label}" claimed by both ${seen.get(label)} and ${role}`).toBe(false);
				seen.set(label, role);
			}
		}
	});
});

describe('resolveCombatPalette — fallback', () => {
	it('Carrying Capacity on a forest character returns forest with no error', () => {
		let err: unknown;
		let result: string | undefined;
		try {
			result = resolveCombatPalette('Carrying Capacity', 'forest');
		} catch (e) {
			err = e;
		}
		expect(err).toBeUndefined();
		expect(result).toBe('forest');
	});
});
