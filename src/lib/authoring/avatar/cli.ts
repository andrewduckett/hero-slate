/**
 * The avatar command-line entry: `save`.
 *
 * `run` is the pure part: it takes argv and an injected `AvatarDeps`, and
 * returns an outcome instead of touching the real file system, clock, or
 * process. `main` is the only impure part. Run with `vite-node`, from the
 * repo root, like the D&D Beyond tool (see design.md, D3 and D4).
 */
import sharp from 'sharp';
import { ID_GRAMMAR, MANIFEST_ID } from '#lib/data/yaml';

/** Codes reuse the D&D Beyond tool's numbers where the meaning is the same (design D3). */
export const EXIT_CODES = {
	success: 0,
	unusableInput: 1,
	targetExists: 3
} as const;

const AVATAR_SIZE = 512;
const ACCEPTED_FORMATS = ['png', 'jpeg', 'webp'];

export interface AvatarDeps {
	exists: (path: string) => boolean;
	readText: (path: string) => string;
	readBytes: (path: string) => Uint8Array;
	/** Without `replace`, the write must fail if the file exists, so a race cannot overwrite it. */
	writeFile: (path: string, content: string | Uint8Array, options?: { replace: boolean }) => void;
	now: () => Date;
}

export interface AvatarOutcome {
	exitCode: number;
	stdout: string;
	stderr: string;
}

function ok(stdout: string): AvatarOutcome {
	return { exitCode: EXIT_CODES.success, stdout, stderr: '' };
}

function fail(exitCode: number, message: string): AvatarOutcome {
	return { exitCode, stdout: '', stderr: message };
}

function characterPath(id: string): string {
	return `static/characters/${id}.yaml`;
}

function avatarPath(id: string): string {
	return `static/characters/${id}.png`;
}

const AVATAR_COMMENT_PREFIX = '# Avatar: ';

interface SaveArgs {
	imagePath: string;
	id: string;
	tool: string;
	lookFile: string;
	replace: boolean;
}

function localDate(date: Date): string {
	const pad = (n: number) => String(n).padStart(2, '0');
	return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** Puts `comment` on the first line, replacing an avatar comment already there; every other byte stays (design D6). */
function withAvatarComment(yaml: string, comment: string): string {
	const match = /\r?\n/.exec(yaml);
	const lineEnd = match?.[0] ?? '\n';
	const firstLineEnd = match ? match.index + lineEnd.length : yaml.length;
	const rest = yaml.startsWith(AVATAR_COMMENT_PREFIX) ? yaml.slice(firstLineEnd) : yaml;
	return `${comment}${lineEnd}${rest}`;
}

function parseSaveArgs(args: string[]): SaveArgs {
	const positional: string[] = [];
	let replace = false;
	let tool = '';
	let lookFile = '';
	for (let i = 0; i < args.length; i++) {
		const arg = args[i];
		if (arg === '--replace') replace = true;
		else if (arg === '--tool') tool = args[++i] ?? '';
		else if (arg === '--look-file') lookFile = args[++i] ?? '';
		else positional.push(arg);
	}
	const [imagePath = '', id = ''] = positional;
	return { imagePath, id, tool, lookFile, replace };
}

async function runSave(args: string[], deps: AvatarDeps): Promise<AvatarOutcome> {
	const { imagePath, id, tool, lookFile, replace } = parseSaveArgs(args);

	// The target path is built from the id alone, so this check is the path trust boundary.
	if (!ID_GRAMMAR.test(id)) {
		return fail(EXIT_CODES.unusableInput, `"${id}" does not match the id grammar ${ID_GRAMMAR}`);
	}
	if (id === MANIFEST_ID) {
		return fail(EXIT_CODES.unusableInput, `"${MANIFEST_ID}" is not a character id; it is reserved for the roster file`);
	}
	if (!deps.exists(characterPath(id))) {
		return fail(EXIT_CODES.unusableInput, `no character file has the id "${id}": ${characterPath(id)} does not exist`);
	}

	const look = deps.readText(lookFile).replace(/\r?\n$/, '');

	if (!replace && deps.exists(avatarPath(id))) {
		return fail(EXIT_CODES.targetExists, `${avatarPath(id)} already exists; pass --replace to replace it`);
	}

	const image = deps.readBytes(imagePath);
	let format: string | undefined;
	let width = 0;
	let height = 0;
	try {
		({ format, width, height } = await sharp(image).metadata());
	} catch {
		format = undefined;
	}
	if (format === undefined || !ACCEPTED_FORMATS.includes(format)) {
		return fail(EXIT_CODES.unusableInput, `${imagePath} is not a PNG, JPEG or WebP image`);
	}
	if (Math.min(width, height) < AVATAR_SIZE) {
		return fail(
			EXIT_CODES.unusableInput,
			`${imagePath} is ${width} × ${height}, smaller than ${AVATAR_SIZE} px on its shorter side`
		);
	}

	// Rotate first so a phone photo's orientation flag applies before the crop.
	// Top gravity keeps a tall image's head and centres a wide one (design D2).
	const png = await sharp(image)
		.rotate()
		.resize(AVATAR_SIZE, AVATAR_SIZE, { fit: 'cover', position: 'top' })
		.png()
		.toBuffer();

	try {
		deps.writeFile(avatarPath(id), png, { replace });
	} catch {
		return fail(EXIT_CODES.targetExists, `${avatarPath(id)} appeared before the write; refusing to replace it`);
	}
	const comment = `${AVATAR_COMMENT_PREFIX}${tool}, ${localDate(deps.now())}. Look: ${look}.`;
	deps.writeFile(characterPath(id), withAvatarComment(deps.readText(characterPath(id)), comment), { replace: true });
	return ok(avatarPath(id));
}

export async function run(argv: string[], deps: AvatarDeps): Promise<AvatarOutcome> {
	const [command, ...args] = argv;

	switch (command) {
		case 'save':
			return runSave(args, deps);
		default:
			return fail(EXIT_CODES.unusableInput, `unknown command "${String(command)}"`);
	}
}

async function main(): Promise<void> {
	const fs = await import('node:fs');
	const deps: AvatarDeps = {
		exists: (path) => fs.existsSync(path),
		readText: (path) => fs.readFileSync(path, 'utf8'),
		readBytes: (path) => fs.readFileSync(path),
		writeFile: (path, content, options) => fs.writeFileSync(path, content, { flag: options?.replace ? 'w' : 'wx' }),
		now: () => new Date()
	};

	const result = await run(process.argv.slice(2), deps);
	if (result.stdout) console.log(result.stdout);
	if (result.stderr) console.error(result.stderr);
	process.exit(result.exitCode);
}

// Under vite-node, process.argv[1] is vite-node's own path, so skip only
// when Vitest imports this module for its tests.
if (!process.env.VITEST) {
	main();
}
