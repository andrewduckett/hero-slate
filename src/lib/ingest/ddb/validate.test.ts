import { describe, it, expect } from 'vitest';
import { validateDraft } from './validate';

const VALID = [
	'name: Test Hero',
	'level: 6',
	'class: Druid',
	'color: forest',
	'',
	'abilities:',
	'  - label: Strength',
	'    value: 14',
	'combat:',
	'  - label: Armor Class',
	'    value: 15',
	'',
	'hitPoints:',
	'  max: 30'
].join('\n');

describe('validateDraft — errors', () => {
	it('reports unparseable YAML', () => {
		const result = validateDraft('name: "unterminated', 'test-hero');
		expect(result.errors.length).toBeGreaterThan(0);
	});

	it('reports a non-mapping top level', () => {
		const result = validateDraft('just a string', 'test-hero');
		expect(result.errors.length).toBeGreaterThan(0);
	});

	it('reports a missing name', () => {
		const result = validateDraft('level: 6', 'test-hero');
		expect(result.errors.length).toBeGreaterThan(0);
	});

	it('reports an empty name', () => {
		const result = validateDraft('name: ""', 'test-hero');
		expect(result.errors.length).toBeGreaterThan(0);
	});

	it('reports a non-numeric level', () => {
		const result = validateDraft('name: Test Hero\nlevel: "six"', 'test-hero');
		expect(result.errors.length).toBeGreaterThan(0);
	});

	it('reports a non-string class', () => {
		const result = validateDraft('name: Test Hero\nclass: 42', 'test-hero');
		expect(result.errors.length).toBeGreaterThan(0);
	});

	it('reports a non-string color', () => {
		const result = validateDraft('name: Test Hero\ncolor: 42', 'test-hero');
		expect(result.errors.length).toBeGreaterThan(0);
	});

	it('reports a target id outside the id grammar', () => {
		const result = validateDraft('name: Test Hero', 'Test-Hero');
		expect(result.errors.length).toBeGreaterThan(0);
	});

	it('reports a file id that differs from the target id', () => {
		const result = validateDraft('id: other-hero\nname: Test Hero', 'test-hero');
		expect(result.errors.length).toBeGreaterThan(0);
	});

	it('accepts a matching file id', () => {
		const result = validateDraft('id: test-hero\nname: Test Hero', 'test-hero');
		expect(result.errors).toEqual([]);
	});
});

