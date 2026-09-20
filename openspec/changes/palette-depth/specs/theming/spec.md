## MODIFIED Requirements

### Requirement: Named palette

The system SHALL define a palette whose names are exactly `forest`, `fire`, `ocean`, `berry`, `sun`, and `neutral`, with no other names. Each name SHALL define four colors:

- `accent` — a solid fill color.
- `onAccent` — the color of text or icons drawn on the accent.
- `tint` — a soft background wash drawn on the surface or the raised surface.
- `deep` — the family color used as text, or as a border, on the surface, the raised surface, or the tint.

Each of the four SHALL have both a light-mode value and a dark-mode value, so each name defines eight color values in total. A name MAY give `deep` and `accent` the same value when that value already satisfies every rule for both.

#### Scenario: A known name maps to a full token set

- **WHEN** the palette is looked up for the name `forest`
- **THEN** it provides a light and a dark value for each of `accent`, `onAccent`, `tint`, and `deep`

#### Scenario: The name set is exactly the six defined names

- **WHEN** the palette's names are listed
- **THEN** they are exactly `forest`, `fire`, `ocean`, `berry`, `sun`, and `neutral`

#### Scenario: Every palette name defines all four values

- **WHEN** any palette name in the set is checked
- **THEN** it defines all four colors — `accent`, `onAccent`, `tint`, and `deep`
- **AND** each of the four has a light-mode and a dark-mode value, with no value missing

#### Scenario: On-accent is not fixed to one value

- **WHEN** the light-mode `onAccent` values of all six names are compared
- **THEN** a name may define any value that meets its contrast rule
- **AND** the palette does not require every name to use the same `onAccent`

### Requirement: Character color applies to the sheet header

The system SHALL read a character's `color` field, resolve it, and apply the resolved palette to the identity header. The header SHALL show its background in the resolved accent and its name and descriptor text in the resolved on-accent, so the header text always uses the contrast-checked pairing. The applied values SHALL change with the device preference between the light-mode and dark-mode pair.

The character's color SHALL NOT theme a block that holds a fixed color role. It SHALL NOT theme the hit points tracker, the armor class value, the speed value, or the initiative value. Those take their fixed roles instead.

#### Scenario: A character's color themes the header

- **WHEN** a character with `color: forest` loads in light mode
- **THEN** the identity header background renders in the forest light-mode accent
- **AND** the name and descriptor render in the forest light-mode on-accent

#### Scenario: Character color does not reach a fixed-role block

- **WHEN** a character with `color: forest` loads
- **THEN** the hit points tracker renders in the health role's color, not the forest palette
- **AND** the armor class, speed, and initiative values each render in their own role's color

## ADDED Requirements

### Requirement: Soft tint background

The system SHALL define a `tint` color for every palette name, in both light and dark mode. The tint is a background wash. Text drawn on a tint SHALL remain readable.

In each mode, these pairs SHALL each meet a contrast ratio of at least 4.5:1:

- the base foreground on every palette's tint
- the muted text color on every palette's tint
- every palette's `deep` on that same palette's tint

A tint SHALL also be visually distinct from the raised surface, so a tinted area reads as a separate area. A test SHALL assert that every tint differs from the raised surface in the same mode. A test SHALL compute each contrast ratio from the values emitted to the stylesheet.

#### Scenario: Body text is readable on any tint

- **WHEN** a test computes the contrast of the foreground against each palette's tint in each mode
- **THEN** every ratio is at least 4.5:1

#### Scenario: Muted text is readable on any tint

- **WHEN** a test computes the contrast of the muted text against each palette's tint in each mode
- **THEN** every ratio is at least 4.5:1

#### Scenario: A deep heading is readable on its own tint

- **WHEN** a test computes the contrast of each palette's `deep` against that palette's tint in each mode
- **THEN** every ratio is at least 4.5:1

#### Scenario: A tint is distinct from the raised surface

- **WHEN** a test compares each palette's tint with the raised surface in the same mode
- **THEN** the two values differ

### Requirement: Deep text and border color

The system SHALL define a `deep` color for every palette name, in both light and dark mode. The `deep` color is the value the system uses whenever it draws the palette family as text, as an icon, or as a border.

In each mode, these pairs SHALL each meet a contrast ratio of at least 4.5:1:

- every palette's `deep` on the surface
- every palette's `deep` on the raised surface

The `neutral` palette is included. A test SHALL compute each ratio from the values emitted to the stylesheet.

The system SHALL NOT require the `accent` color to be readable as text. An accent only has to pair with its own `onAccent`. This lets a palette hold a mid-tone hue that no text color could sit on.

#### Scenario: Every deep passes on both surfaces

- **WHEN** a test computes the contrast of each palette's `deep` against the surface and against the raised surface in each mode
- **THEN** every ratio is at least 4.5:1

#### Scenario: A mid-tone accent is allowed

- **WHEN** a palette defines an accent that would fail a 4.5:1 check as text on the raised surface
- **THEN** the palette is still valid, provided its `onAccent` meets 4.5:1 on that accent
- **AND** the system draws that family's text and borders in `deep` instead

### Requirement: Structural base color

The system SHALL define one more base color, shared across all characters and independent of the accent palette: a structural color for tile borders and secondary labels. It SHALL have a light-mode value and a dark-mode value. It SHALL be an opaque sRGB color in the canonical format.

In each mode, the structural color SHALL meet a contrast ratio of at least 4.5:1 against the surface and against the raised surface, because the system may draw label text in it. A test SHALL compute each ratio from the values emitted to the stylesheet.

#### Scenario: The structural color has both modes

- **WHEN** the palette module is checked
- **THEN** the structural color defines a light-mode and a dark-mode value
- **AND** the value uses no alpha channel

#### Scenario: Structural label text is readable

- **WHEN** a test computes the contrast of the structural color against the surface and against the raised surface in each mode
- **THEN** every ratio is at least 4.5:1

### Requirement: Fixed color roles

The system SHALL define a fixed color role for each of hit points, armor class, speed, and initiative. Each role SHALL resolve to one name from the fixed palette set. A role's palette name SHALL be the same for every character. A character's `color` SHALL NOT change any role.

A config author SHALL NOT be able to set or override a role. Roles are not authored data.

#### Scenario: A role holds its color across characters

- **WHEN** two characters with different `color` values both render a hit points tracker
- **THEN** both trackers render in the same health role color

#### Scenario: A role resolves to a palette name

- **WHEN** any of the four roles is looked up
- **THEN** it resolves to one of `forest`, `fire`, `ocean`, `berry`, `sun`, or `neutral`

#### Scenario: Config cannot override a role

- **WHEN** a character file sets a field that names a color for hit points, armor class, speed, or initiative
- **THEN** the sheet still renders that block in its fixed role color
- **AND** no error is raised

## REMOVED Requirements

### Requirement: Accent text is readable on the raised surface

**Reason**: The rule forced each `accent` to serve as both a solid fill and a text color. One value cannot do both jobs across the palette. Meeting it drove `sun` to a brown and `berry` to a magenta, so those names stopped describing their colors.

**Migration**: The `Deep text and border color` requirement replaces it. Every palette now defines a separate `deep` value, and that value carries the 4.5:1 rule on both the surface and the raised surface. Any code that drew accent-colored text or borders SHALL draw them in `deep` instead. The contrast test that asserted accent on the raised surface is retargeted to `deep`.
