// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

// The real file, because every prompt carries it unchanged.
const guide = readFileSync(resolve(process.cwd(), '.agents/skills/character-avatar/style-guide.md'), 'utf8');

describe('the avatar style guide', () => {
	it.each([
		{ element: "a children's-book painting", pattern: /soft, painterly children's-book illustration/i },
		{ element: 'warm light', pattern: /warm light/i },
		{ element: 'a friendly face', pattern: /friendly face/i },
		{ element: 'a head-and-shoulders view', pattern: /head-and-shoulders/i },
		{ element: 'the subject centred and high', pattern: /centred and high/i },
		{ element: 'a square frame', pattern: /square frame/i },
		{ element: 'a plain, soft background', pattern: /plain, soft background/i },
		{ element: 'no text', pattern: /no text/i },
		{ element: 'no letters', pattern: /letters/i },
		{ element: 'no signature', pattern: /signature/i },
		{ element: 'no watermark', pattern: /watermark/i }
	])('asks for $element', ({ pattern }) => {
		expect(guide).toMatch(pattern);
	});
});
