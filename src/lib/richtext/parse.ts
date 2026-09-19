export type Node =
	| { kind: 'text'; text: string }
	| { kind: 'strong'; children: Node[] }
	| { kind: 'em'; children: Node[] }
	| { kind: 'pill'; flavor: 'dice' | 'bonus'; text: string };

// A marker opens a span only when no span of that kind is already open; otherwise
// it closes the open one. So at most one strong and one em are ever open at once,
// which bounds nesting — and the renderer's recursion — at two levels.
interface Frame {
	kind: 'strong' | 'em';
	delimiter: string;
	children: Node[];
}

const BONUS_RE = /^[+-]\d+$/;

export function parse(body: string): Node[] {
	const root: Node[] = [];
	const stack: Frame[] = [];
	let pos = 0;
	let buf = '';

	function current(): Node[] {
		return stack.length > 0 ? stack[stack.length - 1].children : root;
	}

	function flushBuf(): void {
		if (buf.length === 0) return;
		current().push({ kind: 'text', text: buf });
		buf = '';
	}

	// Close the most recently opened frame of the given kind.
	// Any inner frames of a different kind are abandoned: their opening
	// delimiter is rendered as literal text within the closed span.
	function closeKind(kind: 'strong' | 'em'): void {
		let idx = -1;
		for (let i = stack.length - 1; i >= 0; i--) {
			if (stack[i].kind === kind) { idx = i; break; }
		}
		if (idx === -1) return;

		// Collapse inner frames (from innermost outward) into frame[idx].children
		while (stack.length > idx + 1) {
			const inner = stack.pop()!;
			const target = stack[stack.length - 1]; // frame at idx after inner is gone
			target.children.push({ kind: 'text', text: inner.delimiter }, ...inner.children);
		}

		const frame = stack.pop()!;
		const node: Node = { kind: frame.kind, children: frame.children };
		current().push(node);
	}

	while (pos < body.length) {
		// Try [[...]] pill
		if (body[pos] === '[' && body[pos + 1] === '[') {
			const closeIdx = body.indexOf(']]', pos + 2);
			flushBuf();
			if (closeIdx !== -1) {
				const inner = body.slice(pos + 2, closeIdx);
				const trimmed = inner.trim();
				if (trimmed.length === 0) {
					current().push({ kind: 'text', text: body.slice(pos, closeIdx + 2) });
				} else if (BONUS_RE.test(trimmed)) {
					current().push({ kind: 'pill', flavor: 'bonus', text: trimmed });
				} else {
					current().push({ kind: 'pill', flavor: 'dice', text: trimmed });
				}
				pos = closeIdx + 2;
			} else {
				current().push({ kind: 'text', text: '[[' });
				pos += 2;
			}
			continue;
		}

		// Try ** (strong) — must check before single * to give ** priority
		if (body[pos] === '*' && body[pos + 1] === '*') {
			flushBuf();
			if (stack.some(f => f.kind === 'strong')) {
				closeKind('strong');
			} else {
				stack.push({ kind: 'strong', delimiter: '**', children: [] });
			}
			pos += 2;
			continue;
		}

		// Try * (em)
		if (body[pos] === '*') {
			flushBuf();
			if (stack.some(f => f.kind === 'em')) {
				closeKind('em');
			} else {
				stack.push({ kind: 'em', delimiter: '*', children: [] });
			}
			pos += 1;
			continue;
		}

		buf += body[pos];
		pos++;
	}

	flushBuf();

	// Flush unclosed spans (innermost to outermost): opening delimiter + children
	// become literal text in the parent.
	while (stack.length > 0) {
		const frame = stack.pop()!;
		const ch = stack.length > 0 ? stack[stack.length - 1].children : root;
		ch.push({ kind: 'text', text: frame.delimiter }, ...frame.children);
	}

	return root;
}
