## Purpose

Serves the app as a static site on Cloudflare Pages, with clean paths that resolve on direct load and refresh. This is the hosting foundation every later story deploys onto.

## ADDED Requirements

### Requirement: Static Cloudflare Pages build

The system SHALL build to static assets that Cloudflare Pages serves. The build SHALL emit no server-side function this release.

#### Scenario: Build emits no server function

- **WHEN** the Cloudflare Pages build runs
- **THEN** the output contains static assets
- **AND** the output contains no server function or worker entry

### Requirement: Character files ship as public assets

The system SHALL place each character's YAML where the build serves it at `/characters/<id>.yaml`. The deployed site SHALL return the file at that path.

#### Scenario: Deployed site serves the character file

- **WHEN** a request is made to `/characters/sunny.yaml` on the built site
- **THEN** the response status is 200
- **AND** the body is the `sunny` character YAML

### Requirement: SPA fallback for clean paths

The system SHALL serve the prerendered app shell as a single-page fallback for any clean path such as `/sunny`, on direct load and on refresh. The client SHALL then resolve the id and render. The build SHALL use `@sveltejs/adapter-static` with a fallback page. It SHALL ship a `_redirects` rule `/* /index.html 200` rather than a per-character prerendered route. The rule SHALL NOT capture existing static assets. A request for a present `/characters/<id>.yaml` SHALL return that file, not the app shell.

#### Scenario: Direct load of a deep link

- **WHEN** a request is made to `/sunny` in a fresh browser tab
- **THEN** the response status is 200 and returns the app shell
- **AND** the client resolves `sunny` and shows "Sunny Thornwood"

#### Scenario: Refresh on a deep link

- **WHEN** a player refreshes while on `/sunny`
- **THEN** the response status is 200
- **AND** the page renders again without a server not-found error
