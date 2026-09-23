import { describe, it, expect, beforeEach, vi } from 'vitest';

// Import after mocking so the module picks up the mock.
// We mock localStorage at the global level.

describe('THEME_STORAGE_KEY', () => {
	it('equals hero-slate:theme', async () => {
		const { THEME_STORAGE_KEY } = await import('./preference');
		expect(THEME_STORAGE_KEY).toBe('hero-slate:theme');
	});
});

describe('readPreference', () => {
	beforeEach(() => {
		vi.stubGlobal('localStorage', {
			getItem: vi.fn(),
			setItem: vi.fn(),
			removeItem: vi.fn()
		});
	});

	it('returns light when light is stored', async () => {
		vi.mocked(localStorage.getItem).mockReturnValue('light');
		const { readPreference } = await import('./preference');
		expect(readPreference()).toBe('light');
	});

	it('returns dark when dark is stored', async () => {
		vi.mocked(localStorage.getItem).mockReturnValue('dark');
		const { readPreference } = await import('./preference');
		expect(readPreference()).toBe('dark');
	});

	it('returns null for empty string', async () => {
		vi.mocked(localStorage.getItem).mockReturnValue('');
		const { readPreference } = await import('./preference');
		expect(readPreference()).toBeNull();
	});

	it('returns null for system', async () => {
		vi.mocked(localStorage.getItem).mockReturnValue('system');
		const { readPreference } = await import('./preference');
		expect(readPreference()).toBeNull();
	});

	it('returns null for JSON string', async () => {
		vi.mocked(localStorage.getItem).mockReturnValue('{"mode":"dark"}');
		const { readPreference } = await import('./preference');
		expect(readPreference()).toBeNull();
	});

	it('returns null for whitespace', async () => {
		vi.mocked(localStorage.getItem).mockReturnValue(' dark ');
		const { readPreference } = await import('./preference');
		expect(readPreference()).toBeNull();
	});

	it('returns null when localStorage.getItem throws', async () => {
		vi.mocked(localStorage.getItem).mockImplementation(() => {
			throw new Error('storage blocked');
		});
		const { readPreference } = await import('./preference');
		expect(() => readPreference()).not.toThrow();
		expect(readPreference()).toBeNull();
	});
});

describe('writePreference', () => {
	beforeEach(() => {
		vi.stubGlobal('localStorage', {
			getItem: vi.fn(),
			setItem: vi.fn(),
			removeItem: vi.fn()
		});
	});

	it('persists light to localStorage', async () => {
		const { writePreference, THEME_STORAGE_KEY } = await import('./preference');
		writePreference('light');
		expect(localStorage.setItem).toHaveBeenCalledWith(THEME_STORAGE_KEY, 'light');
	});

	it('persists dark to localStorage', async () => {
		const { writePreference, THEME_STORAGE_KEY } = await import('./preference');
		writePreference('dark');
		expect(localStorage.setItem).toHaveBeenCalledWith(THEME_STORAGE_KEY, 'dark');
	});

	it('does not throw when localStorage.setItem throws', async () => {
		vi.mocked(localStorage.setItem).mockImplementation(() => {
			throw new Error('storage blocked');
		});
		const { writePreference } = await import('./preference');
		expect(() => writePreference('dark')).not.toThrow();
	});
});

describe('getEffectiveMode', () => {
	beforeEach(() => {
		vi.stubGlobal('localStorage', {
			getItem: vi.fn(),
			setItem: vi.fn(),
			removeItem: vi.fn()
		});
	});

	it('returns the stored choice when light is stored', async () => {
		vi.mocked(localStorage.getItem).mockReturnValue('light');
		vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches: true }));
		const { getEffectiveMode } = await import('./preference');
		expect(getEffectiveMode()).toBe('light');
	});

	it('returns the stored choice when dark is stored', async () => {
		vi.mocked(localStorage.getItem).mockReturnValue('dark');
		vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches: false }));
		const { getEffectiveMode } = await import('./preference');
		expect(getEffectiveMode()).toBe('dark');
	});

	it('returns dark from device when no choice stored and device prefers dark', async () => {
		vi.mocked(localStorage.getItem).mockReturnValue(null);
		vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches: true }));
		const { getEffectiveMode } = await import('./preference');
		expect(getEffectiveMode()).toBe('dark');
	});

	it('returns light from device when no choice stored and device does not prefer dark', async () => {
		vi.mocked(localStorage.getItem).mockReturnValue(null);
		vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches: false }));
		const { getEffectiveMode } = await import('./preference');
		expect(getEffectiveMode()).toBe('light');
	});

	it('returns device preference when stored value is invalid', async () => {
		vi.mocked(localStorage.getItem).mockReturnValue('system');
		vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches: true }));
		const { getEffectiveMode } = await import('./preference');
		expect(getEffectiveMode()).toBe('dark');
	});
});

describe('clearPreference', () => {
	beforeEach(() => {
		vi.stubGlobal('localStorage', {
			getItem: vi.fn(),
			setItem: vi.fn(),
			removeItem: vi.fn()
		});
	});

	it('removes the key from localStorage', async () => {
		const { clearPreference, THEME_STORAGE_KEY } = await import('./preference');
		clearPreference();
		expect(localStorage.removeItem).toHaveBeenCalledWith(THEME_STORAGE_KEY);
	});

	it('does not throw when localStorage.removeItem throws', async () => {
		vi.mocked(localStorage.removeItem).mockImplementation(() => {
			throw new Error('storage blocked');
		});
		const { clearPreference } = await import('./preference');
		expect(() => clearPreference()).not.toThrow();
	});
});
