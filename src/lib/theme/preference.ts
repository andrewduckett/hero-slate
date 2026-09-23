export const THEME_STORAGE_KEY = 'hero-slate:theme';

type ThemeMode = 'light' | 'dark';

function isAllowed(value: string | null): value is ThemeMode {
	return value === 'light' || value === 'dark';
}

export function readPreference(): ThemeMode | null {
	try {
		const stored = localStorage.getItem(THEME_STORAGE_KEY);
		return isAllowed(stored) ? stored : null;
	} catch {
		return null;
	}
}

export function writePreference(mode: ThemeMode): void {
	try {
		localStorage.setItem(THEME_STORAGE_KEY, mode);
	} catch {
		// Storage blocked; choice not persisted but current view still switches.
	}
}

export function getEffectiveMode(): ThemeMode {
	const stored = readPreference();
	if (stored !== null) return stored;
	return matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function clearPreference(): void {
	try {
		localStorage.removeItem(THEME_STORAGE_KEY);
	} catch {
		// Ignore.
	}
}
