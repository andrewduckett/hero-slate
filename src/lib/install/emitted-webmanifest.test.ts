import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { renderWebManifest } from './webmanifest';

describe('emitted web app manifest', () => {
	it('the committed static/manifest.webmanifest matches the palette-built one', () => {
		const committed = readFileSync(
			resolve(process.cwd(), 'static/manifest.webmanifest'),
			'utf8'
		).replace(/\r\n/g, '\n');
		expect(committed).toBe(renderWebManifest());
	});
});
