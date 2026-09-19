# 0001. Static-first SvelteKit on Cloudflare Workers

- Status: accepted
- Date: 2026-09-18
- Supersedes: none
- Superseded by: none

## Context

We are building a character-sheet web app that must stay static for this release and the foreseeable future. It has no backend and loads its data from hand-edited files. Yet we do not want to trap ourselves: a later phase may add a hosted database, accounts, and cross-device sync.

Two independent traps threaten that later move. The first is the data trap: where character data comes from. The second is the rendering trap: whether pages can be computed on a server. This decision addresses the rendering trap. A separate decision addresses the data trap.

A pure client-only single-page app cannot render pages on a server or at the edge. Reaching that ability later means adopting a server framework — a migration that touches routing and the build. A framework that supports both static output and server rendering avoids that migration, at the cost of more setup now.

## Decision

We use SvelteKit built with `adapter-static`, and we run the site fully static this release: a prerendered app shell, an SPA fallback for clean paths, and no server-side Worker code or server functions. The site is served on Cloudflare Workers static assets, with single-page-application not-found handling for the fallback.

We chose this over a plain Svelte app with a small client-side router. The plain app is lighter to set up, but it cannot render on a server. Adding server or edge rendering later would force a framework change. SvelteKit avoids that. To add a server route later, we swap the adapter to `adapter-cloudflare` on the same framework and deploy target. That is a build-config change, not a framework migration.

We ship no Worker code today (assets-only, no `main` script), so the running site behaves like a plain static app — same hosting cost, no server cold starts.

The app shell is prerendered and the client fetches character data at runtime. We do not prerender one HTML page per character. Runtime fetching keeps the data source a genuine runtime call, avoids enumerating characters at build time, and prevents stale per-character HTML between deploys.

## Consequences

- A later move to server-rendered or edge-computed pages needs no framework change — only an adapter swap and the routes that need it.
- We accept more setup now than a minimal router would need. We judge the removed migration worth that cost.
- The site stays cheap and simple to operate while static: no Worker code, no functions, no server state.
- First paint shows a brief loading state while the client fetches data. This is acceptable for a family tool and can be softened later.
