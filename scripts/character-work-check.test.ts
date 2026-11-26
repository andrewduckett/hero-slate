import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { parse } from 'yaml';
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
			const result = judgeCharacterWork({
				title,
				changedPaths: ['src/app.html']
			});
			expect(result.pass).toBe(true);
			expect(result.message).toMatch(/not marked as character work/);
		}
	);

	it.each([
		[['static/characters/gimdak.yaml', 'static/characters/manifest.yaml']],
		[['static/characters/notes/gimdak.md']],
		[[]]
	])(
		'passes a marked pull request that changes only files in static/characters/: %j',
		(changedPaths) => {
			const result = judgeCharacterWork({
				title: 'char: add Gimdak',
				changedPaths
			});
			expect(result.pass).toBe(true);
			expect(result.message).toMatch(/changes only files in static\/characters\//);
		}
	);

	// git diff --no-renames reports a rename as a deletion and an addition, so
	// a rename arrives as both its old and its new path.
	it.each([
		['app code changes', ['static/characters/gimdak.yaml', 'src/lib/character/pools.ts']],
		['a file outside is deleted', ['docs/notes.md']],
		['a rename out of static/characters/', ['static/characters/sunny.yaml', 'docs/sunny.yaml']],
		['a rename into static/characters/', ['docs/sunny.yaml', 'static/characters/sunny.yaml']],
		['a look-alike folder', ['static/characters-old/x.yaml']]
	])('fails a marked pull request when %s', (_case, changedPaths) => {
		const result = judgeCharacterWork({
			title: 'char: add Gimdak',
			changedPaths
		});
		expect(result.pass).toBe(false);
	});

	describe('the failure message', () => {
		const { message } = judgeCharacterWork({
			title: 'char: add Gimdak',
			changedPaths: ['static/characters/gimdak.yaml', 'src/lib/character/pools.ts', 'README.md']
		});
		const lines = message.split('\n').map((line) => line.trim());

		it('lists each changed path outside static/characters/ on its own line', () => {
			expect(lines).toContain('src/lib/character/pools.ts');
			expect(lines).toContain('README.md');
		});

		it('does not list a changed path inside static/characters/', () => {
			expect(message).not.toContain('static/characters/gimdak.yaml');
		});

		it('then says to move the outside changes to their own issue and pull request', () => {
			const fix = lines.findIndex((line) => /own issue and pull request/.test(line));
			expect(fix).toBeGreaterThan(lines.indexOf('README.md'));
		});

		it('then says to remove the char: mark if the pull request is not character work', () => {
			const fix = lines.findIndex((line) =>
				/remove the `char:` mark .*not character work/i.test(line)
			);
			expect(fix).toBeGreaterThan(lines.indexOf('README.md'));
		});
	});
});

describe('the character work workflow', () => {
	const workflow = parse(
		readFileSync(resolve(process.cwd(), '.github/workflows/character-work.yml'), 'utf8')
	);
	const jobs = Object.values(workflow.jobs ?? {}) as Array<Record<string, any>>;
	const steps = (jobs[0]?.steps ?? []) as Array<Record<string, any>>;

	it('is named character work, with one job of the same name', () => {
		expect(workflow.name).toBe('character work');
		expect(jobs.map((job) => job.name)).toEqual(['character work']);
	});

	// edited fires on a title change, so adding or removing the mark re-judges it.
	it('runs on every pull request when opened, pushed to, reopened or edited', () => {
		expect(workflow.on.pull_request).toEqual({
			types: ['opened', 'synchronize', 'reopened', 'edited']
		});
	});

	it('can only read the repository', () => {
		expect(workflow.permissions).toEqual({ contents: 'read' });
	});

	it('cancels an older run for the same pull request', () => {
		expect(workflow.concurrency.group).toContain('github.event.pull_request.number');
		expect(workflow.concurrency['cancel-in-progress']).toBe(true);
	});

	it('checks out the full history, so the merge base is present', () => {
		const checkout = steps.find((step) => String(step.uses).startsWith('actions/checkout@'));
		expect(checkout?.with?.['fetch-depth']).toBe(0);
	});

	it('installs Node with mise', () => {
		expect(steps.some((step) => String(step.uses).startsWith('jdx/mise-action@'))).toBe(true);
	});

	it('passes the title and both commits to the check through env', () => {
		const check = steps.find((step) => String(step.run ?? '').includes('character-work-check.ts'));
		expect(check?.env).toEqual({
			PR_TITLE: '${{ github.event.pull_request.title }}',
			BASE_SHA: '${{ github.event.pull_request.base.sha }}',
			HEAD_SHA: '${{ github.event.pull_request.head.sha }}'
		});
	});

	// Text in run: is pasted into the shell script, so a crafted title could run commands.
	it('never writes the title into a run: script', () => {
		for (const step of steps) {
			expect(String(step.run ?? '')).not.toContain('github.event.pull_request.title');
		}
	});
});
