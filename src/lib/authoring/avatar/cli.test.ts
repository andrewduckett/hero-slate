// @vitest-environment node
import { describe, it, expect } from 'vitest';
import sharp from 'sharp';
import { run, type AvatarDeps } from './cli';

async function solidJpeg(width: number, height: number): Promise<Uint8Array> {
	return sharp({ create: { width, height, channels: 3, background: '#c08040' } })
		.jpeg()
		.toBuffer();
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
});
