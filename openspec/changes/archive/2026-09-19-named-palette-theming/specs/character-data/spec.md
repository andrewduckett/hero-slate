## MODIFIED Requirements

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

### Requirement: Character schema shape

The system SHALL define a `Character` type whose identity fields (`id`, `name`, optional `level`, optional `class`, optional `color`) are the stable contract this release relies on. `color`, when present, is a string naming a palette; the theming layer resolves it. The type SHALL carry provisional fields for abilities, combat metrics, hit points, pools, and sections, which later changes will define and validate. The type SHALL map cleanly to JSON so a future API can return the same shape.

#### Scenario: Optional identity field is absent, not invented

- **WHEN** a definition omits an optional identity field, such as `class`, `level`, or `color`
- **THEN** the loaded `Character` reflects that field as absent
- **AND** the provider does not supply a default value in its place
