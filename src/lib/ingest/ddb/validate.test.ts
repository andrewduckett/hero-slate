import { describe, it, expect } from 'vitest';
import { validateDraft } from './validate';

const VALID = [
	'name: Sunny Thornwood',
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
		const result = validateDraft('name: "unterminated', 'sunny');
		expect(result.errors.length).toBeGreaterThan(0);
	});

	it('reports a non-mapping top level', () => {
		const result = validateDraft('just a string', 'sunny');
		expect(result.errors.length).toBeGreaterThan(0);
	});

	it('reports a missing name', () => {
		const result = validateDraft('level: 6', 'sunny');
		expect(result.errors.length).toBeGreaterThan(0);
	});

	it('reports an empty name', () => {
		const result = validateDraft('name: ""', 'sunny');
		expect(result.errors.length).toBeGreaterThan(0);
	});

	it('reports a non-numeric level', () => {
		const result = validateDraft('name: Sunny\nlevel: "six"', 'sunny');
		expect(result.errors.length).toBeGreaterThan(0);
	});

	it('reports a non-string class', () => {
		const result = validateDraft('name: Sunny\nclass: 42', 'sunny');
		expect(result.errors.length).toBeGreaterThan(0);
	});

	it('reports a non-string color', () => {
		const result = validateDraft('name: Sunny\ncolor: 42', 'sunny');
		expect(result.errors.length).toBeGreaterThan(0);
	});

	it('reports a target id outside the id grammar', () => {
		const result = validateDraft('name: Sunny', 'Sunny');
		expect(result.errors.length).toBeGreaterThan(0);
	});

	it('reports a file id that differs from the target id', () => {
		const result = validateDraft('id: other\nname: Sunny', 'sunny');
		expect(result.errors.length).toBeGreaterThan(0);
	});

	it('accepts a matching file id', () => {
		const result = validateDraft('id: sunny\nname: Sunny', 'sunny');
		expect(result.errors).toEqual([]);
	});
});

describe('validateDraft — warnings', () => {
	it('warns when color is not a palette name', () => {
		const result = validateDraft('name: Sunny\ncolor: purple', 'sunny');
		expect(result.errors).toEqual([]);
		expect(result.warnings.length).toBeGreaterThan(0);
	});

	it('does not warn for a known palette color', () => {
		const result = validateDraft('name: Sunny\ncolor: forest', 'sunny');
		expect(result.warnings).toEqual([]);
	});

	it('warns when abilities has an entry the app would drop', () => {
		const body = ['name: Sunny', 'abilities:', '  - label: Strength', '    value: 14', '  - value: 10'].join('\n');
		const result = validateDraft(body, 'sunny');
		expect(result.warnings.length).toBeGreaterThan(0);
	});

	it('warns when combat has an entry the app would drop', () => {
		const body = ['name: Sunny', 'combat:', '  - label: Speed', '    value: 30', '  - value: 12'].join('\n');
		const result = validateDraft(body, 'sunny');
		expect(result.warnings.length).toBeGreaterThan(0);
	});

	it('warns when hitPoints.max is present but not a positive integer', () => {
		const negative = validateDraft('name: Sunny\nhitPoints:\n  max: -1', 'sunny');
		expect(negative.warnings.length).toBeGreaterThan(0);

		const notNumber = validateDraft('name: Sunny\nhitPoints:\n  max: "ten"', 'sunny');
		expect(notNumber.warnings.length).toBeGreaterThan(0);
	});

	it('does not warn when hitPoints has no max', () => {
		const result = validateDraft('name: Sunny\nhitPoints: {}', 'sunny');
		expect(result.warnings).toEqual([]);
	});

	it('reports no errors and no warnings for a fully valid draft', () => {
		const result = validateDraft(VALID, 'sunny');
		expect(result.errors).toEqual([]);
		expect(result.warnings).toEqual([]);
	});
});
