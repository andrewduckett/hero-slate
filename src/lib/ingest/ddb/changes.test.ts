import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { listChanges, lostCommentWarnings, poolResetWarnings } from './changes';

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

	it('reports an added top-level block whose name is also an Object property, such as toString', () => {
		expect(listChanges({ name: 'Sunny' }, { name: 'Sunny', toString: 'x' })).toEqual(['  - added toString: "x"']);
	});

	it('reports a removed top-level block whose name is also an Object property, such as toString', () => {
		expect(listChanges({ name: 'Sunny', toString: 'x' }, { name: 'Sunny' })).toEqual(['  - removed toString: "x"']);
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

describe('listChanges — sections and rows', () => {
	const attack = { title: 'Attack', body: 'claws' };
	const cast = { title: 'Cast a Spell', body: 'a prepared spell' };
	const help = { title: 'Help', body: 'heal a friend' };
	const yourTurn = { title: 'Your Turn', color: 'berry', rows: [attack, cast, help] };
	const strengths = { title: 'Strengths', color: 'forest', rows: [{ title: 'Sneaking', body: 'moving quietly' }] };

	it('reports a removed row by its title and its section', () => {
		const draft = { sections: [{ ...yourTurn, rows: [attack, cast] }] };
		expect(listChanges({ sections: [yourTurn] }, draft)).toEqual(['  - removed row "Help" from section "Your Turn"']);
	});

	it('reports swapped sections as one new-order line', () => {
		const saved = { sections: [strengths, yourTurn] };
		expect(listChanges(saved, { sections: [yourTurn, strengths] })).toEqual(['  - the order of sections changed']);
	});

	it('reports swapped rows as one new-order line that names the section', () => {
		const draft = { sections: [{ ...yourTurn, rows: [cast, attack, help] }] };
		expect(listChanges({ sections: [yourTurn] }, draft)).toEqual([
			'  - the order of rows in section "Your Turn" changed'
		]);
	});

	it('reports an added section as one line, without its rows', () => {
		const draft = { sections: [yourTurn, strengths] };
		expect(listChanges({ sections: [yourTurn] }, draft)).toEqual(['  - added section "Strengths"']);
	});

	it.each([
		['an empty', ''],
		['a null', null]
	])('matches a row with %s title by its body, as the app reads it', (_, title) => {
		const noteA = { title, body: 'Note A' };
		const noteB = { title, body: 'Note B' };
		const saved = { sections: [{ ...yourTurn, rows: [noteA, noteB] }] };
		const draft = { sections: [{ ...yourTurn, rows: [noteB] }] };
		expect(listChanges(saved, draft)).toEqual(['  - removed row "Note A" from section "Your Turn"']);
	});

	it('matches a row with no title by its body', () => {
		const note = { body: 'Pip hides in your hood' };
		const saved = { sections: [{ ...yourTurn, rows: [attack, note] }] };
		const draft = { sections: [{ ...yourTurn, rows: [attack, { ...note, color: 'ocean' }] }] };
		expect(listChanges(saved, draft)).toEqual([
			'  - changed row "Pip hides in your hood" in section "Your Turn" color: (none) → "ocean"'
		]);
	});
});

describe('poolResetWarnings', () => {
	const wildShape = { id: 'wild-shape', label: 'Wild Shape', max: 3 };

	it('warns that a renamed pool id resets its remaining uses on every device', () => {
		expect(poolResetWarnings({ pools: [wildShape] }, { pools: [{ ...wildShape, id: 'wildshape' }] })).toEqual([
			'the pool id "wild-shape" is gone: every device forgets its remaining uses, and a pool with a new id starts full'
		]);
	});

	it('warns about a removed pool by its id', () => {
		const slots = { id: 'spell-slots-4', label: '4th Level', max: 1 };
		const [warning] = poolResetWarnings({ pools: [slots, wildShape] }, { pools: [wildShape] });
		expect(warning).toContain('"spell-slots-4" is gone');
	});

	it('gives no warning when only a pool maximum changes', () => {
		expect(poolResetWarnings({ pools: [wildShape] }, { pools: [{ ...wildShape, max: 4 }] })).toEqual([]);
	});
});

describe('lostCommentWarnings', () => {
	const sunny = readFileSync('static/characters/sunny.yaml', 'utf8');
	const avatarLine =
		'# Avatar: Gemini 4 Argon, 2026-10-29. Look: wood elf, auburn hair, leaf circlet, fox kit Pip on shoulder.';

	it('quotes the avatar provenance comment when the draft drops it', () => {
		const draft = sunny.replace(`${avatarLine}\n`, '');
		expect(lostCommentWarnings(sunny, draft)).toEqual([`the comment "${avatarLine}" is missing from the draft`]);
	});

	it('gives no warning when the draft keeps every comment and changes only level', () => {
		expect(lostCommentWarnings(sunny, sunny.replace('level: 7', 'level: 8'))).toEqual([]);
	});

	it('does not read a # inside a scalar as a comment', () => {
		expect(lostCommentWarnings('body: a#b\n', 'body: ab\n')).toEqual([]);
	});

	it('needs a comment saved twice to appear twice in the draft', () => {
		const saved = '# spare\na: 1\n# spare\n';
		expect(lostCommentWarnings(saved, '# spare\na: 1\n')).toEqual(['the comment "# spare" is missing from the draft']);
	});
});