describe('validateDraft — warnings', () => {
	it('warns when color is not a palette name', () => {
		const result = validateDraft('name: Test Hero\ncolor: purple', 'test-hero');
		expect(result.errors).toEqual([]);
		expect(result.warnings.length).toBeGreaterThan(0);
	});

	it('does not warn for a known palette color', () => {
		const result = validateDraft('name: Test Hero\ncolor: forest', 'test-hero');
		expect(result.warnings).toEqual([]);
	});

	it('warns when abilities has an entry the app would drop', () => {
		const body = ['name: Test Hero', 'abilities:', '  - label: Strength', '    value: 14', '  - value: 10'].join('\n');
		const result = validateDraft(body, 'test-hero');
		expect(result.warnings.length).toBeGreaterThan(0);
	});

	it('warns when combat has an entry the app would drop', () => {
		const body = ['name: Test Hero', 'combat:', '  - label: Speed', '    value: 30', '  - value: 12'].join('\n');
		const result = validateDraft(body, 'test-hero');
		expect(result.warnings.length).toBeGreaterThan(0);
	});

	it('warns when hitPoints.max is present but not a positive integer', () => {
		const negative = validateDraft('name: Test Hero\nhitPoints:\n  max: -1', 'test-hero');
		expect(negative.warnings.length).toBeGreaterThan(0);

		const notNumber = validateDraft('name: Test Hero\nhitPoints:\n  max: "ten"', 'test-hero');
		expect(notNumber.warnings.length).toBeGreaterThan(0);
	});

	it('does not warn when hitPoints has no max', () => {
		const result = validateDraft('name: Test Hero\nhitPoints: {}', 'test-hero');
		expect(result.warnings).toEqual([]);
	});

	it('reports no errors and no warnings for a fully valid draft', () => {
		const result = validateDraft(VALID, 'test-hero');
		expect(result.errors).toEqual([]);
		expect(result.warnings).toEqual([]);
	});

	it('warns that the app would drop a pool above the 100-use limit, naming it', () => {
		const body = ['name: Test Hero', 'pools:', '  - id: sorcery', '    label: Sorcery Points', '    max: 120'].join('\n');
		const result = validateDraft(body, 'test-hero');
		expect(result.errors).toEqual([]);
		expect(result.warnings.some((w) => /would drop/i.test(w))).toBe(true);
		expect(result.warnings).toContain('Sorcery Points has a maximum of 120, and the app tracks at most 100 uses');
		expect(result.warnings.filter((w) => /dot/i.test(w))).toEqual([]);
	});

	it('warns that the app would drop a pool that repeats an earlier id', () => {
		const body = [
			'name: Test Hero',
			'pools:',
			'  - id: slots-1',
			'    label: L1 Slots',
			'    max: 3',
			'  - id: slots-1',
			'    label: L1 Slots Again',
			'    max: 2'
		].join('\n');
		const result = validateDraft(body, 'test-hero');
		expect(result.errors).toEqual([]);
		expect(result.warnings.some((w) => /would drop/i.test(w))).toBe(true);
	});

	it('warns when a pool color is not a palette name', () => {
		const body = ['name: Test Hero', 'pools:', '  - id: ki', '    label: Ki', '    color: purple', '    max: 5'].join(
			'\n'
		);
		const result = validateDraft(body, 'test-hero');
		expect(result.errors).toEqual([]);
		expect(result.warnings.some((w) => w.includes('purple'))).toBe(true);
	});

	it('warns that the app would drop a row with no body', () => {
		const body = [
			'name: Test Hero',
			'sections:',
			'  - title: Your Turn',
			'    rows:',
			'      - title: Swipe',
			'        body: swipe at it!',
			'      - title: No body'
		].join('\n');
		const result = validateDraft(body, 'test-hero');
		expect(result.errors).toEqual([]);
		expect(result.warnings.some((w) => /would drop a row/i.test(w))).toBe(true);
	});

	it('warns that the app would drop a sections entry with no rows', () => {
		const body = ['name: Test Hero', 'sections:', '  - title: Your Turn', '    rows: []'].join('\n');
		const result = validateDraft(body, 'test-hero');
		expect(result.errors).toEqual([]);
		expect(result.warnings.some((w) => /would drop a `?sections`? entry/i.test(w))).toBe(true);
	});

	it('warns when a section color is not a palette name', () => {
		const body = [
			'name: Test Hero',
			'sections:',
			'  - title: Strengths',
			'    color: purple',
			'    rows:',
			'      - body: flips and sneaking'
		].join('\n');
		const result = validateDraft(body, 'test-hero');
		expect(result.errors).toEqual([]);
		expect(result.warnings.some((w) => w.includes('purple'))).toBe(true);
	});

	it('warns when a row color is not a palette name', () => {
		const body = [
			'name: Test Hero',
			'sections:',
			'  - title: Strengths',
			'    rows:',
			'      - body: flips and sneaking',
			'        color: purple'
		].join('\n');
		const result = validateDraft(body, 'test-hero');
		expect(result.errors).toEqual([]);
		expect(result.warnings.some((w) => w.includes('purple'))).toBe(true);
	});

	it('warns that the app would drop a links entry with an http URL', () => {
		const body = ['name: Test Hero', 'links:', '  - url: http://example.com'].join('\n');
		const result = validateDraft(body, 'test-hero');
		expect(result.errors).toEqual([]);
		expect(result.warnings.some((w) => /would drop a `?links`? entry/i.test(w))).toBe(true);
	});

	it('warns when a link color is not a palette name', () => {
		const body = ['name: Test Hero', 'links:', '  - url: https://example.com', '    color: purple'].join('\n');
		const result = validateDraft(body, 'test-hero');
		expect(result.errors).toEqual([]);
		expect(result.warnings.some((w) => w.includes('purple'))).toBe(true);
	});
});
