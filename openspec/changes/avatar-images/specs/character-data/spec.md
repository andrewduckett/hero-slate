## MODIFIED Requirements

### Requirement: Definition validation

The system SHALL validate a parsed definition's identity fields before returning `found`. `name` is required and must be a non-empty string. `level`, when present, must be a finite number. `class`, when present, must be a string. `color`, when present, must be a string. `avatar`, when present, must be a string. A definition that fails any rule SHALL be returned as `invalid`. The provider SHALL carry `color` and `avatar` through unchanged. The provider SHALL NOT resolve `color` against the palette, so an unknown palette name is a valid string here. The provider SHALL NOT judge whether `avatar` names an image the page may show; the rendering layer owns that rule, so any string is valid data here. Remaining fields — abilities, combat metrics, hit points, pools, and sections — SHALL be carried through provisionally, without strict validation in this release.

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

#### Scenario: Non-string avatar is invalid

- **WHEN** a fetched definition has an `avatar` that is not a string, such as a number or a mapping
- **THEN** the provider returns `invalid`

#### Scenario: Color string is carried through unresolved

- **WHEN** a valid definition includes `color: forest`
- **THEN** the provider returns `found` and the definition's `color` is `"forest"`

#### Scenario: Unknown color name is still valid data

- **WHEN** a valid definition includes `color: rainbow`
- **THEN** the provider returns `found` and carries `color` through as `"rainbow"`
- **AND** the provider does not reject the definition for an unknown palette name

#### Scenario: Avatar string is carried through unresolved

- **WHEN** a valid definition includes `avatar: /characters/sunny.png`
- **THEN** the provider returns `found` and the definition's `avatar` is `"/characters/sunny.png"`

#### Scenario: An avatar that is not a site path is still valid data

- **WHEN** a valid definition includes `avatar: https://example.test/sunny.png`
- **THEN** the provider returns `found` and carries `avatar` through as `"https://example.test/sunny.png"`
- **AND** the provider does not reject the definition for the value

#### Scenario: Provisional fields pass through unvalidated

- **WHEN** a valid definition includes `abilities` or `sections`
- **THEN** the provider returns `found` and carries those fields through unchanged

### Requirement: Character schema shape

The system SHALL define a `Character` type whose identity fields (`id`, `name`, optional `level`, optional `class`, optional `color`, optional `avatar`) are the stable contract this release relies on. `color`, when present, is a string naming a palette; the theming layer resolves it. `avatar`, when present, is a string meant to be a site path to the character's avatar image; the rendering layer resolves it. The type SHALL carry provisional fields for abilities, combat metrics, hit points, pools, and sections, which later changes will define and validate. The type SHALL map cleanly to JSON so a future API can return the same shape.

#### Scenario: Optional identity field is absent, not invented

- **WHEN** a definition omits an optional identity field, such as `class`, `level`, `color`, or `avatar`
- **THEN** the loaded `Character` reflects that field as absent
- **AND** the provider does not supply a default value in its place

### Requirement: Character summary shape

A **character summary** holds the identity fields of a loaded definition: `id`, `name`, and the optional `level`, `class`, `color` and `avatar`. Each field SHALL be carried through exactly as `getCharacter` returns it, and the summary SHALL carry no other field. The shape SHALL map cleanly to JSON.

#### Scenario: A summary carries identity fields only

- **WHEN** `sunny` loads with name "Sunny Thornwood", level 7, class "Druid", color "forest", avatar "/characters/sunny.png", and abilities
- **THEN** its summary has `id` "sunny", `name` "Sunny Thornwood", `level` 7, `class` "Druid", `color` "forest" and `avatar` "/characters/sunny.png"
- **AND** the summary carries no `abilities`

#### Scenario: An absent optional field stays absent

- **WHEN** a listed character's definition has no `level`, `class`, `color` or `avatar`
- **THEN** its summary has none of those fields
- **AND** the provider supplies no default in their place
