import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import RichText from './RichText.svelte';
import { parse } from './parse';
import type { Node } from './parse';

function text(t: string): Node { return { kind: 'text', text: t }; }
function strong(...children: Node[]): Node { return { kind: 'strong', children }; }
function em(...children: Node[]): Node { return { kind: 'em', children }; }
function pill(flavor: 'dice' | 'bonus', t: string): Node { return { kind: 'pill', flavor, text: t }; }

// --- 2.1 Mount without error ---

describe('RichText: mount', () => {
	it('mounts with empty nodes without error', () => {
		const { container } = render(RichText, { props: { nodes: [] } });
		expect(container).toBeTruthy();
	});

	it('mounts with plain text nodes without error', () => {
		const { container } = render(RichText, { props: { nodes: [text('hello')] } });
		expect(container.textContent).toContain('hello');
	});
});

// --- 2.2 Element rendering ---

describe('RichText: bold renders <strong>', () => {
	it('renders strong node as <strong>', () => {
		const { container } = render(RichText, {
			props: { nodes: [strong(text('attack'))] }
		});
		const el = container.querySelector('strong');
		expect(el).toBeTruthy();
		expect(el!.textContent).toBe('attack');
	});
});

describe('RichText: italic renders <em>', () => {
	it('renders em node as <em>', () => {
		const { container } = render(RichText, {
			props: { nodes: [em(text('easier'))] }
		});
		const el = container.querySelector('em');
		expect(el).toBeTruthy();
		expect(el!.textContent).toBe('easier');
	});
});

describe('RichText: pill rendering', () => {
	it('dice pill contains the 🎲 glyph', () => {
		const { container } = render(RichText, {
			props: { nodes: [pill('dice', 'd20+6')] }
		});
		expect(container.textContent).toContain('🎲');
		expect(container.textContent).toContain('d20+6');
	});

	it('bonus pill has no glyph', () => {
		const { container } = render(RichText, {
			props: { nodes: [pill('bonus', '+7')] }
		});
		expect(container.textContent).not.toContain('🎲');
		expect(container.textContent).toContain('+7');
	});

	it('pill has data-flavor attribute', () => {
		const { container } = render(RichText, {
			props: { nodes: [pill('dice', 'd20+6')] }
		});
		const span = container.querySelector('[data-flavor]');
		expect(span?.getAttribute('data-flavor')).toBe('dice');
	});

	it('pill is not interactive (no button or link)', () => {
		const { container } = render(RichText, {
			props: { nodes: [pill('dice', 'd20+6')] }
		});
		expect(container.querySelector('button')).toBeNull();
		expect(container.querySelector('a')).toBeNull();
	});
});

describe('RichText: text nodes escape HTML characters', () => {
	it('renders < and > as visible characters, not as HTML', () => {
		const { container } = render(RichText, {
			props: { nodes: [text('<img src=x>')] }
		});
		expect(container.querySelector('img')).toBeNull();
		expect(container.textContent).toContain('<img src=x>');
	});
});

describe('RichText: emoji render as authored', () => {
	it('renders an emoji inline, unescaped and unfiltered', () => {
		const { container } = render(RichText, {
			props: { nodes: parse('Turn into an animal 🐺') }
		});
		expect(container.textContent).toBe('Turn into an animal 🐺');
	});

	it('renders an emoji inside a bold span', () => {
		const { container } = render(RichText, {
			props: { nodes: parse('**🐺 wolf**') }
		});
		expect(container.querySelector('strong')?.textContent).toBe('🐺 wolf');
	});
});

// --- 2.3 XSS rendering safety ---

describe('RichText: XSS safety (end-to-end through parse)', () => {
	it('renders <script>alert(1)</script> as visible text with no script element', () => {
		const { container } = render(RichText, {
			props: { nodes: parse('<script>alert(1)</script>') }
		});
		expect(container.querySelector('script')).toBeNull();
		expect(container.textContent).toContain('<script>');
	});

	it('renders [[</span><img onerror=x>]] as a pill with no injected elements', () => {
		const { container } = render(RichText, {
			props: { nodes: parse('[[</span><img onerror=x>]]') }
		});
		expect(container.querySelector('img')).toBeNull();
		expect(container.textContent).toContain('</span>');
	});

	it('renders **<b>hi</b>** as a bold span with literal text, no nested <b>', () => {
		const { container } = render(RichText, {
			props: { nodes: parse('**<b>hi</b>**') }
		});
		expect(container.querySelector('b')).toBeNull();
		const strong = container.querySelector('strong');
		expect(strong?.textContent).toContain('<b>hi</b>');
	});
});
