import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';

// Mock preference module.
vi.mock('#lib/theme/preference', () => ({
	THEME_STORAGE_KEY: 'hero-slate:theme',
	readPreference: vi.fn(() => null),
	writePreference: vi.fn(),
	clearPreference: vi.fn(),
	getEffectiveMode: vi.fn(() => 'dark')
}));

vi.mock('#lib/theme/palette.css', () => ({}));
vi.mock('#lib/theme/fonts.css', () => ({}));
vi.mock('#lib/theme/base.css', () => ({}));

// The home page is the one route that shows the toggle: the picker asks the
// shared header for it, and a sheet does not. Test the whole route renders it.
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
