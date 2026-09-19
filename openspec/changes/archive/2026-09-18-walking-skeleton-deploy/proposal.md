## Why

The repo is greenfield: only a PRD and the OpenSpec scaffold exist. Before any feature can land, one thin path must work end to end — config to a deployed page. This change builds that walking skeleton so every later story has a spine to attach to.

It also fixes the two decisions that are expensive to change later: how character data is loaded and how a character URL resolves. Getting these right now keeps the door open to a hosted backend without a rewrite.

## What Changes

- Scaffold a Vite + SvelteKit app built with `adapter-static`. The site runs fully static this release — SPA fallback, no server-side Worker code, no server functions. Going dynamic later swaps the adapter, not the framework.
- Add a `getCharacter(id)` data-provider interface with a YAML implementation. The UI depends on the interface, never on files.
- Validate input at the boundary: accept a logical id only when it matches a safe grammar, and validate a parsed definition's identity fields before use.
- Define a `Character` type whose identity fields are the stable contract now. Carry abilities, pools, and sections as provisional fields that later changes will define. This story renders only identity.
- Route `/:id` through the data provider by logical id. The router never names a file.
- Render an identity header: the character name plus a descriptor line (for example, "Level 6 Druid") built by a pure, missing-field-proof function.
- Ship `sunny.yaml` as a public static asset served at `/characters/sunny.yaml`.
- Configure the Cloudflare Workers static-assets deploy with single-page-application not-found handling so `/sunny` loads on the live site.

Out of scope: the home picker, ability-score and combat rendering, HP and resource trackers, theming, and PWA behavior.

## Capabilities

### New Capabilities

- `character-data`: Load a character definition by logical id through a data-provider interface, with a YAML-backed implementation and a `Character` type whose identity fields are stable and whose other fields are provisional.
- `character-sheet`: Resolve `/:id` by logical id and render the character's identity header from the loaded definition.
- `deployment`: Serve the app as a static site on Cloudflare Workers static assets with SPA fallback so clean paths resolve.

### Modified Capabilities

- None. This is the first change; no specs exist yet.

## Impact

- New app scaffold: `vite.config.*`, `svelte.config.*`, `src/`, SvelteKit routes.
- New data layer: `src/lib/data/provider.*` (interface) and its YAML implementation.
- New config: `sunny.yaml`, placed so the build serves it at `/characters/sunny.yaml`.
- New deploy config: `adapter-static` fallback page plus a `wrangler.jsonc` with `assets.not_found_handling: single-page-application`.
- New dependencies: SvelteKit, `@sveltejs/adapter-static`, Vite, a YAML parser, and a test runner (Vitest) for the identity-format unit test.
- Sets the precedent for spec organization and the testing pattern that later stories follow.
