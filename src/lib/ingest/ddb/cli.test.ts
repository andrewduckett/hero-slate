import { describe, it, expect } from 'vitest';
import { run, type CliDeps } from './cli';
import type { DdbFetchLike, DdbHttpResponse } from './fetch';

function character(overrides: Record<string, unknown> = {}) {
	return {
		data: {
			name: 'Test Hero',
			classes: [{ level: 6, definition: { name: 'Monk' }, subclassDefinition: null }],
			stats: [
				{ id: 1, value: 10 },
				{ id: 2, value: 10 },
				{ id: 3, value: 10 },
				{ id: 4, value: 10 },
				{ id: 5, value: 10 },
				{ id: 6, value: 10 }
			],
			bonusStats: null,
			overrideStats: null,
			baseHitPoints: 10,
			bonusHitPoints: null,
			overrideHitPoints: null,
			modifiers: { race: [], class: [], background: [], item: [], feat: [], condition: [] },
			inventory: [],
			race: { weightSpeeds: { normal: { walk: 30 } } },
			characterValues: [],
			...overrides
		}
	};
}

function res(opts: { status?: number; body?: string }): DdbHttpResponse {
	const { status = 200, body = '' } = opts;
	return { status, text: async () => body };
}

function fetchReturning(response: DdbHttpResponse): DdbFetchLike {
	return async () => response;
}

const VALID_DRAFT = ['name: Sunny Thornwood', 'level: 6', 'class: Druid', 'color: forest'].join('\n');

const INVALID_DRAFT = 'level: 6';

function fakeDeps(overrides: Partial<CliDeps> = {}): CliDeps & { writes: Record<string, string> } {
	const writes: Record<string, string> = {};
	return {
		readFile: () => VALID_DRAFT,
		exists: () => false,
		writeFile: (path: string, content: string) => {
			writes[path] = content;
		},
		fetchFn: async () => {
			throw new Error('fetchFn not stubbed for this test');
		},
		writes,
		...overrides
	};
}

describe('cli run — digest', () => {
	it('prints the digest JSON on success and exits 0', async () => {
		const deps = fakeDeps({ fetchFn: fetchReturning(res({ body: JSON.stringify(character()) })) });

		const result = await run(['digest', '154922980'], deps);

		expect(result.exitCode).toBe(0);
		expect(() => JSON.parse(result.stdout)).not.toThrow();
		const parsed = JSON.parse(result.stdout);
		expect(parsed.name).toBe('Test Hero');
	});

	it('prints nothing on stdout for an unreadable reference, and exits 4', async () => {
		const deps = fakeDeps();
		const result = await run(['digest', 'not-a-reference!'], deps);
		expect(result.exitCode).toBe(4);
		expect(result.stdout).toBe('');
	});

	it('exits 2 with nothing on stdout for a private character', async () => {
		const deps = fakeDeps({ fetchFn: fetchReturning(res({ status: 403 })) });
		const result = await run(['digest', '154922980'], deps);
		expect(result.exitCode).toBe(2);
		expect(result.stdout).toBe('');
	});

	it('exits 4 with nothing on stdout for a missing character', async () => {
		const deps = fakeDeps({ fetchFn: fetchReturning(res({ status: 404 })) });
		const result = await run(['digest', '154922980'], deps);
		expect(result.exitCode).toBe(4);
		expect(result.stdout).toBe('');
	});

	it('exits 5 with nothing on stdout for an unreadable response shape', async () => {
		const deps = fakeDeps({ fetchFn: fetchReturning(res({ body: JSON.stringify({ data: {} }) })) });
		const result = await run(['digest', '154922980'], deps);
		expect(result.exitCode).toBe(5);
		expect(result.stdout).toBe('');
	});
});

describe('cli run — preview', () => {
	it('exits 1 on a draft error and does not draw', async () => {
		const deps = fakeDeps({ readFile: () => INVALID_DRAFT });
		const result = await run(['preview', '.workspace/sunny.yaml'], deps);
		expect(result.exitCode).toBe(1);
		expect(result.stdout).toBe('');
	});

	it('exits 3 when the target already exists, and does not draw', async () => {
		const deps = fakeDeps({ exists: () => true });
		const result = await run(['preview', '.workspace/sunny.yaml'], deps);
		expect(result.exitCode).toBe(3);
		expect(result.stdout).toBe('');
	});

	it('draws the preview when there are no errors and the target does not exist', async () => {
		const deps = fakeDeps();
		const result = await run(['preview', '.workspace/sunny.yaml'], deps);
		expect(result.exitCode).toBe(0);
		expect(result.stdout).toContain('Sunny Thornwood');
	});

	it('adds cross-check warnings with --digest', async () => {
		const digestJson = JSON.stringify({
			name: 'Sunny Thornwood',
			classes: [],
			level: 9,
			abilities: { strength: 10, dexterity: 10, constitution: 10, intelligence: 10, wisdom: 10, charisma: 10 },
			armorClass: null,
			armorClassReason: null,
			speed: 30,
			initiative: 0,
			hitPointsMax: 10
		});
		const deps = fakeDeps({
			readFile: (path: string) => (path.endsWith('.yaml') ? VALID_DRAFT : digestJson)
		});
		const result = await run(['preview', '.workspace/sunny.yaml', '--digest', '.workspace/sunny.digest.json'], deps);
		expect(result.exitCode).toBe(0);
		expect(result.stdout).toMatch(/level/i);
	});
});

describe('cli run — write', () => {
	it('exits 1 on a draft error and writes nothing', async () => {
		const deps = fakeDeps({ readFile: () => INVALID_DRAFT });
		const result = await run(['write', '.workspace/sunny.yaml'], deps);
		expect(result.exitCode).toBe(1);
		expect(Object.keys(deps.writes)).toHaveLength(0);
	});

	it('exits 3 when the target already exists, and writes nothing', async () => {
		const deps = fakeDeps({ exists: () => true });
		const result = await run(['write', '.workspace/sunny.yaml'], deps);
		expect(result.exitCode).toBe(3);
		expect(Object.keys(deps.writes)).toHaveLength(0);
	});

	it('takes the id from the base name, ignoring the draft directory', async () => {
		const deps = fakeDeps();
		const result = await run(['write', '.workspace/nested/dir/sunny.yaml'], deps);
		expect(result.exitCode).toBe(0);
		expect(deps.writes['static/characters/sunny.yaml']).toBe(VALID_DRAFT);
	});

	it('refuses a file name outside the id grammar, such as Urven.yaml', async () => {
		const deps = fakeDeps({ readFile: () => 'name: Urven' });
		const result = await run(['write', '.workspace/Urven.yaml'], deps);
		expect(result.exitCode).toBe(1);
		expect(Object.keys(deps.writes)).toHaveLength(0);
	});

	it('writes the draft byte for byte', async () => {
		const deps = fakeDeps();
		await run(['write', '.workspace/sunny.yaml'], deps);
		expect(deps.writes['static/characters/sunny.yaml']).toBe(VALID_DRAFT);
	});

	it('exits 3 when the write itself refuses an existing file (a race with the check)', async () => {
		const deps = fakeDeps({
			writeFile: () => {
				throw new Error('EEXIST');
			}
		});
		const result = await run(['write', '.workspace/sunny.yaml'], deps);
		expect(result.exitCode).toBe(3);
	});
});
