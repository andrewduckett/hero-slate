/**
 * Rewrite a recorded D&D Beyond character response in place, blanking its
 * personal fields (design D12, ADR 0010). Run this on every newly recorded
 * response before committing it under `src/lib/ingest/ddb/fixtures/`.
 *
 * Usage: node scripts/blank-ddb-fixture.ts <path-to-response.json>
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { blankFixture } from '../src/lib/ingest/ddb/fixturePrivacy.ts';

const path = process.argv[2];
if (!path) {
	console.error('Usage: node scripts/blank-ddb-fixture.ts <path-to-response.json>');
	process.exit(1);
}

const body = JSON.parse(readFileSync(path, 'utf8'));
writeFileSync(path, JSON.stringify(blankFixture(body)), 'utf8');
console.log(`Blanked ${path}`);
