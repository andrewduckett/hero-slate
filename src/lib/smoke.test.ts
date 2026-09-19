import { describe, it, expect } from 'vitest';

describe('test runner', () => {
	it('runs a trivial passing test', () => {
		expect(1 + 1).toBe(2);
	});
});
