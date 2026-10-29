## ADDED Requirements

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

## MODIFIED Requirements

### Requirement: Character schema shape

The system SHALL define a `Character` type whose identity fields (`id`, `name`, optional `level`, optional `class`, optional `color`) are the stable contract this release relies on. `color`, when present, is a string naming a palette; the theming layer resolves it. The type SHALL also carry `avatar`, the site path of the character's avatar image, which the provider supplies rather than the definition. The type SHALL carry provisional fields for abilities, combat metrics, hit points, pools, and sections, which later changes will define and validate. The type SHALL map cleanly to JSON so a future API can return the same shape.

#### Scenario: Optional identity field is absent, not invented

- **WHEN** a definition omits an optional identity field, such as `class`, `level`, or `color`
- **THEN** the loaded `Character` reflects that field as absent
- **AND** the provider does not supply a default value in its place

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
