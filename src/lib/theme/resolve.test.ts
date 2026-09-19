import { describe, it, expect } from 'vitest';
import { resolvePalette } from './resolve';

describe('resolvePalette (task 4.1)', () => {
	const cases: Array<[string, string | undefined, string]> = [
		['exact forest', 'forest', 'forest'],
		['exact fire', 'fire', 'fire'],
		['exact ocean', 'ocean', 'ocean'],
		['exact berry', 'berry', 'berry'],
		['exact sun', 'sun', 'sun'],
		['exact neutral', 'neutral', 'neutral'],
		['unknown name', 'rainbow', 'neutral'],
		['empty string', '', 'neutral'],
		['whitespace string', '   ', 'neutral'],
		['whitespace-padded name', ' forest ', 'neutral'],
		['uppercase name', 'FOREST', 'neutral'],
		['hex string', '#ff0000', 'neutral'],
		['rgb string', 'rgb(255, 0, 0)', 'neutral'],
		['undefined', undefined, 'neutral']
	];

	it.each(cases)('%s -> %s', (_label, input, expected) => {
		expect(resolvePalette(input)).toBe(expected);
	});
});
