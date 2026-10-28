## ADDED Requirements

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

A **character summary** holds the identity fields of a loaded definition: `id`, `name`, and the optional `level`, `class` and `color`. Each field SHALL be carried through exactly as `getCharacter` returns it, and the summary SHALL carry no other field. The shape SHALL map cleanly to JSON.

#### Scenario: A summary carries identity fields only

- **WHEN** `sunny` loads with name "Sunny Thornwood", level 7, class "Druid", color "forest", and abilities
- **THEN** its summary has `id` "sunny", `name` "Sunny Thornwood", `level` 7, `class` "Druid" and `color` "forest"
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
