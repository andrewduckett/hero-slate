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
