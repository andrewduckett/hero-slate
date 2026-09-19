## ADDED Requirements

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

### Requirement: Accent text is readable on the raised surface

The system SHALL keep every palette's accent readable as text on the raised surface.
Text in the accent color on the raised surface SHALL meet a contrast ratio of at
least 4.5:1. This SHALL hold for every palette name, including `neutral`, in both
light and dark mode. A test SHALL compute each ratio from the values emitted to the
stylesheet. The existing rule for accent text on the surface still applies.

#### Scenario: Every accent passes on the raised surface

- **WHEN** a test computes the contrast of each palette's accent against the raised surface in each mode
- **THEN** every ratio is at least 4.5:1

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
