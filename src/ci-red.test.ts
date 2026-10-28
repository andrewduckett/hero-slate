import { expect, test } from 'vitest';

test('deliberately fails to prove the test and build check goes red', () => {
	expect(1).toBe(2);
});
