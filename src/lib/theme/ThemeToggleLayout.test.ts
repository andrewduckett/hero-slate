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

// Suppress CSS import errors from the layout.
vi.mock('$lib/theme/palette.css', () => ({}));
vi.mock('$lib/theme/fonts.css', () => ({}));
vi.mock('$lib/theme/base.css', () => ({}));

import Layout from '../../routes/+layout.svelte';

beforeEach(() => {
	vi.clearAllMocks();
	delete document.documentElement.dataset.theme;
	vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({
		matches: true,
		addEventListener: vi.fn(),
		removeEventListener: vi.fn()
	}));
});

describe('toggle on a route with no character', () => {
	it('the mode toggle is present in the layout without a character', () => {
		render(Layout);
		const button = screen.getByRole('button');
		expect(button).toBeTruthy();
	});

	it('the toggle switches the mode on a no-character route', async () => {
		render(Layout);
		const button = screen.getByRole('button');
		await fireEvent.click(button);
		expect(document.documentElement.dataset.theme).toBe('light');
	});
});
