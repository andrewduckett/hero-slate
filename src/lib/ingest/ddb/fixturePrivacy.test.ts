import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { blankFixture, findPersonalFields } from './fixturePrivacy';

/** A hand-written recorded response with every personal field set, plus game data the tests need to survive. */
function recordedResponse(overrides: Record<string, unknown> = {}): unknown {
	return {
		id: 0,
		success: true,
		message: 'Character successfully received.',
		pagination: null,
		data: {
			id: 159173087,
			userId: 100157836,
			username: 'someone',
			decorations: {
				avatarUrl: 'https://example.com/avatar.png',
				frameAvatarUrl: 'https://example.com/frame.png',
				defaultBackdrop: {
					backdropAvatarUrl: 'https://example.com/backdrop.jpeg',
					smallBackdropAvatarUrl: 'https://example.com/small.jpeg'
				},
				themeColor: { themeColorId: 432, themeColor: '#79853c', name: 'Druid Moss' }
			},
			campaign: { id: 2783850, name: 'Eberron' },
			notes: { backstory: 'A long story.', allies: 'Friends', otherNotes: null },
			traits: { personalityTraits: 'Curious', ideals: null },
			gender: 'she/her',
			faith: 'The Green',
			age: '32',
			hair: 'Brown',
			eyes: 'Green',
			skin: 'Tan',
			height: "5'4\"",
			weight: '120 lb',
			name: 'Sunny Thornwood',
			classSpells: [{ characterClassId: 1, spells: [{ definition: { name: 'Thorn Whip' } }] }],
			...overrides
		}
	};
}

function data(body: unknown): Record<string, unknown> {
	return (body as { data: Record<string, unknown> }).data;
}

describe('blankFixture', () => {
	it('sets username to an empty string and userId to 0', () => {
		const blanked = data(blankFixture(recordedResponse()));
		expect(blanked.username).toBe('');
		expect(blanked.userId).toBe(0);
	});

	it('sets campaign to null', () => {
		const blanked = data(blankFixture(recordedResponse()));
		expect(blanked.campaign).toBeNull();
	});

	it('sets every decorations field to null except themeColor, including defaultBackdrop', () => {
		const blanked = data(blankFixture(recordedResponse())).decorations as Record<string, unknown>;
		expect(blanked.avatarUrl).toBeNull();
		expect(blanked.frameAvatarUrl).toBeNull();
		expect(blanked.defaultBackdrop).toEqual({ backdropAvatarUrl: null, smallBackdropAvatarUrl: null });
		expect(blanked.themeColor).toEqual({ themeColorId: 432, themeColor: '#79853c', name: 'Druid Moss' });
	});

	it('sets every notes and traits field to null', () => {
		const blanked = data(blankFixture(recordedResponse()));
		expect(blanked.notes).toEqual({ backstory: null, allies: null, otherNotes: null });
		expect(blanked.traits).toEqual({ personalityTraits: null, ideals: null });
	});

	it('sets the eight description fields to null', () => {
		const blanked = data(blankFixture(recordedResponse()));
		for (const field of ['gender', 'faith', 'age', 'hair', 'eyes', 'skin', 'height', 'weight']) {
			expect(blanked[field]).toBeNull();
		}
	});

	it('leaves a spell list and every other field unchanged', () => {
		const blanked = data(blankFixture(recordedResponse()));
		expect(blanked.name).toBe('Sunny Thornwood');
		expect(blanked.id).toBe(159173087);
		expect(blanked.classSpells).toEqual([
			{ characterClassId: 1, spells: [{ definition: { name: 'Thorn Whip' } }] }
		]);
	});
});

describe('findPersonalFields', () => {
	it('names the field for a username that is set', () => {
		const found = findPersonalFields(recordedResponse());
		expect(found).toContain('username');
	});

	it('names the field for a set notes.backstory', () => {
		const found = findPersonalFields(recordedResponse());
		expect(found).toContain('notes.backstory');
	});

	it('finds nothing in a blanked response', () => {
		const found = findPersonalFields(blankFixture(recordedResponse()));
		expect(found).toEqual([]);
	});
});

describe('the recorded fixtures', () => {
	const fixturesDir = join(__dirname, 'fixtures');
	const files = readdirSync(fixturesDir).filter((name) => name.endsWith('.json'));

	it.each(files)('%s carries no personal data', (file) => {
		const body = JSON.parse(readFileSync(join(fixturesDir, file), 'utf8'));
		const found = findPersonalFields(body);
		expect(found, `${file} has personal fields set: ${found.join(', ')}`).toEqual([]);
	});
});
