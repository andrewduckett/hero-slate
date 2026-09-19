import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),
	kit: {
		// Emit pure static assets: no worker, no server functions.
		// `fallback` gives the SPA shell that `_redirects` serves for clean paths.
		adapter: adapter({
			fallback: 'index.html'
		})
	}
};

export default config;
