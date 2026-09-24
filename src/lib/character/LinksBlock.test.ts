import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import LinksBlock from './LinksBlock.svelte';

describe('LinksBlock: no valid links renders nothing', () => {
	it('renders nothing when links is undefined', () => {
		const { container } = render(LinksBlock, { props: { links: undefined, palette: 'neutral' } });
		expect(container.querySelector('[data-block="links"]')).toBeNull();
	});

	it('renders nothing when links is an empty array', () => {
		const { container } = render(LinksBlock, { props: { links: [], palette: 'neutral' } });
		expect(container.querySelector('[data-block="links"]')).toBeNull();
	});

	it('renders nothing when every link is dropped', () => {
		const { container } = render(LinksBlock, {
			props: { links: [{ url: 'javascript:alert(1)' }], palette: 'neutral' }
		});
		expect(container.querySelector('[data-block="links"]')).toBeNull();
	});
});

describe('LinksBlock: one chip per kept link, in authored order', () => {
	it('renders a chip per link', () => {
		const { container } = render(LinksBlock, {
			props: {
				links: [
					{ url: 'https://a.example.com', label: 'Sheet' },
					{ url: 'https://b.example.com', label: 'Spells' },
					{ url: 'https://c.example.com', label: 'Map' }
				],
				palette: 'neutral'
			}
		});
		const anchors = container.querySelectorAll('a');
		expect(anchors).toHaveLength(3);
		expect([...anchors].map((a) => a.querySelector('.label')?.textContent)).toEqual([
			'Sheet',
			'Spells',
			'Map'
		]);
	});
});

describe('LinksBlock: anchor attributes', () => {
	it('opens in a new tab without a referrer', () => {
		const { container } = render(LinksBlock, {
			props: { links: [{ url: 'https://example.com', label: 'Example' }], palette: 'neutral' }
		});
		const anchor = container.querySelector('a') as HTMLAnchorElement;
		expect(anchor.getAttribute('target')).toBe('_blank');
		expect(anchor.getAttribute('rel')).toBe('noopener noreferrer');
	});

	it('carries data-palette from the resolved link', () => {
		const { container } = render(LinksBlock, {
			props: {
				links: [{ url: 'https://example.com', label: 'Example', color: 'fire' }],
				palette: 'ocean'
			}
		});
		const item = container.querySelector('[data-palette]') as HTMLElement;
		expect(item.getAttribute('data-palette')).toBe('fire');
	});
});

describe('LinksBlock: label safety', () => {
	it('renders an HTML label as literal text with no em element', () => {
		const { container } = render(LinksBlock, {
			props: { links: [{ url: 'https://example.com', label: '<em>Spells</em>' }], palette: 'neutral' }
		});
		expect(container.querySelector('em')).toBeNull();
		expect(container.querySelector('.label')?.textContent).toBe('<em>Spells</em>');
	});
});

describe('LinksBlock: arrow and accessible name', () => {
	it('hides the arrow from assistive technology', () => {
		const { container } = render(LinksBlock, {
			props: { links: [{ url: 'https://example.com', label: 'Example' }], palette: 'neutral' }
		});
		const arrow = container.querySelector('[aria-hidden="true"]');
		expect(arrow).toBeTruthy();
	});

	it('includes the label and the new-tab notice in the accessible name', () => {
		const { container } = render(LinksBlock, {
			props: { links: [{ url: 'https://example.com', label: 'D&D Beyond' }], palette: 'neutral' }
		});
		const anchor = container.querySelector('a') as HTMLAnchorElement;
		const text = anchor.textContent?.replace(/\s+/g, ' ').trim();
		expect(text).toContain('D&D Beyond');
		expect(text?.toLowerCase()).toContain('opens in a new tab');
	});
});
