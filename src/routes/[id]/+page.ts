// Do not prerender per-character pages: the client resolves the id and fetches
// data at runtime. The adapter-static fallback shell serves this route, routed
// there by the `_redirects` rule.
export const prerender = false;
