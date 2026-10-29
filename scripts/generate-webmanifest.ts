/**
 * Build-time runner: writes `static/manifest.webmanifest` from the typed
 * palette. Run before `vite build` (see the `build` script) and any time the
 * palette changes, via `npm run generate:webmanifest`.
 */
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { renderWebManifest } from '../src/lib/install/webmanifest.ts';

const here = dirname(fileURLToPath(import.meta.url));
const outPath = resolve(here, '../static/manifest.webmanifest');

writeFileSync(outPath, renderWebManifest(), 'utf8');
console.log(`Wrote ${outPath}`);
