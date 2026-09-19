## 1. Project scaffold and static build

- [x] 1.1 Scaffold a SvelteKit + Vite app with `@sveltejs/adapter-static`, set `ssr = false`, and configure a fallback page; verify `npm run build` produces static assets with no worker or server-function entry.
- [x] 1.2 Add Vitest and an npm `test` script; verify `npm test` runs a trivial passing test.
- [x] 1.3 Add `static/_redirects` with `/* /index.html 200`; verify the rule reaches the build output and does not shadow files under `/characters/`.

## 2. Character type and descriptor function (test-first)

- [x] 2.1 Define the `Character` type with stable identity fields (`id`, `name`, optional `level`, optional `class`) and provisional fields (abilities, combat metrics, hit points, pools, sections); verify it type-checks and serializes to JSON.
- [x] 2.2 Write table-driven tests for `formatIdentity({ level, class })`: level+class → "Level 6 Druid"; level only → "Level 6"; class only → "Druid"; neither → ""; class printed as authored; missing or wrong-typed field does not throw. Verify the tests fail (red).
- [x] 2.3 Implement `formatIdentity` as a pure function; verify all its tests pass (green).

## 3. Data provider with boundary validation (test-first)

- [x] 3.1 Define the data-provider interface `getCharacter(id)` returning a typed result (`found` | `not-found` | `invalid` | `error`); verify it type-checks.
- [x] 3.2 Write provider tests covering: id grammar rejects `../secret` with no fetch; valid id proceeds; `id` stamped from the request; conflicting YAML `id` → `invalid`; missing `name` → `invalid`; non-number and non-finite `level` → `invalid`; provisional fields pass through; 404 → `not-found`; 403/429/503 and a rejected fetch → `error`; `text/html` 200 shell → `not-found`; non-mapping body → `not-found`; unparseable non-HTML body → `invalid`. Verify the tests fail (red).
- [x] 3.3 Implement the YAML provider: validate the id, fetch `/characters/<id>.yaml`, map the status, require a non-HTML content type and a YAML mapping, parse, stamp the id, and validate identity fields; verify all provider tests pass and that no path throws an uncaught error.

## 4. Route and identity header

- [x] 4.1 Add the `/:id` route that calls `getCharacter(id)` and renders the identity header (name plus descriptor line); verify a component test renders "Sunny Thornwood" and "Level 6 Druid" for a `found` result.
- [x] 4.2 Render the non-found results: `not-found` and `invalid` show the fixed text "Character not found" without echoing the id; `error` shows "Could not load this character. Try again."; verify a test for each result.

## 5. Character config and live deploy

- [x] 5.1 Add `static/characters/sunny.yaml` (name "Sunny Thornwood", level 6, class "Druid", plus illustrative provisional fields); verify the dev server serves `/characters/sunny.yaml` as YAML and `/sunny` renders the header.
- [ ] 5.2 Configure the Cloudflare Pages build (build command and output directory) and deploy; verify the live site returns 200 for `/sunny` on direct load and on refresh, and serves `/characters/sunny.yaml`.
