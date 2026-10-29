// @vitest-environment node
import { describe, it, expect } from 'vitest';
import sharp from 'sharp';
import { run, type AvatarDeps } from './cli';

async function solidJpeg(width: number, height: number): Promise<Uint8Array> {
	return sharp({ create: { width, height, channels: 3, background: '#c08040' } })
		.jpeg()
		.toBuffer();
}

const RED = { r: 255, g: 0, b: 0 };
const BLUE = { r: 0, g: 0, b: 255 };

/** A PNG made of solid rectangles over a red canvas. */
async function bandedPng(
	width: number,
	height: number,
	blueBands: { left: number; top: number; width: number; height: number }[]
): Promise<Uint8Array> {
	const bands = await Promise.all(
		blueBands.map(async (band) => ({
			input: await sharp({ create: { width: band.width, height: band.height, channels: 3, background: BLUE } })
				.png()
				.toBuffer(),
			left: band.left,
			top: band.top
		}))
	);
	return sharp({ create: { width, height, channels: 3, background: RED } })
		.composite(bands)
		.png()
		.toBuffer();
}

async function hasBluePixels(png: Uint8Array): Promise<boolean> {
	const { data, info } = await sharp(png).raw().toBuffer({ resolveWithObject: true });
	for (let i = 0; i < data.length; i += info.channels) {
		if (data[i + 2] > data[i]) return true;
	}
	return false;
}

function fakeDeps(files: Record<string, string | Uint8Array>): AvatarDeps & {
	files: Record<string, string | Uint8Array>;
} {
	return {
		files,
		exists: (path) => path in files,
		readText: (path) => {
			const content = files[path];
			if (typeof content !== 'string') throw new Error(`no text file at ${path}`);
			return content;
		},
		readBytes: (path) => {
			const content = files[path];
			if (content === undefined) throw new Error(`no file at ${path}`);
			return typeof content === 'string' ? new TextEncoder().encode(content) : content;
		},
		writeFile: (path, content) => {
			files[path] = content;
		},
		now: () => new Date(2026, 10, 2)
	};
}

const SAVE_FLAGS = ['--tool', 'Test Tool', '--look-file', '.workspace/look.txt'];

describe('avatar save', () => {
	it('writes a 512 px square PNG for a character with a YAML file', async () => {
		const deps = fakeDeps({
			'static/characters/hero.yaml': 'name: Hero\n',
			'.workspace/look.txt': 'a hero\n',
			'.workspace/in.jpg': await solidJpeg(1024, 1024)
		});

		const result = await run(['save', '.workspace/in.jpg', 'hero', ...SAVE_FLAGS], deps);

		expect(result.exitCode).toBe(0);
		const meta = await sharp(deps.files['static/characters/hero.png'] as Uint8Array).metadata();
		expect(meta).toMatchObject({ format: 'png', width: 512, height: 512 });
	});

	it('keeps the top of a tall image', async () => {
		const deps = fakeDeps({
			'static/characters/hero.yaml': 'name: Hero\n',
			'.workspace/look.txt': 'a hero\n',
			'.workspace/in.png': await bandedPng(1024, 1536, [{ left: 0, top: 1024, width: 1024, height: 512 }])
		});

		await run(['save', '.workspace/in.png', 'hero', ...SAVE_FLAGS], deps);

		expect(await hasBluePixels(deps.files['static/characters/hero.png'] as Uint8Array)).toBe(false);
	});

	it('keeps the horizontal centre of a wide image', async () => {
		const deps = fakeDeps({
			'static/characters/hero.yaml': 'name: Hero\n',
			'.workspace/look.txt': 'a hero\n',
			'.workspace/in.png': await bandedPng(1536, 1024, [
				{ left: 0, top: 0, width: 256, height: 1024 },
				{ left: 1280, top: 0, width: 256, height: 1024 }
			])
		});

		await run(['save', '.workspace/in.png', 'hero', ...SAVE_FLAGS], deps);

		expect(await hasBluePixels(deps.files['static/characters/hero.png'] as Uint8Array)).toBe(false);
	});
});

