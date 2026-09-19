## Purpose

Loads a character definition by a stable logical id through a data provider, so the rest of the app never depends on where the data lives. This keeps a future hosted backend a swap of the implementation, not a rewrite.

Terms used once here and kept consistent: a **logical id** is the stable public identifier for a character (for example, `sunny`). A **data provider** is the interface that returns a character by logical id. A **definition** is the loaded character data.

## ADDED Requirements

### Requirement: Data-provider interface

The system SHALL expose a data provider with a `getCharacter(id)` operation that returns one of four typed results: `found` with a definition, `not-found`, `invalid` with a reason, or `error` for a transient failure. Consumers SHALL depend only on this interface, never on a storage location or file path.

#### Scenario: Provider returns a found result

- **WHEN** a consumer calls `getCharacter("sunny")` and a valid definition exists
- **THEN** the provider returns a `found` result whose definition has `id` equal to `"sunny"`

#### Scenario: Consumer references no storage location

- **WHEN** a consumer calls `getCharacter(id)`
- **THEN** the consumer code passes only the logical id
- **AND** the consumer does not construct or read any file path or URL

### Requirement: Logical-id validation

The system SHALL accept a logical id only when it matches the grammar `^[a-z0-9][a-z0-9-]*$`. The provider SHALL return `invalid` for any id that fails this grammar, and SHALL NOT construct a fetch URL or read storage for it. This blocks path traversal and URL injection from the `/:id` route.

#### Scenario: Malformed id is rejected before any fetch

- **WHEN** `getCharacter("../secret")` is called
- **THEN** the provider returns `invalid`
- **AND** no network fetch is attempted

#### Scenario: Valid id is accepted

- **WHEN** `getCharacter("sunny")` is called
- **THEN** the id passes validation and the provider proceeds to load it

### Requirement: YAML-backed implementation

The system SHALL provide a data-provider implementation that fetches a character's YAML from a deployed static asset at runtime and parses it. The implementation SHALL map a validated logical id to the fixed asset URL `/characters/<id>.yaml`. It SHALL NOT embed the definition in the page at build time.

#### Scenario: Definition loads at runtime

- **WHEN** the app requests `sunny` after the page has loaded in the browser
- **THEN** the implementation fetches `/characters/sunny.yaml` and parses it
- **AND** the parsed definition does not appear in the page's prerendered HTML

### Requirement: Logical id comes from the request

The system SHALL set a `found` definition's `id` to the validated request id. The provider SHALL NOT trust an `id` field in the YAML. When the YAML declares an `id` that differs from the request id, the provider SHALL return `invalid`.

#### Scenario: Id is stamped from the request

- **WHEN** `/characters/sunny.yaml` loads and omits an `id` field
- **THEN** the `found` definition's `id` is `"sunny"`

#### Scenario: Conflicting YAML id is rejected

- **WHEN** `/characters/sunny.yaml` declares `id: moon`
- **THEN** the provider returns `invalid`

### Requirement: Definition validation

The system SHALL validate a parsed definition's identity fields before returning `found`. The rules are: `name` is required and must be a non-empty string; `level`, when present, must be a finite number; `class`, when present, must be a string. A definition that fails any rule SHALL be returned as `invalid`. Remaining fields (abilities, combat metrics, hit points, pools, sections) SHALL be carried through provisionally, without strict validation in this release.

#### Scenario: Missing required name is invalid

- **WHEN** a fetched definition has no `name`
- **THEN** the provider returns `invalid`

#### Scenario: Wrong-typed identity field is invalid

- **WHEN** a fetched definition has a `level` that is not a number
- **THEN** the provider returns `invalid`

#### Scenario: Non-finite level is invalid

- **WHEN** a fetched definition has a `level` that parses to a non-finite number, such as `.inf` or `.nan`
- **THEN** the provider returns `invalid`

#### Scenario: Provisional fields pass through unvalidated

- **WHEN** a valid definition includes `abilities` or `sections`
- **THEN** the provider returns `found` and carries those fields through unchanged

### Requirement: Every response status maps to a typed result

The system SHALL map every load outcome to a typed result and SHALL NOT throw an uncaught error. A 404 SHALL return `not-found`. Any other non-2xx status, a rejected fetch, and a body-read failure SHALL return `error`. A 2xx response SHALL proceed to the content check below. This mapping is exhaustive and keeps an absent character (`not-found`) separate from a transient failure (`error`).

#### Scenario: Missing character

- **WHEN** `/characters/nobody.yaml` returns HTTP 404
- **THEN** the provider returns `not-found`
- **AND** no uncaught error is raised

#### Scenario: Non-404 client error is transient

- **WHEN** the fetch returns HTTP 403 or HTTP 429
- **THEN** the provider returns `error`

#### Scenario: Server error is transient

- **WHEN** the fetch is rejected or returns HTTP 503
- **THEN** the provider returns `error`
- **AND** no uncaught error is raised

### Requirement: A 2xx body must be a YAML mapping

The system SHALL treat a 2xx response as a character only when its `Content-Type` is not `text/html` and its parsed body is a YAML mapping. A `text/html` content type SHALL return `not-found`, which covers the SPA fallback page served for a missing asset. A 2xx body that parses to a non-mapping value, such as a plain string, SHALL return `not-found`. A 2xx body that cannot be parsed as YAML SHALL return `invalid`.

#### Scenario: SPA fallback HTML is treated as not-found

- **WHEN** a fetch for a missing asset returns the app-shell page with `Content-Type: text/html` and status 200
- **THEN** the provider returns `not-found`
- **AND** does not attempt identity validation

#### Scenario: Non-mapping body is not-found

- **WHEN** a 2xx body parses to a YAML string rather than a mapping
- **THEN** the provider returns `not-found`

#### Scenario: Unparseable YAML is invalid

- **WHEN** a 2xx body has a non-HTML content type but cannot be parsed as YAML
- **THEN** the provider returns `invalid`
- **AND** no uncaught error is raised

### Requirement: Character schema shape

The system SHALL define a `Character` type whose identity fields (`id`, `name`, optional `level`, optional `class`) are the stable contract this release relies on. The type SHALL carry provisional fields for abilities, combat metrics, hit points, pools, and sections, which later changes will define and validate. The type SHALL map cleanly to JSON so a future API can return the same shape.

#### Scenario: Optional identity field is absent, not invented

- **WHEN** a definition omits an optional identity field, such as `class` or `level`
- **THEN** the loaded `Character` reflects that field as absent
- **AND** the provider does not supply a default value in its place
