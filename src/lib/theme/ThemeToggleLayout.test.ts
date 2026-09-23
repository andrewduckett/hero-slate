import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';

// Mock preference module.
vi.mock('$lib/theme/preference', () => ({
	THEME_STORAGE_KEY: 'hero-slate:theme',
	readPreference: vi.fn(() => null),
	writePreference: vi.fn(),
	clearPreference: vi.fn(),
	getEffectiveMode: vi.fn(() => 'dark')
}));

vi.mock('$lib/theme/palette.css', () => ({}));
vi.mock('$lib/theme/fonts.css', () => ({}));
vi.mock('$lib/theme/base.css', () => ({}));

// The toggle is now in AppHeader, which both +page.svelte and CharacterView
// use. Test that it is present and functional on the no-character index route.
import IndexPage from '../../routes/+page.svelte';

beforeEach(() => {
	vi.clearAllMocks();
	delete document.documentElement.dataset.theme;
});

describe('toggle on a route with no character', () => {
	it('the mode toggle is present on the index page', () => {
		render(IndexPage);
		expect(screen.getByRole('button')).toBeTruthy();
	});

	it('the toggle switches the mode on the index page', async () => {
		render(IndexPage);
		await fireEvent.click(screen.getByRole('button'));
		expect(document.documentElement.dataset.theme).toBe('light');
	});
});
