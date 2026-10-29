## ADDED Requirements

### Requirement: Avatar in the identity header

The identity header SHALL show the character's avatar, the image at the `avatar` path the provider supplied, filling the header's right side and fading into the header's accent. The name and descriptor SHALL sit on the solid accent, outside the image, so they keep the contrast-checked accent/on-accent pairing. The image SHALL be decorative, with empty alternative text. One image file SHALL serve both the light and the dark mode.

#### Scenario: Header shows the avatar image

- **WHEN** a character with name "Test Hero" and `avatar` "/characters/test-hero.png" loads
- **THEN** the header contains an image whose source is `/characters/test-hero.png`
- **AND** the image's alternative text is empty
- **AND** the header still shows the text "Test Hero"

#### Scenario: Name and descriptor stay on solid accent over the art

- **WHEN** a reviewer opens a sheet whose avatar image exists, in light mode and in dark mode, in a browser
- **THEN** the image fills the header's right side and fades into the accent before it reaches the name and descriptor
- **AND** the name and descriptor sit on the solid accent
- **AND** the reviewer records the check, because the test environment does not compute layout

### Requirement: Theme toggle stays legible over the avatar

The theme toggle SHALL keep its place in the header when an avatar shows, and SHALL sit on an opaque backing in the accent, so its icon keeps the accent/on-accent pairing over any art.

#### Scenario: Toggle is visible over the art

- **WHEN** a reviewer opens a sheet whose avatar image exists, in light mode and in dark mode, in a browser
- **THEN** the theme toggle is in the same place as on a sheet with no avatar image
- **AND** the toggle is visible over the image
- **AND** the reviewer records the check

#### Scenario: Toggle still works with an avatar

- **WHEN** a character with an avatar loads and the player activates the toggle
- **THEN** the page's mode switches, as it does with no avatar

### Requirement: Header without an avatar image is unchanged

When the character has no `avatar`, or its avatar image fails to load, the header SHALL render with no image element and the same layout as a header with no avatar. A character with no image file at its avatar path is the usual case of a failed load.

#### Scenario: Header without an avatar has no image element

- **WHEN** a character with no `avatar` loads
- **THEN** the header contains no image element

#### Scenario: A character with no image file shows the plain header

- **WHEN** a character's avatar is `/characters/missing.png` and that image fails to load
- **THEN** the header shows no image element
- **AND** the header shows the name and descriptor as it does with no avatar
- **AND** no uncaught error is raised
