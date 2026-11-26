import { describe, it, expect } from 'vitest';
import { judgeCharacterWork } from './character-work-check.ts';

describe('judgeCharacterWork', () => {
	it('passes an unmarked pull request that changes character files and code', () => {
		const result = judgeCharacterWork({
			title: 'feat: add spell slots',
			changedPaths: ['static/characters/sunny.yaml', 'src/lib/character/pools.ts']
		});
		expect(result.pass).toBe(true);
		expect(result.message).toMatch(/not marked as character work/);
	});

	it.each(['Char: add Gimdak', ' char: add Gimdak', 'fix: char: typo'])(
		'treats %j as unmarked, because only the exact lowercase prefix char: marks it',
		(title) => {
			const result = judgeCharacterWork({ title, changedPaths: ['src/app.html'] });
			expect(result.pass).toBe(true);
			expect(result.message).toMatch(/not marked as character work/);
		}
	);
});
