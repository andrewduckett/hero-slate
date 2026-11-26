/**
 * The ingest command-line entry: `digest`, `preview`, and `write`.
 *
 * `run` is the pure part: it takes argv and an injected `CliDeps`, and
 * returns an outcome instead of touching the real file system, network, or
 * process. `main` is the only impure part — it wires real `fs`, `fetch`,
 * `process.argv`, and `process.exit`. Run with `vite-node` so `#lib`
 * aliases resolve the same way they do in tests (see design.md, D2 and D3).
 */
import { EXIT_CODES } from './exitCodes';
import { parseReference } from './reference';
import { fetchCharacter, type DdbFetchLike } from './fetch';
import { computeDigest, type Digest } from './digest';
import { validateDraft } from './validate';
import { crosscheckDraft } from './crosscheck';
import { renderPreview } from './preview';
import { listChanges, lostCommentWarnings, poolResetWarnings } from './changes';
import { parse as parseYaml } from 'yaml';

export interface CliDeps {
	readFile: (path: string) => string;
	exists: (path: string) => boolean;
	/** Create a new file; refuses one that already exists. */
	writeFile: (path: string, content: string) => void;
	/** Replace an existing file, for edit mode. */
	replaceFile: (path: string, content: string) => void;
	fetchFn: DdbFetchLike;
}

export interface CliOutcome {
	exitCode: number;
	stdout: string;
	stderr: string;
}

function ok(stdout: string): CliOutcome {
	return { exitCode: EXIT_CODES.success, stdout, stderr: '' };
}

function fail(exitCode: number, message: string): CliOutcome {
	return { exitCode, stdout: '', stderr: message };
}

/** The logical id a draft targets: its base file name, without directory or extension. */
function idFromDraftPath(draftPath: string): string {
	const base = draftPath.split('/').pop() ?? draftPath;
	return base.endsWith('.yaml') ? base.slice(0, -'.yaml'.length) : base;
}

function targetPath(id: string): string {
	return `static/characters/${id}.yaml`;
}

async function runDigest(reference: string, deps: CliDeps): Promise<CliOutcome> {
	const parsedReference = parseReference(reference);
	if (parsedReference.status === 'unreadable') {
		return fail(EXIT_CODES.referenceUnreadable, `"${reference}" is not a readable D&D Beyond character reference`);
	}

	const fetched = await fetchCharacter(parsedReference.id, deps.fetchFn);
	if (fetched.status === 'private') {
		return fail(EXIT_CODES.characterPrivate, fetched.message);
	}
	if (fetched.status === 'not-found') {
		return fail(EXIT_CODES.referenceUnreadable, fetched.message);
	}
	if (fetched.status === 'failed') {
		return fail(EXIT_CODES.fetchFailed, fetched.message);
	}

	const digestResult = computeDigest(fetched.body);
	if (digestResult.status === 'unreadable') {
		return fail(EXIT_CODES.fetchFailed, digestResult.message);
	}

	const sheetUrl = `https://www.dndbeyond.com/characters/${parsedReference.id}`;
	return ok(JSON.stringify({ ...digestResult.digest, sheetUrl }, null, 2));
}

function readDigestFile(path: string, deps: CliDeps): Digest {
	return JSON.parse(deps.readFile(path)) as Digest;
}

/**
 * New-character mode refuses an existing file; edit mode (`--edit`) refuses
 * a missing one. Either way the check runs before anything is drawn or
 * written, so the Author never approves a draft the write would refuse.
 */
function checkTarget(id: string, edit: boolean, deps: CliDeps): CliOutcome | undefined {
	const exists = deps.exists(targetPath(id));
	if (edit && !exists) {
		return fail(EXIT_CODES.characterMissing, `${targetPath(id)} does not exist; edit mode changes an existing sheet`);
	}
	if (!edit && exists) {
		return fail(EXIT_CODES.targetExists, `${targetPath(id)} already exists; pass --edit to change an existing sheet`);
	}
	return undefined;
}

/**
 * A saved sheet that is empty, broken or not a mapping, such as after a bad
 * hand edit, must not crash the preview that would repair it.
 */
