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

const VALID_DRAFT = ['name: Test Hero', 'level: 6', 'class: Druid', 'color: forest'].join('\n');

const INVALID_DRAFT = 'level: 6';

function fakeDeps(
	overrides: Partial<CliDeps> = {}
): CliDeps & { writes: Record<string, string>; replaced: Record<string, string> } {
	const writes: Record<string, string> = {};
	const replaced: Record<string, string> = {};
	return {
		readFile: () => VALID_DRAFT,
		exists: () => false,
		writeFile: (path: string, content: string) => {
			writes[path] = content;
		},
		replaceFile: (path: string, content: string) => {
			replaced[path] = content;
		},
		fetchFn: async () => {
			throw new Error('fetchFn not stubbed for this test');
		},
		writes,
		replaced,
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

	it('reports the canonical sheet URL for a bare id', async () => {
		const deps = fakeDeps({ fetchFn: fetchReturning(res({ body: JSON.stringify(character()) })) });

		const result = await run(['digest', '154922980'], deps);

		expect(JSON.parse(result.stdout).sheetUrl).toBe('https://www.dndbeyond.com/characters/154922980');
	});

	it('reports the canonical sheet URL for a reference with a trailing path segment and query string', async () => {
		const deps = fakeDeps({ fetchFn: fetchReturning(res({ body: JSON.stringify(character()) })) });

		const result = await run(['digest', 'https://dndbeyond.com/characters/154922980/builder?tab=spells'], deps);

		expect(JSON.parse(result.stdout).sheetUrl).toBe('https://www.dndbeyond.com/characters/154922980');
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
		const result = await run(['preview', '.workspace/test-hero.yaml'], deps);
		expect(result.exitCode).toBe(1);
		expect(result.stdout).toBe('');
	});

	it('exits 3 when the target already exists, and does not draw', async () => {
		const deps = fakeDeps({ exists: () => true });
		const result = await run(['preview', '.workspace/test-hero.yaml'], deps);
		expect(result.exitCode).toBe(3);
		expect(result.stdout).toBe('');
	});

	it('names the existing file and the edit flag when the target already exists', async () => {
		const deps = fakeDeps({ exists: () => true });
		const result = await run(['preview', '.workspace/test-hero.yaml'], deps);
		expect(result.stderr).toBe('static/characters/test-hero.yaml already exists; pass --edit to change an existing sheet');
	});

	it('draws the preview when there are no errors and the target does not exist', async () => {
		const deps = fakeDeps();
		const result = await run(['preview', '.workspace/test-hero.yaml'], deps);
		expect(result.exitCode).toBe(0);
		expect(result.stdout).toContain('Test Hero');
	});

	it('adds cross-check warnings with --digest', async () => {
		const digestJson = JSON.stringify({
			name: 'Test Hero',
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
		const result = await run(['preview', '.workspace/test-hero.yaml', '--digest', '.workspace/test-hero.digest.json'], deps);
		expect(result.exitCode).toBe(0);
		expect(result.stdout).toMatch(/level/i);
	});
});

/** A file system holding exactly these files, by path. */
function filesDeps(files: Record<string, string>, overrides: Partial<CliDeps> = {}) {
	return fakeDeps({
		readFile: (path: string) => {
			if (!(path in files)) throw new Error(`ENOENT: ${path}`);
			return files[path];
		},
		exists: (path: string) => path in files,
		...overrides
	});
}

describe('cli run — preview --edit', () => {
	it('exits 6 without drawing when the saved file does not exist', async () => {
		const deps = filesDeps({ '.workspace/edit/nobody.yaml': VALID_DRAFT });
		const result = await run(['preview', '.workspace/edit/nobody.yaml', '--edit'], deps);
		expect(result).toEqual({
			exitCode: 6,
			stdout: '',
			stderr: 'static/characters/nobody.yaml does not exist; edit mode changes an existing sheet'
		});
	});

	it('exits 1 without drawing when the draft has an error', async () => {
		const deps = filesDeps({ 'static/characters/sunny.yaml': VALID_DRAFT, '.workspace/edit/sunny.yaml': INVALID_DRAFT });
		const result = await run(['preview', '.workspace/edit/sunny.yaml', '--edit'], deps);
		expect(result.exitCode).toBe(1);
		expect(result.stdout).toBe('');
	});

	it('prints the drawing, then the change list, then every warning in order', async () => {
		const saved = ['# keep me', 'name: Test Hero', 'level: 6', 'pools:', '  - id: wild-shape', '    label: Wild Shape', '    max: 3'].join('\n');
		const draft = ['name: Test Hero', 'level: 7', 'color: plum', 'pools:', '  - id: wildshape', '    label: Wild Shape', '    max: 3'].join('\n');
		const digest = JSON.stringify({
			name: 'Test Hero',
			classes: [],
			level: 9,
			abilities: { strength: 10, dexterity: 10, constitution: 10, intelligence: 10, wisdom: 10, charisma: 10 },
			armorClass: null,
			armorClassReason: null,
			speed: 30,
			initiative: 0,
			hitPointsMax: 10
		});
		const deps = filesDeps({
			'static/characters/sunny.yaml': saved,
			'.workspace/edit/sunny.yaml': draft,
			'.workspace/sunny.digest.json': digest
		});

		const result = await run(['preview', '.workspace/edit/sunny.yaml', '--edit', '--digest', '.workspace/sunny.digest.json'], deps);

		expect(result.exitCode).toBe(0);
		const [drawing, rest] = result.stdout.split('\n\nChanges:\n');
		expect(drawing).toContain('Test Hero');
		const [changes, warnings] = rest.split('\n\nWarnings:\n');
		expect(changes.split('\n')).toEqual([
			'  - changed level: 6 → 7',
			'  - removed pool wild-shape',
			'  - added pool wildshape',
			'  - added color: "plum"'
		]);
		const warningPatterns = [/color "plum"/, /level/i, /pool id "wild-shape" is gone/, /comment "# keep me" is missing/];
		expect(warnings.split('\n').map((line, i) => warningPatterns[i]?.test(line))).toEqual([true, true, true, true]);
	});
});

describe('cli run — write', () => {
	it('exits 1 on a draft error and writes nothing', async () => {
		const deps = fakeDeps({ readFile: () => INVALID_DRAFT });
		const result = await run(['write', '.workspace/test-hero.yaml'], deps);
		expect(result.exitCode).toBe(1);
		expect(Object.keys(deps.writes)).toHaveLength(0);
	});

	it('exits 3 when the target already exists, and writes nothing', async () => {
		const deps = fakeDeps({ exists: () => true });
		const result = await run(['write', '.workspace/test-hero.yaml'], deps);
		expect(result.exitCode).toBe(3);
		expect(Object.keys(deps.writes)).toHaveLength(0);
	});

	it('names the existing file and the edit flag when the target already exists', async () => {
		const deps = fakeDeps({ exists: () => true });
		const result = await run(['write', '.workspace/test-hero.yaml'], deps);
		expect(result.stderr).toBe('static/characters/test-hero.yaml already exists; pass --edit to change an existing sheet');
	});

	it('takes the id from the base name, ignoring the draft directory', async () => {
		const deps = fakeDeps();
		const result = await run(['write', '.workspace/nested/dir/test-hero.yaml'], deps);
		expect(result.exitCode).toBe(0);
		expect(deps.writes['static/characters/test-hero.yaml']).toBe(VALID_DRAFT);
	});

	it('refuses a file name outside the id grammar, such as Test-Hero.yaml', async () => {
		const deps = fakeDeps({ readFile: () => 'name: Test Hero' });
		const result = await run(['write', '.workspace/Test-Hero.yaml'], deps);
		expect(result.exitCode).toBe(1);
		expect(Object.keys(deps.writes)).toHaveLength(0);
	});

	it('writes the draft byte for byte', async () => {
		const deps = fakeDeps();
		await run(['write', '.workspace/test-hero.yaml'], deps);
		expect(deps.writes['static/characters/test-hero.yaml']).toBe(VALID_DRAFT);
	});

	it('exits 3 when the write itself refuses an existing file (a race with the check)', async () => {
		const deps = fakeDeps({
			writeFile: () => {
				throw new Error('EEXIST');
			}
		});
		const result = await run(['write', '.workspace/test-hero.yaml'], deps);
		expect(result.exitCode).toBe(3);
	});
});

describe('cli run — write --edit', () => {
	it('exits 6 and writes nothing when the saved file does not exist', async () => {
		const deps = filesDeps({ '.workspace/edit/nobody.yaml': VALID_DRAFT });
		const result = await run(['write', '.workspace/edit/nobody.yaml', '--edit'], deps);
		expect(result.exitCode).toBe(6);
		expect({ ...deps.writes, ...deps.replaced }).toEqual({});
	});

	it('replaces only the saved file with exactly the draft bytes, and exits 0', async () => {
		const draft = `${VALID_DRAFT}\n# kept\n`;
		const deps = filesDeps({ 'static/characters/test-hero.yaml': VALID_DRAFT, '.workspace/edit/test-hero.yaml': draft });
		const result = await run(['write', '.workspace/edit/test-hero.yaml', '--edit'], deps);
		expect(result.exitCode).toBe(0);
		expect(deps.replaced).toEqual({ 'static/characters/test-hero.yaml': draft });
		expect(deps.writes).toEqual({});
	});

	it('exits 1 and leaves the saved file unchanged when the draft has an error', async () => {
		const deps = filesDeps({
			'static/characters/test-hero.yaml': VALID_DRAFT,
			'.workspace/edit/test-hero.yaml': INVALID_DRAFT
		});
		const result = await run(['write', '.workspace/edit/test-hero.yaml', '--edit'], deps);
		expect(result.exitCode).toBe(1);
		expect({ ...deps.writes, ...deps.replaced }).toEqual({});
	});
});
