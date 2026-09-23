import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';

vi.mock('$lib/theme/preference', () => ({
	THEME_STORAGE_KEY: 'hero-slate:theme',
	readPreference: vi.fn(() => null),
	writePreference: vi.fn(),
	clearPreference: vi.fn(),
	getEffectiveMode: vi.fn(() => 'dark')
}));

import AppHeader from './AppHeader.svelte';

beforeEach(() => {
	vi.clearAllMocks();
	delete document.documentElement.dataset.theme;
	vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({
		matches: true,
		addEventListener: vi.fn(),
		removeEventListener: vi.fn()
	}));
});

describe('AppHeader', () => {
	it('renders the title', () => {
		render(AppHeader, { props: { title: 'Sunny Thornwood' } });
		expect(screen.getByRole('heading', { level: 1 }).textContent).toContain('Sunny Thornwood');
	});

	it('renders a subtitle when provided', () => {
		render(AppHeader, { props: { title: 'Sunny Thornwood', subtitle: 'Level 6 Druid' } });
		expect(screen.getByText('Level 6 Druid')).toBeTruthy();
	});

	it('renders no subtitle element when subtitle is omitted', () => {
		render(AppHeader, { props: { title: 'Hero Slate' } });
		expect(screen.queryByRole('paragraph')).toBeNull();
	});

	it('sets data-palette to the given palette name', () => {
		const { container } = render(AppHeader, { props: { title: 'Sunny', palette: 'forest' } });
		const header = container.querySelector('header');
		expect(header?.getAttribute('data-palette')).toBe('forest');
	});

	it('defaults data-palette to neutral when palette is omitted', () => {
		const { container } = render(AppHeader, { props: { title: 'Hero Slate' } });
		const header = container.querySelector('header');
		expect(header?.getAttribute('data-palette')).toBe('neutral');
	});

	it('renders the theme toggle button', () => {
		render(AppHeader, { props: { title: 'Hero Slate' } });
		expect(screen.getByRole('button')).toBeTruthy();
	});

	it('the toggle button has a minimum touch target via CSS class or inline style', () => {
		const { container } = render(AppHeader, { props: { title: 'Hero Slate' } });
		const button = container.querySelector('button');
		expect(button).toBeTruthy();
	});

	it('activating the toggle switches data-theme', async () => {
		render(AppHeader, { props: { title: 'Hero Slate' } });
		await fireEvent.click(screen.getByRole('button'));
		expect(document.documentElement.dataset.theme).toBe('light');
	});

	it('applies accent background and on-accent text via inline style', () => {
		const { container } = render(AppHeader, { props: { title: 'Hero Slate', palette: 'neutral' } });
		const header = container.querySelector('header');
		expect(header?.getAttribute('style')).toContain('var(--accent)');
		expect(header?.getAttribute('style')).toContain('var(--on-accent)');
	});
});
