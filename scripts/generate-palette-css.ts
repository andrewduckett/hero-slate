/**
 * Build-time runner: writes `src/lib/theme/palette.css` from the typed palette.
 *
 * Run before `vite build` (see the `build` script) and any time the palette
 * changes, via `npm run generate:palette`. Node strips the TypeScript types
 * natively, so this needs no extra tooling; local imports carry a `.ts`
 * extension for that reason.
 */
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { generatePaletteCss } from '../src/lib/theme/generate.ts';

const here = dirname(fileURLToPath(import.meta.url));
const outPath = resolve(here, '../src/lib/theme/palette.css');

writeFileSync(outPath, generatePaletteCss(), 'utf8');
console.log(`Wrote ${outPath}`);
