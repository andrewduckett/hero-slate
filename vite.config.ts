import adapter from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { svelteTesting } from '@testing-library/svelte/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [
		sveltekit({
			preprocess: vitePreprocess(),
			// Emit pure static assets: no worker, no server functions.
			// `fallback` gives the SPA shell that `_redirects` serves for clean paths.
			adapter: adapter({
				fallback: 'index.html'
			})
		}),
		svelteTesting()
	],
	test: {
		environment: 'jsdom',
		include: ['src/**/*.{test,spec}.{js,ts}'],
		setupFiles: ['src/test-setup.ts'],
		globals: true
	}
});
