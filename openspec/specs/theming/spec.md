# theming Specification

## Purpose

Gives a character a readable accent color from a fixed named palette, and switches the whole sheet between light and dark to match the device. A child must be able to read the sheet in any room light, and config authors pick colors by name, never by raw hex.

## Requirements

### Requirement: Named palette

The system SHALL define a palette whose names are exactly `forest`, `fire`, `ocean`, `berry`, `sun`, and `neutral`, with no other names. Each name SHALL define an accent color and an on-accent color, where on-accent is the color of text or icons drawn on the accent. Each of the accent and the on-accent SHALL have both a light-mode value and a dark-mode value, so each name defines four color values in total.

#### Scenario: A known name maps to a full token set

- **WHEN** the palette is looked up for the name `forest`
- **THEN** it provides an accent light value, an accent dark value, an on-accent light value, and an on-accent dark value

#### Scenario: The name set is exactly the six defined names

- **WHEN** the palette's names are listed
- **THEN** they are exactly `forest`, `fire`, `ocean`, `berry`, `sun`, and `neutral`

#### Scenario: Every palette name defines all four values

- **WHEN** any palette name in the set is checked
- **THEN** it has a defined accent and on-accent for both light and dark mode, with no value missing

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

#### Scenario: A character's color themes the header

- **WHEN** a character with `color: forest` loads in light mode
- **THEN** the identity header background renders in the forest light-mode accent
- **AND** the name and descriptor render in the forest light-mode on-accent

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