describe('avatar save refuses an id', () => {
	async function saveFor(id: string, files: Record<string, string | Uint8Array> = {}) {
		const deps = fakeDeps({
			'.workspace/look.txt': 'a hero\n',
			'.workspace/in.jpg': await solidJpeg(1024, 1024),
			...files
		});
		const before = { ...deps.files };
		const result = await run(['save', '.workspace/in.jpg', id, ...SAVE_FLAGS], deps);
		return { result, before, after: deps.files };
	}

	it('outside the id grammar', async () => {
		const { result, before, after } = await saveFor('../evil');

		expect(result).toMatchObject({ exitCode: 1, stderr: expect.stringContaining('id grammar') });
		expect(after).toEqual(before);
	});

	it('reserved for the manifest', async () => {
		const manifest = 'characters:\n  - hero\n';
		const { result, before, after } = await saveFor('manifest', { 'static/characters/manifest.yaml': manifest });

		expect(result).toMatchObject({ exitCode: 1, stderr: expect.stringContaining('"manifest" is not a character id') });
		expect(after).toEqual(before);
	});

	it('with no character file', async () => {
		const { result, before, after } = await saveFor('nobody');

		expect(result).toMatchObject({ exitCode: 1, stderr: expect.stringContaining('no character file') });
		expect(after).toEqual(before);
	});
});

describe('avatar save refuses an image', () => {
	async function saveImage(image: string | Uint8Array) {
		const deps = fakeDeps({
			'static/characters/hero.yaml': 'name: Hero\n',
			'.workspace/look.txt': 'a hero\n',
			'.workspace/in': image
		});
		const before = { ...deps.files };
		const result = await run(['save', '.workspace/in', 'hero', ...SAVE_FLAGS], deps);
		return { result, before, after: deps.files };
	}

	it('that is not a PNG, JPEG or WebP file', async () => {
		const { result, before, after } = await saveImage('just some text\n');

		expect(result).toMatchObject({ exitCode: 1, stderr: expect.stringContaining('not a PNG, JPEG or WebP image') });
		expect(after).toEqual(before);
	});

	it('under 512 px on its shorter side', async () => {
		const { result, before, after } = await saveImage(await solidJpeg(400, 600));

		expect(result).toMatchObject({ exitCode: 1, stderr: expect.stringContaining('smaller than 512 px on its shorter side') });
		expect(after).toEqual(before);
	});
});

describe('avatar save over an existing avatar', () => {
	async function depsWithAvatar() {
		return fakeDeps({
			'static/characters/hero.yaml': 'name: Hero\n',
			'static/characters/hero.png': new Uint8Array([1, 2, 3]),
			'.workspace/look.txt': 'a hero\n',
			'.workspace/in.jpg': await solidJpeg(1024, 1024)
		});
	}

	it('keeps every file without the replace flag', async () => {
		const deps = await depsWithAvatar();
		const before = { ...deps.files };

		const result = await run(['save', '.workspace/in.jpg', 'hero', ...SAVE_FLAGS], deps);

		expect(result).toMatchObject({ exitCode: 3, stderr: expect.stringContaining('--replace') });
		expect(deps.files).toEqual(before);
	});

	it('replaces the avatar with the replace flag', async () => {
		const deps = await depsWithAvatar();

		const result = await run(['save', '.workspace/in.jpg', 'hero', ...SAVE_FLAGS, '--replace'], deps);

		expect(result.exitCode).toBe(0);
		const meta = await sharp(deps.files['static/characters/hero.png'] as Uint8Array).metadata();
		expect(meta).toMatchObject({ format: 'png', width: 512, height: 512 });
	});
});

describe('avatar save records provenance', () => {
	const PROVENANCE_FLAGS = ['--tool', 'Gemini 3 Pro Image', '--look-file', '.workspace/look.txt'];
	const NEW_COMMENT = '# Avatar: Gemini 3 Pro Image, 2026-11-02. Look: dwarf, red braided beard, sun shield.';

	async function saveWith(yaml: string, extraFlags: string[] = []) {
		const deps = fakeDeps({
			'static/characters/hero.yaml': yaml,
			'.workspace/look.txt': 'dwarf, red braided beard, sun shield\n',
			'.workspace/in.jpg': await solidJpeg(1024, 1024)
		});
		await run(['save', '.workspace/in.jpg', 'hero', ...PROVENANCE_FLAGS, ...extraFlags], deps);
		return deps.files['static/characters/hero.yaml'] as string;
	}

	it('adds the avatar comment above the first line of the character file', async () => {
		const yaml = '# A note the Author wrote.\nname: Hero\nlevel: 3\n';

		expect(await saveWith(yaml)).toBe(`${NEW_COMMENT}\n${yaml}`);
	});

	it('replaces an avatar comment already on the first line', async () => {
		const rest = '# A note the Author wrote.\r\nname: Hero\r\n';
		const yaml = `# Avatar: Old Tool, 2025-01-01. Look: an old look.\r\n${rest}`;

		expect(await saveWith(yaml, ['--replace'])).toBe(`${NEW_COMMENT}\r\n${rest}`);
	});
});
