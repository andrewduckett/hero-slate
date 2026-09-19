## Context

See proposal.md — Why. The repo is greenfield. This change picks the framework, the data-loading pattern, and the routing model that every later story inherits. The PRD's hard constraint is to avoid trapping the app before a possible hosted-database phase (PRD §8). The app must stay static for this release and the foreseeable future, yet keep a clean path to a dynamic backend later.

## Goals / Non-Goals

**Goals:**

- Establish the data provider and logical-id routing that later stories build on.
- Keep the "static now, dynamic later" path open with no framework migration.
- Render one character's identity on the live site as the end-to-end proof.
- Validate input at the boundary so a bad id or a bad file cannot crash the page.
- Seed the unit-testing pattern with the descriptor-line function.

**Non-Goals:**

- Rendering ability scores, combat metrics, or any tracker (later stories).
- The home picker and `manifest.yaml` (story 7).
- Theming, PWA, and offline behavior (later stories).
- Any server-side function or backend this release.

## Decisions

### SvelteKit + adapter-static, run fully static

We use SvelteKit built with `@sveltejs/adapter-static`, which emits pure static assets with no worker and no server functions.

Two kinds of future move exist, and only one depends on the framework. Swapping the data source from YAML to an API is solved by the data provider (below), whichever framework we pick. Moving to server-rendered or edge-computed pages is decided by the framework. A plain Svelte app with a small router cannot render on a server, so reaching that later forces a framework change. SvelteKit does not. To add a server route later, we swap the adapter to `adapter-cloudflare`. That stays on the same framework and deploy target, so it is a config change, not a rewrite.

We ship no worker today, so the running site is a plain static app. It costs the same and has no server cold starts. We accept more setup now than a small router needs, because it removes a later migration.

### Render via SPA fallback with a runtime fetch

We set `ssr = false` and prerender the app shell. `adapter-static` emits a fallback page. A `_redirects` rule (`/* /index.html 200`) serves that page for every clean path. The client then resolves the id and fetches the character YAML at runtime through the provider. We do not prerender one HTML page per character. The `_redirects` rule must not shadow existing static assets, so a present `/characters/<id>.yaml` still returns the file.

A runtime fetch keeps the data source a genuine runtime call, which matches the future API swap. It also avoids listing characters at build time, so adding a character never touches route generation. Per-character prerendered HTML would go stale between deploys and fight the later "edits appear on next open" and stale-while-revalidate goals (stories 6, 9). The cost is a brief loading state on first paint, which is acceptable for a family tool.

### Character data behind a provider interface

The UI depends on a `getCharacter(id)` interface that returns a typed result, never on YAML or a file path. The v1 implementation fetches and parses a YAML asset. A future implementation calls an API behind the same interface. See ADR 0002.

### Validate id and definition at the boundary

The `/:id` segment is user-controlled input, so the provider validates it before use. It accepts an id only when it matches `^[a-z0-9][a-z0-9-]*$`, then maps that id to the fixed asset path `/characters/<id>.yaml`. This blocks path traversal and URL injection.

After fetching, the provider stamps the definition's `id` from the request id. It then validates the identity fields before returning `found`. The character-data spec defines the full mapping from every response to a typed result. Its point is that no bad input throws, and that an absent character (`not-found`) stays separate from a transient failure (`error`).

One case is easy to miss. The SPA fallback returns app-shell HTML at status 200 for a missing asset. The provider guards against it by requiring a non-HTML content type and a YAML mapping, so the shell resolves to `not-found`, not `invalid`.

Why validate only identity now: this story renders only identity, so identity is the only shape we can define with confidence. Later stories own the semantics of abilities, pools, and sections, so we carry those fields through provisionally rather than pin a contract we cannot yet justify.

### Character YAML ships as a public static asset

We place each character's YAML so the build serves it at `/characters/<id>.yaml` (SvelteKit's `static/` directory). A browser can fetch only a deployed public asset, so the authored file must land in the build output at a known URL. The story ships `sunny.yaml` there.

### Descriptor line is a pure, tested function

A pure `formatIdentity({ level, class })` builds the descriptor. The character-sheet spec defines its rules and cases; this decision only records why it is a standalone pure function.

We isolate the one piece of rendered logic into a testable unit. Its table-driven test is the first test in the repo. It seeds the testing pattern for later stat and rich-text logic.

## Risks / Trade-offs

- **SvelteKit is heavier than a static toy needs** → Run it fully static with no functions; revisit only if the setup gets in the way. The framework buys the no-migration guarantee.
- **SPA fallback shows a loading flash on first paint** → Acceptable for a family tool; a later story can add a lightweight skeleton.
- **A malformed `sunny.yaml` could break the only page** → The provider returns a typed `invalid` result and the page shows a generic message, so parsing never crashes rendering.
- **The provisional fields may prove wrong before later stories render them** → Only identity is validated and rendered now, so a later change can reshape the rest without breaking this story.

## Migration Plan

- This is a greenfield deploy; there is nothing to migrate from.
- Rollback is a Cloudflare Pages redeploy of the previous build, or reverting the branch before merge. No data or schema is at stake.
