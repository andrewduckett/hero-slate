/**
 * Compare a saved character file with an edited draft, for the edit-mode
 * preview: the change list, and the warnings for silent losses an edit can
 * cause (see design.md, D-5 and D-6).
 */

type Mapping = Record<string, unknown>;

function isMapping(value: unknown): value is Mapping {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function deepEqual(a: unknown, b: unknown): boolean {
	if (a === b) return true;
	if (Array.isArray(a) && Array.isArray(b)) {
		return a.length === b.length && a.every((item, i) => deepEqual(item, b[i]));
	}
	if (isMapping(a) && isMapping(b)) {
		const keys = Object.keys(a);
		return keys.length === Object.keys(b).length && keys.every((key) => key in b && deepEqual(a[key], b[key]));
	}
	return false;
}

/** A value as the Author wrote it: a string in double quotes, a number or boolean bare, anything else as one-line JSON. */
function show(value: unknown): string {
	return JSON.stringify(value) ?? String(value);
}

/** Keys of both mappings: the saved file's in its order, then the draft's new ones in theirs. */
function unionKeys(saved: Mapping, draft: Mapping): string[] {
	return [...Object.keys(saved), ...Object.keys(draft).filter((key) => !(key in saved))];
}

/** A field of a paired entry, where a missing field shows as `(none)`. */
function showField(entry: Mapping, field: string): string {
	return field in entry ? show(entry[field]) : '(none)';
}

function compareField(name: string, saved: Mapping, draft: Mapping, key: string): string[] {
	if (!(key in draft)) return [`removed ${name}: ${show(saved[key])}`];
	if (!(key in saved)) return [`added ${name}: ${show(draft[key])}`];
	if (deepEqual(saved[key], draft[key])) return [];
	return [`changed ${name}: ${show(saved[key])} → ${show(draft[key])}`];
}

/**
 * How one list block matches and names its entries. An entry's key is its
 * first present key field. The three phrases place an entry in its block for
 * an added, removed and changed line, as in `added "Wits" to abilities` or
 * `changed pool wild-shape max: 3 → 4`. A block with `nested` compares that
 * field of a paired entry as a list of its own, such as a section's rows.
 */
interface ListBlock {
	keyFields: string[];
	bareKey: boolean;
	subject: (key: string) => string;
	to: string;
	from: string;
	in: string;
	/** The block as an order line names it: `the order of <orderName> changed`. */
	orderName: string;
	nested?: { field: string; block: (key: string) => ListBlock };
}

const labelled = (block: string): ListBlock => ({
	keyFields: ['label'],
	bareKey: false,
	subject: (key) => key,
	to: ` to ${block}`,
	from: ` from ${block}`,
	in: ` in ${block}`,
	orderName: block
});
const named = (keyField: string, noun: string, block: string): ListBlock => ({
	keyFields: [keyField],
	bareKey: true,
	subject: (key) => `${noun} ${key}`,
	to: '',
	from: '',
	in: '',
	orderName: block
});
const rowsOf = (section: string): ListBlock => ({
	keyFields: ['title', 'body'],
	bareKey: false,
	subject: (key) => `row ${key}`,
	to: ` to section ${section}`,
	from: ` from section ${section}`,
	in: ` in section ${section}`,
	orderName: `rows in section ${section}`
});

const LIST_BLOCKS: Record<string, ListBlock> = {
	abilities: labelled('abilities'),
	combat: labelled('combat'),
	pools: named('id', 'pool', 'pools'),
	sections: {
		keyFields: ['title'],
		bareKey: false,
		subject: (key) => `section ${key}`,
		to: '',
		from: '',
		in: '',
		orderName: 'sections',
		nested: { field: 'rows', block: rowsOf }
	},
	links: named('url', 'link', 'links')
};

function keyText(block: ListBlock, entry: unknown): string {
	const field = block.keyFields.find((name) => isMapping(entry) && entry[name] !== undefined);
	if (field === undefined || !isMapping(entry)) return `(no ${block.keyFields[0]})`;
	const key = entry[field];
	return typeof key === 'string' && block.bareKey ? key : show(key);
}

const isListOrAbsent = (value: unknown) => value === undefined || Array.isArray(value);
const asList = (value: unknown): unknown[] => (Array.isArray(value) ? value : []);

interface Pair {
	saved: unknown;
	draft: unknown;
	draftIndex: number;
	key: string;
}

/** Pair saved and draft entries that share a key, in their order within that key. */
function pairEntries(block: ListBlock, saved: unknown[], draft: unknown[]) {
	const draftKeys = draft.map((entry) => keyText(block, entry));
	const paired = new Set<number>();
	const pairs: Pair[] = [];
	const removed: string[] = [];

	for (const entry of saved) {
		const key = keyText(block, entry);
		const draftIndex = draftKeys.findIndex((draftKey, i) => draftKey === key && !paired.has(i));
		if (draftIndex < 0) {
			removed.push(key);
		} else {
			paired.add(draftIndex);
			pairs.push({ saved: entry, draft: draft[draftIndex], draftIndex, key });
		}
	}

	const added = draftKeys.filter((_, i) => !paired.has(i));
	return { pairs, removed, added };
}

function compareEntry(block: ListBlock, pair: Pair): string[] {
	const where = `${block.subject(pair.key)}${block.in}`;
	if (!isMapping(pair.saved) || !isMapping(pair.draft)) {
		return deepEqual(pair.saved, pair.draft) ? [] : [`changed ${where}: ${show(pair.saved)} → ${show(pair.draft)}`];
	}
	const { saved, draft } = pair;
	return unionKeys(saved, draft).flatMap((field) => {
		const nested = block.nested?.field === field ? block.nested : undefined;
		if (nested && isListOrAbsent(saved[field]) && isListOrAbsent(draft[field])) {
			return compareList(nested.block(pair.key), asList(saved[field]), asList(draft[field]));
		}
		return deepEqual(saved[field], draft[field])
			? []
			: [`changed ${where} ${field}: ${showField(saved, field)} → ${showField(draft, field)}`];
	});
}

/** Pairs come in saved order, so the order is kept when their draft positions only rise. */
function inDraftOrder(pairs: Pair[]): boolean {
	return pairs.every((pair, i) => i === 0 || pairs[i - 1].draftIndex < pair.draftIndex);
}

function compareList(block: ListBlock, saved: unknown[], draft: unknown[]): string[] {
	const { pairs, removed, added } = pairEntries(block, saved, draft);
	return [
		...removed.map((key) => `removed ${block.subject(key)}${block.from}`),
		...pairs.flatMap((pair) => compareEntry(block, pair)),
		...added.map((key) => `added ${block.subject(key)}${block.to}`),
		...(inDraftOrder(pairs) ? [] : [`the order of ${block.orderName} changed`])
	];
}


export function listChanges(saved: Mapping, draft: Mapping): string[] {
	const lines: string[] = [];
	for (const key of unionKeys(saved, draft)) {
		const savedValue = saved[key];
		const draftValue = draft[key];
		const block = LIST_BLOCKS[key];
		if (block && isListOrAbsent(savedValue) && isListOrAbsent(draftValue)) {
			lines.push(...compareList(block, asList(savedValue), asList(draftValue)));
		} else if (key === 'hitPoints' && isMapping(savedValue) && isMapping(draftValue)) {
			for (const field of unionKeys(savedValue, draftValue)) {
				lines.push(...compareField(`hitPoints.${field}`, savedValue, draftValue, field));
			}
		} else {
			lines.push(...compareField(key, saved, draft, key));
		}
	}
	if (lines.length === 0) lines.push('No changes');
	return lines.map((line) => `  - ${line}`);
}
