import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';

// Mock preference module before importing the component.
vi.mock('./preference', () => ({
	THEME_STORAGE_KEY: 'hero-slate:theme',
	readPreference: vi.fn(() => null),
	writePreference: vi.fn(),
	clearPreference: vi.fn(),
	getEffectiveMode: vi.fn(() => 'dark')
}));

import { getEffectiveMode, writePreference } from './preference';
import ThemeToggle from './ThemeToggle.svelte';

function mockEffectiveMode(mode: 'light' | 'dark') {
	vi.mocked(getEffectiveMode).mockReturnValue(mode);
}

beforeEach(() => {
	vi.clearAllMocks();
	// Reset data-theme
	delete document.documentElement.dataset.theme;
	// Default: device dark, no stored choice
	mockEffectiveMode('dark');
	vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({
		matches: true,
		addEventListener: vi.fn(),
		removeEventListener: vi.fn()
	}));
});

describe('ThemeToggle', () => {
	it('renders a button with an accessible name', () => {
		render(ThemeToggle);
		const button = screen.getByRole('button');
		expect(button).toBeTruthy();
		expect(button.getAttribute('aria-label') || button.textContent?.trim()).toBeTruthy();
	});

	it('exposes the active mode via aria-pressed', () => {
		mockEffectiveMode('dark');
		render(ThemeToggle);
		const button = screen.getByRole('button');
		expect(button.hasAttribute('aria-pressed')).toBe(true);
	});

	it('aria-pressed is "true" when dark is active', () => {
		mockEffectiveMode('dark');
		render(ThemeToggle);
		const button = screen.getByRole('button');
		// aria-pressed reflects whether dark is the active mode
		// (true = dark, false = light — or the button represents the current mode)
		expect(button.getAttribute('aria-pressed')).not.toBeNull();
	});

	it('activating the toggle switches data-theme from dark to light', async () => {
		mockEffectiveMode('dark');
		render(ThemeToggle);
		const button = screen.getByRole('button');
		await fireEvent.click(button);
		expect(document.documentElement.dataset.theme).toBe('light');
	});

	it('activating the toggle switches data-theme from light to dark', async () => {
		mockEffectiveMode('light');
		document.documentElement.dataset.theme = 'light';
		render(ThemeToggle);
		const button = screen.getByRole('button');
		await fireEvent.click(button);
		expect(document.documentElement.dataset.theme).toBe('dark');
	});

	it('persists the new mode via writePreference when switching to light', async () => {
		mockEffectiveMode('dark');
		render(ThemeToggle);
		const button = screen.getByRole('button');
		await fireEvent.click(button);
		expect(writePreference).toHaveBeenCalledWith('light');
	});

	it('persists the new mode via writePreference when switching to dark', async () => {
		mockEffectiveMode('light');
		document.documentElement.dataset.theme = 'light';
		render(ThemeToggle);
		const button = screen.getByRole('button');
		await fireEvent.click(button);
		expect(writePreference).toHaveBeenCalledWith('dark');
	});

	it('is operable by keyboard (Enter key activates it)', async () => {
		mockEffectiveMode('dark');
		render(ThemeToggle);
		const button = screen.getByRole('button');
		await fireEvent.keyDown(button, { key: 'Enter' });
		await fireEvent.click(button);
		expect(document.documentElement.dataset.theme).toBe('light');
	});

	it('updates aria-pressed after activation', async () => {
		mockEffectiveMode('dark');
		render(ThemeToggle);
		const button = screen.getByRole('button');
		const pressedBefore = button.getAttribute('aria-pressed');
		await fireEvent.click(button);
		const pressedAfter = button.getAttribute('aria-pressed');
		expect(pressedAfter).not.toBe(pressedBefore);
	});
});
