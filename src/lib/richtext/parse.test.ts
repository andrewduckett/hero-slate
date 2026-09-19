import { describe, it, expect } from 'vitest';
import { parse } from './parse';
import type { Node } from './parse';

function text(t: string): Node { return { kind: 'text', text: t }; }
function strong(...children: Node[]): Node { return { kind: 'strong', children }; }
function em(...children: Node[]): Node { return { kind: 'em', children }; }
function pill(flavor: 'dice' | 'bonus', t: string): Node { return { kind: 'pill', flavor, text: t }; }

// --- 1.2 Basic emphasis ---

describe('parse: plain text', () => {
	it('returns a single text node for a plain string', () => {
		expect(parse('hello world')).toEqual([text('hello world')]);
	});

	it('returns an empty array for an empty string', () => {
		expect(parse('')).toEqual([]);
	});
});

describe('parse: bold', () => {
	it('wraps bold text in a strong node', () => {
		expect(parse('**attack**')).toEqual([strong(text('attack'))]);
	});

	it('handles bold mid-string', () => {
		expect(parse('do **this** now')).toEqual([
			text('do '),
			strong(text('this')),
			text(' now')
		]);
	});
});

describe('parse: italic', () => {
	it('wraps italic text in an em node', () => {
		expect(parse('*easier*')).toEqual([em(text('easier'))]);
	});

	it('handles italic mid-string', () => {
		expect(parse('it is *easier* done')).toEqual([
			text('it is '),
			em(text('easier')),
			text(' done')
		]);
	});
});

describe('parse: nesting', () => {
	it('renders italic inside bold', () => {
		expect(parse('**some *very* strong**')).toEqual([
			strong(text('some '), em(text('very')), text(' strong'))
		]);
	});

	it('renders bold inside italic', () => {
		expect(parse('*some **very** light*')).toEqual([
			em(text('some '), strong(text('very')), text(' light'))
		]);
	});
});

// --- 1.4 Forgiving-parse edge cases ---

describe('parse: forgiving — unmatched / unclosed markers', () => {
	it('renders an unmatched single * as literal', () => {
		expect(parse('hello * world')).toEqual([text('hello '), text('*'), text(' world')]);
	});

	it('renders unclosed ** as literal', () => {
		expect(parse('**bold')).toEqual([text('**'), text('bold')]);
	});

	it('renders unclosed * as literal', () => {
		expect(parse('*italic')).toEqual([text('*'), text('italic')]);
	});
});

describe('parse: forgiving — overlapping markers (greedy close)', () => {
	it('closes italic at first matching * and renders abandoned ** as literal', () => {
		// *italic **bold-and-italic* bold**
		// em closes at the first *, abandons the inner strong, remaining ** is literal
		const result = parse('*italic **bold-and-italic* bold**');
		expect(result).toEqual([
			em(text('italic '), text('**'), text('bold-and-italic')),
			text(' bold'),
			text('**')
		]);
	});
});

describe('parse: nesting is bounded at two levels', () => {
	it('closes the open span instead of nesting a second one of the same kind', () => {
		// The second `*` closes the italic rather than opening a nested one, so
		// "second" falls outside it and the third `*` is left unmatched.
		expect(parse('*first *second*')).toEqual([
			em(text('first ')),
			text('second'),
			text('*')
		]);
	});

	it('closes the open bold instead of nesting a second bold', () => {
		expect(parse('**a **b**')).toEqual([
			strong(text('a ')),
			text('b'),
			text('**')
		]);
	});

	it('allows strong inside em at depth 2 (the maximum)', () => {
		expect(parse('*outer **inner** outer*')).toEqual([
			em(text('outer '), strong(text('inner')), text(' outer'))
		]);
	});

	it('allows em inside strong at depth 2', () => {
		expect(parse('**outer *inner* outer**')).toEqual([
			strong(text('outer '), em(text('inner')), text(' outer'))
		]);
	});
});

// --- 1.6 Pill classification ---

describe('parse: pills — bonus', () => {
	it('classifies [[+7]] as bonus pill', () => {
		expect(parse('[[+7]]')).toEqual([pill('bonus', '+7')]);
	});

	it('classifies [[-2]] as bonus pill', () => {
		expect(parse('[[-2]]')).toEqual([pill('bonus', '-2')]);
	});
});

describe('parse: pills — dice', () => {
	it('classifies [[d20+6]] as dice pill', () => {
		expect(parse('[[d20+6]]')).toEqual([pill('dice', 'd20+6')]);
	});

	it('classifies [[2d6]] as dice pill', () => {
		expect(parse('[[2d6]]')).toEqual([pill('dice', '2d6')]);
	});

	it('classifies [[1D20]] as dice pill (uppercase D)', () => {
		expect(parse('[[1D20]]')).toEqual([pill('dice', '1D20')]);
	});

	it('classifies [[advantage]] as dice pill', () => {
		expect(parse('[[advantage]]')).toEqual([pill('dice', 'advantage')]);
	});
});

describe('parse: pills — empty / whitespace render literally', () => {
	it('renders [[]] as literal text', () => {
		expect(parse('[[]]')).toEqual([text('[[]]')]);
	});

	it('renders [[   ]] as literal text', () => {
		expect(parse('[[   ]]')).toEqual([text('[[   ]]')]);
	});
});

describe('parse: pills — unclosed [[ renders literally', () => {
	it('renders [[ without ]] as literal [[', () => {
		expect(parse('[[not closed')).toEqual([text('[['), text('not closed')]);
	});
});

describe('parse: pills — nesting with emphasis', () => {
	it('renders a dice pill inside bold', () => {
		expect(parse('**[[d20+6]]**')).toEqual([
			strong(pill('dice', 'd20+6'))
		]);
	});
});

// --- Native emoji pass through unchanged ---

describe('parse: emoji', () => {
	it('carries an emoji through as part of its text node', () => {
		expect(parse('Turn into an animal 🐺')).toEqual([text('Turn into an animal 🐺')]);
	});

	it('keeps a surrogate pair intact next to markup', () => {
		// The scanner walks UTF-16 code units, so a split pair would corrupt the
		// glyph; this pins that the halves stay together across a span boundary.
		expect(parse('🐺*a*🎲')).toEqual([text('🐺'), em(text('a')), text('🎲')]);
	});

	it('keeps a ZWJ sequence intact', () => {
		expect(parse('family 👨‍👩‍👧 here')).toEqual([text('family 👨‍👩‍👧 here')]);
	});

	it('carries an emoji inside emphasis', () => {
		expect(parse('**🐺 wolf**')).toEqual([strong(text('🐺 wolf'))]);
	});
});

// --- 1.8 Adversarial XSS ---

describe('parse: XSS safety', () => {
	it('renders <script>alert(1)</script> as plain text', () => {
		const result = parse('<script>alert(1)</script>');
		expect(result).toEqual([text('<script>alert(1)</script>')]);
	});

	it('renders [[</span><img onerror=x>]] as a dice pill with literal label', () => {
		const result = parse('[[</span><img onerror=x>]]');
		expect(result).toEqual([pill('dice', '</span><img onerror=x>')]);
	});

	it('renders **<b>hi</b>** as a bold span with literal text inside', () => {
		const result = parse('**<b>hi</b>**');
		expect(result).toEqual([strong(text('<b>hi</b>'))]);
	});
});
