import { describe, it, expect } from 'vitest';
import { formatIdentity } from './format';

describe('formatIdentity', () => {
	const cases: Array<{ name: string; input: { level?: unknown; class?: unknown }; expected: string }> = [
		{ name: 'level and class', input: { level: 6, class: 'Druid' }, expected: 'Level 6 Druid' },
		{ name: 'level only', input: { level: 6 }, expected: 'Level 6' },
		{ name: 'class only', input: { class: 'Druid' }, expected: 'Druid' },
		{ name: 'neither', input: {}, expected: '' },
		{ name: 'class printed as authored (lowercase)', input: { class: 'druid' }, expected: 'druid' }
	];

	for (const { name, input, expected } of cases) {
		it(`${name} → "${expected}"`, () => {
			expect(formatIdentity(input)).toBe(expected);
		});
	}

	it('does not throw on wrong-typed fields', () => {
		expect(() => formatIdentity({ level: 'six', class: 42 })).not.toThrow();
		expect(formatIdentity({ level: 'six' as unknown as number, class: 42 as unknown as string })).toBe('');
	});

	it('does not throw on a null input', () => {
		expect(() => formatIdentity(null as unknown as { level?: number; class?: string })).not.toThrow();
		expect(formatIdentity(undefined as unknown as { level?: number; class?: string })).toBe('');
	});

	it('treats a non-finite level as absent', () => {
		expect(formatIdentity({ level: Infinity, class: 'Druid' })).toBe('Druid');
		expect(formatIdentity({ level: NaN })).toBe('');
	});
});
