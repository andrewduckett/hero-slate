# theming Specification

## Purpose

Gives a character a readable accent color from a fixed named palette, and switches the whole sheet between light and dark to match the device. A child must be able to read the sheet in any room light, and config authors pick colors by name, never by raw hex.

## Requirements

### Requirement: Named palette

The system SHALL define a palette whose names are exactly `forest`, `fire`, `ocean`, `berry`, `sun`, and `neutral`, with no other names. Each name SHALL define four colors:

- `accent` — a solid fill color.
- `onAccent` — the color of text or icons drawn on the accent.
- `tint` — a soft background wash drawn on the raised surface.
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

### Requirement: Color values are opaque sRGB

The system SHALL express every theme color value as an opaque sRGB color in one canonical format. No value SHALL carry transparency. This keeps a computed contrast ratio equal to what the browser paints, so the contrast tests below are meaningful.

#### Scenario: A value with transparency is not allowed

- **WHEN** the palette module is checked
- **THEN** every color value is an opaque sRGB color in the canonical format
- **AND** no value uses an alpha channel

### Requirement: Base surface and foreground

The system SHALL define a base surface color and a base foreground color. They are shared across all characters and are independent of the accent palette. Each SHALL have a light-mode value and a dark-mode value. The surface SHALL apply as the page background. The foreground SHALL be the default body text color. In each mode, the foreground SHALL meet a contrast ratio of at least 4.5:1 against the surface. A test SHALL compute this ratio from the values emitted to the stylesheet.

#### Scenario: Foreground meets contrast on the surface

- **WHEN** a test computes the contrast of the foreground against the surface in each mode
- **THEN** the ratio is at least 4.5:1 in light mode
- **AND** the ratio is at least 4.5:1 in dark mode

#### Scenario: Light mode uses a light surface

- **WHEN** the device prefers a light color scheme
- **THEN** the page background renders the light-mode surface and body text renders the light-mode foreground

#### Scenario: Dark mode uses a dark surface

- **WHEN** the device prefers a dark color scheme
- **THEN** the page background renders the dark-mode surface and body text renders the dark-mode foreground

### Requirement: Accent and on-accent meet a contrast minimum

The system SHALL pair each palette's accent and on-accent for readable text. Text in the on-accent color on the accent background SHALL meet a contrast ratio of at least 4.5:1. This SHALL hold for the light-mode pair of every palette name. It SHALL also hold for the dark-mode pair of every palette name. The `neutral` palette is included. A test SHALL compute each ratio from the values emitted to the stylesheet.

#### Scenario: Every palette pair passes the contrast check

- **WHEN** a test computes the contrast ratio of on-accent against accent for each palette name in each mode
- **THEN** every pairing is at least 4.5:1

### Requirement: Color name resolution

The theming layer SHALL receive a character's `color` as either a string or `undefined`. The data provider rejects a non-string `color` before the character loads, so the theming layer never receives one (see character-data `Definition validation`). The theming layer SHALL treat the value as a palette name only when the string exactly matches a name in the fixed set. Any other string SHALL resolve to the `neutral` default. This includes an unknown name, an empty string, and a raw color value such as a `#ff0000` hex string or an `rgb(...)` string. An `undefined` value SHALL also resolve to `neutral`. The system SHALL NOT interpret a raw color value as a color.

#### Scenario: An exact name resolves to itself

- **WHEN** the theming layer resolves the string `ocean`
- **THEN** it resolves to the `ocean` palette

#### Scenario: A hex string is not honored as a color

- **WHEN** the theming layer resolves the string `#ff0000`
- **THEN** it resolves to the `neutral` palette
- **AND** the raw hex value is not applied as an accent

#### Scenario: An unknown or empty string resolves to neutral

- **WHEN** the theming layer resolves an unknown name, or an empty string, or `undefined`
- **THEN** it resolves to the `neutral` palette

### Requirement: Automatic light and dark

The system SHALL follow the device's light or dark preference without a user-facing toggle. When the device prefers dark, the sheet SHALL use each palette's dark-mode values and the dark-mode surface. When the device prefers light, the sheet SHALL use each palette's light-mode values and the light-mode surface. When the device preference changes while the sheet is open, the sheet SHALL switch modes without a reload and without any user action.

#### Scenario: Mode change while the sheet is open

- **WHEN** the device switches from light to dark while a sheet is open
- **THEN** the surface, the body text, the header accent, and the header text update to the dark-mode values
- **AND** the sheet does not reload and shows no toggle control

#### Scenario: No user toggle is present

- **WHEN** a player views the sheet
- **THEN** the sheet exposes no control to switch light or dark by hand

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

### Requirement: Neutral fallback never blocks rendering

The system SHALL fall back to the `neutral` palette when a character omits `color`, or names a value that resolves to neutral. An unknown or missing color SHALL NOT raise an error and SHALL NOT block the sheet from rendering. Only a fixed palette name SHALL ever be applied to the rendered sheet, so no unmatched color value reaches the page.

#### Scenario: Missing color falls back to neutral

- **WHEN** a character has no `color` field
- **THEN** the sheet renders in the `neutral` palette
- **AND** no error is raised

#### Scenario: Unknown color still renders the header

- **WHEN** a character has `color: rainbow`, which is not a palette name
- **THEN** the sheet renders in the `neutral` palette
- **AND** the sheet still renders its identity header

### Requirement: Raised surface and muted text

The system SHALL define two more base colors, shared across all characters: a raised
surface and a muted text color. The raised surface is the background of cards and
tiles. The muted text color is for secondary text, such as labels and raw scores.
Each SHALL have a light-mode value and a dark-mode value. Each SHALL be an opaque
sRGB color in the canonical format. In each mode, these pairs SHALL each meet a
contrast ratio of at least 4.5:1:

