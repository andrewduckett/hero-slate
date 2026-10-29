import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';

vi.mock('#lib/theme/preference', () => ({
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
		render(AppHeader, { props: { title: 'Test Hero' } });
		expect(screen.getByRole('heading', { level: 1 }).textContent).toContain('Test Hero');
	});

	it('renders a subtitle when provided', () => {
		render(AppHeader, { props: { title: 'Test Hero', subtitle: 'Level 6 Druid' } });
		expect(screen.getByText('Level 6 Druid')).toBeTruthy();
	});

	it('renders no subtitle element when subtitle is omitted', () => {
		render(AppHeader, { props: { title: 'Hero Slate' } });
		expect(screen.queryByRole('paragraph')).toBeNull();
	});

	it('sets data-palette to the given palette name', () => {
		const { container } = render(AppHeader, { props: { title: 'Test Hero', palette: 'forest' } });
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

	it('shows the avatar image', () => {
		const { container } = render(AppHeader, {
			props: { title: 'Test Hero', avatar: '/characters/test-hero.png' }
		});
		expect(container.querySelector('header img')?.getAttribute('src')).toBe('/characters/test-hero.png');
	});

	it('marks the header with data-avatar while the avatar shows', () => {
		const { container } = render(AppHeader, {
			props: { title: 'Test Hero', avatar: '/characters/test-hero.png' }
		});
		expect(container.querySelector('header')?.hasAttribute('data-avatar')).toBe(true);
	});

	it('leaves data-avatar off a header with no avatar', () => {
		const { container } = render(AppHeader, { props: { title: 'Test Hero' } });
		expect(container.querySelector('header')?.hasAttribute('data-avatar')).toBe(false);
	});

	it('clears data-avatar after the image fails to load', async () => {
		const { container } = render(AppHeader, {
			props: { title: 'Test Hero', avatar: '/characters/missing.png' }
		});
		await fireEvent.error(container.querySelector('header img')!);
		expect(container.querySelector('header')?.hasAttribute('data-avatar')).toBe(false);
	});

	it('keeps the title, subtitle and toggle beside an avatar', () => {
		render(AppHeader, {
			props: { title: 'Test Hero', subtitle: 'Level 6 Druid', avatar: '/characters/test-hero.png' }
		});
		expect(screen.getByRole('heading', { level: 1 }).textContent).toContain('Test Hero');
		expect(screen.getByText('Level 6 Druid')).toBeTruthy();
		expect(screen.getByRole('button')).toBeTruthy();
	});

	it('sets the toggle on an opaque accent backing', () => {
		render(AppHeader, { props: { title: 'Test Hero', avatar: '/characters/test-hero.png' } });
		const backing = screen.getByRole('button').parentElement as HTMLElement;
		expect(backing.hasAttribute('data-toggle-backing')).toBe(true);
		expect(backing.style.backgroundColor).toBe('var(--accent)');
	});
});

describe('AppHeader: the way back to the picker', () => {
	it('links to the home page when its caller asks', () => {
		render(AppHeader, { props: { title: 'Test Hero', homeLink: true } });
		const link = screen.getByRole('link', { name: 'All heroes' });
		expect(link.getAttribute('href')).toBe('/');
		expect(link.textContent?.trim()).toBe('⌂');
	});

	it('shows no link to the home page by default', () => {
		render(AppHeader, { props: { title: 'Hero Slate' } });
		expect(screen.queryByRole('link', { name: 'All heroes' })).toBeNull();
	});
});
