# character-data Specification

## Purpose

Loads a character definition by a stable logical id through a data provider, so the rest of the app never depends on where the data lives. This keeps a future hosted backend a swap of the implementation, not a rewrite.

Terms used once here and kept consistent: a **logical id** is the stable public identifier for a character (for example, `sunny`). A **data provider** is the interface that returns a character by logical id. A **definition** is the loaded character data.

## Requirements

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

The system SHALL validate a parsed definition's identity fields before returning `found`. `name` is required and must be a non-empty string. `level`, when present, must be a finite number. `class`, when present, must be a string. `color`, when present, must be a string. A definition that fails any rule SHALL be returned as `invalid`. The provider SHALL carry `color` through unchanged. The provider SHALL NOT resolve `color` against the palette, so an unknown palette name is a valid string here. Remaining fields — abilities, combat metrics, hit points, pools, and sections — SHALL be carried through provisionally, without strict validation in this release.

#### Scenario: Missing required name is invalid

- **WHEN** a fetched definition has no `name`
- **THEN** the provider returns `invalid`

#### Scenario: Wrong-typed identity field is invalid

- **WHEN** a fetched definition has a `level` that is not a number
- **THEN** the provider returns `invalid`

#### Scenario: Non-finite level is invalid

- **WHEN** a fetched definition has a `level` that parses to a non-finite number, such as `.inf` or `.nan`
- **THEN** the provider returns `invalid`

#### Scenario: Non-string color is invalid

- **WHEN** a fetched definition has a `color` that is not a string, such as a number or a list
- **THEN** the provider returns `invalid`

#### Scenario: Color string is carried through unresolved

- **WHEN** a valid definition includes `color: forest`
- **THEN** the provider returns `found` and the definition's `color` is `"forest"`

#### Scenario: Unknown color name is still valid data

- **WHEN** a valid definition includes `color: rainbow`
- **THEN** the provider returns `found` and carries `color` through as `"rainbow"`
- **AND** the provider does not reject the definition for an unknown palette name

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

The system SHALL define a `Character` type whose identity fields (`id`, `name`, optional `level`, optional `class`, optional `color`) are the stable contract this release relies on. `color`, when present, is a string naming a palette; the theming layer resolves it. The type SHALL also carry `avatar`, the site path of the character's avatar image, which the provider supplies rather than the definition. The type SHALL carry provisional fields for abilities, combat metrics, hit points, pools, and sections, which later changes will define and validate. The type SHALL map cleanly to JSON so a future API can return the same shape.

#### Scenario: Optional identity field is absent, not invented

- **WHEN** a definition omits an optional identity field, such as `class`, `level`, or `color`
- **THEN** the loaded `Character` reflects that field as absent
- **AND** the provider does not supply a default value in its place

### Requirement: Character listing through the data provider

The data provider SHALL expose a `listCharacters()` operation that returns one of two typed results: `found` with an ordered list of character summaries, or `error` for a transient failure. Consumers SHALL depend only on this interface, never on the manifest's location or format. The operation SHALL NOT throw an uncaught error.

#### Scenario: The listing returns summaries in manifest order

- **WHEN** a consumer calls `listCharacters()` and the manifest names `sunny`, `gimdak` and `urven` in that order, and each loads
- **THEN** the provider returns `found` with three summaries whose ids are `sunny`, `gimdak` and `urven`, in that order

#### Scenario: Consumer references no storage location

- **WHEN** a consumer calls `listCharacters()`
- **THEN** the consumer passes no path, URL or file name
- **AND** the consumer does not construct or read the manifest's location

### Requirement: Character summary shape

A **character summary** holds the identity fields of a loaded definition: `id`, `name`, the optional `level`, `class` and `color`, and the `avatar` the provider supplied. Each field SHALL be carried through exactly as `getCharacter` returns it, and the summary SHALL carry no other field. The shape SHALL map cleanly to JSON.

#### Scenario: A summary carries identity fields only

- **WHEN** `sunny` loads with name "Sunny Thornwood", level 7, class "Druid", color "forest", and abilities
- **THEN** its summary has `id` "sunny", `name` "Sunny Thornwood", `level` 7, `class` "Druid", `color` "forest" and `avatar` "/characters/sunny.png"
- **AND** the summary carries no `abilities`

#### Scenario: An absent optional field stays absent

- **WHEN** a listed character's definition has no `level`, `class` or `color`
- **THEN** its summary has none of those fields
- **AND** the provider supplies no default in their place

### Requirement: Character manifest

The roster is a **character manifest**: a YAML document whose top level is a mapping with a `characters` key holding a list of logical ids as strings. The YAML-backed implementation SHALL fetch the manifest from the fixed asset URL `/characters/manifest.yaml` at runtime, and SHALL NOT embed it in the page at build time. Adding a character takes one character file plus one line in the manifest.