- the foreground on the raised surface
- the muted text on the surface
- the muted text on the raised surface

A test SHALL compute each ratio from the values emitted to the stylesheet.

#### Scenario: Body text is readable on a card

- **WHEN** a test computes the contrast of the foreground against the raised surface in each mode
- **THEN** the ratio is at least 4.5:1 in light mode and in dark mode

#### Scenario: Muted text is readable on both surfaces

- **WHEN** a test computes the contrast of the muted text against the surface and against the raised surface in each mode
- **THEN** every ratio is at least 4.5:1

#### Scenario: New base colors have both modes

- **WHEN** the palette module is checked
- **THEN** the raised surface and the muted text each define a light-mode and a dark-mode value
- **AND** no value uses an alpha channel

### Requirement: Soft tint background

The system SHALL define a `tint` color for every palette name, in both light and dark mode. The tint is a background wash. Text drawn on a tint SHALL remain readable.

In each mode, these pairs SHALL each meet a contrast ratio of at least 4.5:1:

- the base foreground on every palette's tint
- the muted text color on every palette's tint
- every palette's `deep` on that same palette's tint

The system SHALL draw a tint on the raised surface, not on the page surface. A tint SHALL read as an area separate from the raised surface. In each mode, every palette's tint SHALL meet a contrast ratio of at least 1.2:1 against the raised surface. This is a separation floor, not a readability rule, so it sits far below 4.5:1. An equality check is not enough: two values may differ and still look identical. A test SHALL compute each contrast ratio from the values emitted to the stylesheet.

The floor covers the raised surface alone, because the light-mode surface and raised surface sit only 1.096:1 apart. A tint clearing 1.2:1 against both would have to fall below the page background. That would darken what `deep` must sit on, so the two rules would fight. A later change that wants a tint on the page adds the rule and retunes the values.

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

- **WHEN** a test computes the contrast of each palette's tint against the raised surface in the same mode
- **THEN** every ratio is at least 1.2:1

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

In each mode, the structural color SHALL meet a contrast ratio of at least 4.5:1 against the surface and against the raised surface. The system may draw label text in it, so it must stay readable. A test SHALL compute each ratio from the values emitted to the stylesheet.

#### Scenario: The structural color has both modes

- **WHEN** the palette module is checked
- **THEN** the structural color defines a light-mode and a dark-mode value
- **AND** the value uses no alpha channel

#### Scenario: Structural label text is readable

- **WHEN** a test computes the contrast of the structural color against the surface and against the raised surface in each mode
- **THEN** every ratio is at least 4.5:1

### Requirement: Fixed color roles

The system SHALL define a fixed color role for each of hit points, armor class, speed, and initiative. Each role SHALL resolve to one name from the fixed palette set. A role's palette name SHALL be the same for every character. A character's `color` SHALL NOT change any role.

Hit points need no identification, because the character defines them in their own structured field.

Armor class, speed, and initiative arrive as authored `{ label, value }` combat entries, and an author may write any label. The system SHALL identify a combat entry's role by comparing its authored label against a fixed list of label names held for each role. The comparison SHALL ignore case, and SHALL ignore leading and trailing whitespace. A label name SHALL appear in at most one role's list, so a label can never match two roles.

A combat entry whose label matches no role SHALL render in the character's resolved palette. This keeps an authored metric the app does not recognise readable, and never blocks the sheet.

This release SHALL NOT read a role's colour from character config. Roles are not authored data today. The system SHALL ignore an authored field that names a colour for one of the four, rather than rejecting the character. This requirement fixes current behaviour. It does not commit the project to withholding author control in a later release.

#### Scenario: A role holds its color across characters

- **WHEN** two characters with different `color` values both render a hit points tracker
- **THEN** both trackers render in the same health role color

#### Scenario: A role resolves to a palette name

- **WHEN** any of the four roles is looked up
- **THEN** it resolves to one of `forest`, `fire`, `ocean`, `berry`, `sun`, or `neutral`

#### Scenario: A combat label matches its role regardless of case and spacing

- **WHEN** a character authors a combat entry labelled `  armor class  `
- **THEN** the sheet renders that entry in the armor class role's color

#### Scenario: An unrecognised combat label falls back to the character's colour

- **WHEN** a character with `color: forest` authors a combat entry labelled `Carrying Capacity`, which matches no role
- **THEN** the sheet renders that entry in the forest palette
- **AND** the sheet still renders the entry's label and value
- **AND** no error is raised

#### Scenario: An authored colour field for a role is ignored

- **WHEN** a character file sets a field that names a color for hit points, armor class, speed, or initiative
- **THEN** the sheet still renders that block in its fixed role color
- **AND** no error is raised

### Requirement: Self-hosted typefaces

The system SHALL serve every web font it uses from the site's own origin. The page
SHALL NOT request a font, or a font stylesheet, from any other host. Each font face
SHALL name a fallback font family, so text still renders when a font file fails to
load. Each font face SHALL show fallback text while its font loads rather than hide
the text. The build SHALL ship each font's licence alongside the font files.

#### Scenario: Fonts load from the site itself

- **WHEN** a test reads every font-face source in the app's stylesheets
- **THEN** each source is a path on the site's own origin
- **AND** no source or stylesheet import names another host

#### Scenario: Text renders when a font fails

- **WHEN** a font file fails to load
- **THEN** the sheet still shows its text in the fallback font family

#### Scenario: Licences ship with the fonts

- **WHEN** the static build completes
- **THEN** the build output contains each font file and its licence file