function readSavedSheet(savedText: string): Record<string, unknown> | undefined {
	try {
		const saved: unknown = parseYaml(savedText);
		return typeof saved === 'object' && saved !== null && !Array.isArray(saved)
			? (saved as Record<string, unknown>)
			: undefined;
	} catch {
		return undefined;
	}
}

function runPreview(args: string[], deps: CliDeps): CliOutcome {
	const [draftPath, ...rest] = args;
	const digestFlagIndex = rest.indexOf('--digest');
	const digestPath = digestFlagIndex >= 0 ? rest[digestFlagIndex + 1] : undefined;
	const edit = rest.includes('--edit');

	const id = idFromDraftPath(draftPath);
	const targetProblem = checkTarget(id, edit, deps);
	if (targetProblem) return targetProblem;

	const text = deps.readFile(draftPath);
	const { errors, warnings } = validateDraft(text, id);
	if (errors.length > 0) {
		return fail(EXIT_CODES.draftHasErrors, errors.join('\n'));
	}

	const draft = parseYaml(text) as Record<string, unknown>;
	const crosscheckWarnings = digestPath !== undefined ? crosscheckDraft(draft, readDigestFile(digestPath, deps)) : [];

	const lines = [...renderPreview(draft)];
	const allWarnings = [...warnings, ...crosscheckWarnings];
	if (edit) {
		const savedText = deps.readFile(targetPath(id));
		const saved = readSavedSheet(savedText);
		if (saved === undefined) {
			allWarnings.push(
				`${targetPath(id)} is not a readable character file, so the change list compares the draft with an empty sheet`
			);
		}
		lines.push('', 'Changes:', ...listChanges(saved ?? {}, draft));
		allWarnings.push(...poolResetWarnings(saved ?? {}, draft), ...lostCommentWarnings(savedText, text));
	}
	if (allWarnings.length > 0) {
		lines.push('', 'Warnings:', ...allWarnings.map((w) => `  - ${w}`));
	}

	return ok(lines.join('\n'));
}

function runWrite(args: string[], deps: CliDeps): CliOutcome {
	const [draftPath, ...rest] = args;
	const edit = rest.includes('--edit');
	const id = idFromDraftPath(draftPath);

	const targetProblem = checkTarget(id, edit, deps);
	if (targetProblem) return targetProblem;

	const text = deps.readFile(draftPath);
	const { errors } = validateDraft(text, id);
	if (errors.length > 0) {
		return fail(EXIT_CODES.draftHasErrors, errors.join('\n'));
	}

	if (edit) {
		deps.replaceFile(targetPath(id), text);
		return ok(targetPath(id));
	}

	try {
		deps.writeFile(targetPath(id), text);
	} catch {
		return fail(EXIT_CODES.targetExists, `${targetPath(id)} appeared before the write; refusing to replace it`);
	}

	return ok(targetPath(id));
}

export async function run(argv: string[], deps: CliDeps): Promise<CliOutcome> {
	const [command, ...args] = argv;

	switch (command) {
		case 'digest':
			return runDigest(args[0] ?? '', deps);
		case 'preview':
			return runPreview(args, deps);
		case 'write':
			return runWrite(args, deps);
		default:
			return fail(EXIT_CODES.referenceUnreadable, `unknown command "${String(command)}"`);
	}
}

async function main(): Promise<void> {
	const fs = await import('node:fs');
	const deps: CliDeps = {
		readFile: (path) => fs.readFileSync(path, 'utf8'),
		exists: (path) => fs.existsSync(path),
		writeFile: (path, content) => fs.writeFileSync(path, content, { flag: 'wx' }),
		replaceFile: (path, content) => fs.writeFileSync(path, content),
		fetchFn: fetch
	};

	const result = await run(process.argv.slice(2), deps);
	if (result.stdout) console.log(result.stdout);
	if (result.stderr) console.error(result.stderr);
	process.exit(result.exitCode);
}

// Under vite-node, process.argv[1] is vite-node's own binary path, not this
// script, so a `argv[1] === import.meta.url` entry guard never fires. Skip
// only when Vitest imports this module for its tests; run otherwise.
if (!process.env.VITEST) {
	main();
}