#### Scenario: The manifest loads at runtime

- **WHEN** the app lists characters after the page has loaded in the browser
- **THEN** the implementation fetches `/characters/manifest.yaml` and parses it
- **AND** the roster does not appear in the page's prerendered HTML

#### Scenario: Ids are read from the characters key

- **WHEN** the manifest body is `characters: [sunny, gimdak]`
- **THEN** the provider loads `sunny` and `gimdak`, in that order

### Requirement: The manifest's id is reserved

The logical id `manifest` SHALL be reserved, because the manifest lives beside the character files. `getCharacter("manifest")` SHALL return `not-found` without fetching, and the listing SHALL skip a `manifest` entry.

#### Scenario: The reserved id is not a character

- **WHEN** `getCharacter("manifest")` is called
- **THEN** the provider returns `not-found`
- **AND** no network fetch is attempted

#### Scenario: The reserved id is skipped in the listing

- **WHEN** the manifest names `sunny` and `manifest`
- **THEN** the provider returns `found` with one summary, for `sunny`

### Requirement: Listing skips entries that do not load

The provider SHALL include a summary only for a listed entry that `getCharacter` returns as `found`. It SHALL skip an entry that is not a string, or that fails the logical-id grammar. It SHALL skip an entry whose definition resolves to `not-found`, `invalid` or `error`, so one failing file never empties the roster. It SHALL skip a duplicate id after its first occurrence. A result with every entry skipped is `found` with an empty list.

#### Scenario: A missing or invalid definition is skipped

- **WHEN** the manifest names `sunny`, `nobody` and `broken`, where `nobody` resolves to `not-found` and `broken` resolves to `invalid`
- **THEN** the provider returns `found` with one summary, for `sunny`

#### Scenario: A malformed entry is skipped before any fetch

- **WHEN** the manifest names `sunny`, `../secret` and the number 7
- **THEN** the provider returns `found` with one summary, for `sunny`
- **AND** no fetch is attempted for `../secret` or `7`

#### Scenario: A duplicate id lists once

- **WHEN** the manifest names `sunny`, `urven` and `sunny`
- **THEN** the provider returns two summaries, `sunny` then `urven`

#### Scenario: A transient failure on one entry skips that entry

- **WHEN** the manifest names `sunny` and `urven`, and the fetch for `urven` returns HTTP 503
- **THEN** the provider returns `found` with one summary, for `sunny`

#### Scenario: Every entry skipped is found and empty

- **WHEN** the manifest names only `nobody`, which resolves to `not-found`
- **THEN** the provider returns `found` with an empty list

### Requirement: Manifest load outcomes map to typed results

The provider SHALL map every manifest load outcome to a typed result. A rejected fetch, a non-2xx status or a body-read failure SHALL return `error`. A `text/html` content type SHALL return `error`. A body that cannot be parsed as YAML, or that is not a mapping with a `characters` list, SHALL return `error`. An empty `characters` list SHALL return `found` with an empty list.

#### Scenario: A missing manifest is an error

- **WHEN** `/characters/manifest.yaml` returns HTTP 404, or the SPA fallback page with `Content-Type: text/html`
- **THEN** the provider returns `error`
- **AND** no uncaught error is raised

#### Scenario: A malformed manifest is an error

- **WHEN** the manifest body cannot be parsed as YAML, or parses to a list, a string, or a mapping with no `characters` list
- **THEN** the provider returns `error`

#### Scenario: An empty roster is found and empty

- **WHEN** the manifest body is `characters: []`
- **THEN** the provider returns `found` with an empty list

### Requirement: Avatar location

An **avatar** is the image that stands for a character in the identity header and the picker card. The provider SHALL set `avatar` on every `found` character to `/characters/<id>.png`, built from the validated request id. An authored `avatar` key SHALL be ignored, whatever its value. The provider SHALL NOT check whether the image exists.

#### Scenario: A found character's avatar is named after its id

- **WHEN** the definition for `test-hero` loads
- **THEN** the provider returns `found` and the character's `avatar` is `"/characters/test-hero.png"`

#### Scenario: An authored avatar is ignored

- **WHEN** the definition for `test-hero` includes `avatar: https://example.test/hero.png`
- **THEN** the provider returns `found` and the character's `avatar` is `"/characters/test-hero.png"`

#### Scenario: An authored avatar of another type does not invalidate the definition

- **WHEN** the definition for `test-hero` includes `avatar: 42`
- **THEN** the provider returns `found` and the character's `avatar` is `"/characters/test-hero.png"`
