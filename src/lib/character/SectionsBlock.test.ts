import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import SectionsBlock from './SectionsBlock.svelte';

describe('SectionsBlock: no sections renders nothing', () => {
	it('renders nothing when sections is undefined', () => {
		const { container } = render(SectionsBlock, { props: { sections: undefined } });
		expect(container.querySelector('.sections')).toBeNull();
	});

	it('renders nothing when sections is an empty array', () => {
		const { container } = render(SectionsBlock, { props: { sections: [] } });
		expect(container.querySelector('.sections')).toBeNull();
	});

	it('renders nothing when all sections have no valid rows', () => {
		const { container } = render(SectionsBlock, {
			props: { sections: [{ title: 'Empty', rows: [] }] }
		});
		expect(container.querySelector('.sections')).toBeNull();
	});
});

describe('SectionsBlock: valid section renders heading and rows', () => {
	it('renders the section heading', () => {
		const { container } = render(SectionsBlock, {
			props: {
				sections: [{ title: 'Your Turn', color: 'forest', rows: [{ body: 'Attack' }] }]
			}
		});
		expect(container.querySelector('.section-heading')?.textContent?.trim()).toBe('Your Turn');
	});

	it('renders the row body via RichText', () => {
		const { container } = render(SectionsBlock, {
			props: {
				sections: [{ title: 'S', rows: [{ body: 'Do **this** now' }] }]
			}
		});
		const strong = container.querySelector('strong');
		expect(strong?.textContent).toBe('this');
	});
});

describe('SectionsBlock: section heading uses data-palette', () => {
	it('sets data-palette on the section container', () => {
		const { container } = render(SectionsBlock, {
			props: {
				sections: [{ title: 'S', color: 'ocean', rows: [{ body: 'x' }] }]
			}
		});
		const section = container.querySelector('[data-palette]');
		expect(section?.getAttribute('data-palette')).toBe('ocean');
	});

	it('falls back to neutral for an unknown color', () => {
		const { container } = render(SectionsBlock, {
			props: {
				sections: [{ title: 'S', color: 'neon', rows: [{ body: 'x' }] }]
			}
		});
		const section = container.querySelector('[data-palette]');
		expect(section?.getAttribute('data-palette')).toBe('neutral');
	});
});

describe('SectionsBlock: row title uses accent color', () => {
	it('renders row title element when title is present', () => {
		const { container } = render(SectionsBlock, {
			props: {
				sections: [{ title: 'S', rows: [{ title: 'Attack', body: 'Roll **d20**' }] }]
			}
		});
		expect(container.querySelector('.row-title')?.textContent?.trim()).toBe('Attack');
	});
});

describe('SectionsBlock: duplicate authored content never breaks the sheet', () => {
	it('renders two sections that share a title', () => {
		const { container } = render(SectionsBlock, {
			props: {
				sections: [
					{ title: 'Notes', rows: [{ body: 'first' }] },
					{ title: 'Notes', rows: [{ body: 'second' }] }
				]
			}
		});
		expect(container.querySelectorAll('section')).toHaveLength(2);
		expect(container.textContent).toContain('first');
		expect(container.textContent).toContain('second');
	});

	it('renders two identical rows within a section', () => {
		const { container } = render(SectionsBlock, {
			props: { sections: [{ title: 'S', rows: [{ body: 'same' }, { body: 'same' }] }] }
		});
		expect(container.querySelectorAll('.row')).toHaveLength(2);
	});

	it('renders two rows sharing both title and body', () => {
		const { container } = render(SectionsBlock, {
			props: {
				sections: [
					{ title: 'S', rows: [{ title: 'T', body: 'b' }, { title: 'T', body: 'b' }] }
				]
			}
		});
		expect(container.querySelectorAll('.row')).toHaveLength(2);
	});
});

describe('SectionsBlock: body-only row renders without a title column', () => {
	it('renders no .row-title when the row has no title', () => {
		const { container } = render(SectionsBlock, {
			props: {
				sections: [{ title: 'S', rows: [{ body: 'Just a prompt' }] }]
			}
		});
		expect(container.querySelector('.row-title')).toBeNull();
	});

	it('still renders the body when there is no title', () => {
		const { container } = render(SectionsBlock, {
			props: {
				sections: [{ title: 'S', rows: [{ body: 'Just a prompt' }] }]
			}
		});
		expect(container.textContent).toContain('Just a prompt');
	});
});
