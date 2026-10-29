## ADDED Requirements

### Requirement: Avatar site-path resolution

An **avatar** is the image that stands for a character, shown wherever the character is named as a whole: the identity header and the picker card. The system SHALL resolve a character's `avatar` value to an image source only when it is a site path: a string that starts with `/` and does not start with `//`. Every other value SHALL resolve to no avatar. Resolution SHALL be a pure function that never throws.

#### Scenario: A site path resolves to an image source

- **WHEN** a character's `avatar` is `/characters/sunny.png`
- **THEN** the avatar resolves to the image source `/characters/sunny.png`

#### Scenario: A remote URL resolves to no avatar

- **WHEN** a character's `avatar` is `https://example.test/sunny.png`
- **THEN** the avatar resolves to no avatar
- **AND** the page makes no request to `example.test`

#### Scenario: A protocol-relative URL resolves to no avatar

- **WHEN** a character's `avatar` is `//example.test/sunny.png`
- **THEN** the avatar resolves to no avatar

#### Scenario: A scheme resolves to no avatar

- **WHEN** a character's `avatar` is `javascript:alert(1)`
- **THEN** the avatar resolves to no avatar

#### Scenario: A relative path resolves to no avatar

- **WHEN** a character's `avatar` is `characters/sunny.png`
- **THEN** the avatar resolves to no avatar

#### Scenario: A missing, empty or non-string value resolves to no avatar

- **WHEN** a character has no `avatar`, or its `avatar` is the empty string, or it is not a string
- **THEN** the avatar resolves to no avatar
- **AND** no error is raised

### Requirement: Avatar in the identity header

When a character's avatar resolves to an image source, the identity header SHALL show that image filling the header's right side and fading into the header's accent, so that the name and descriptor sit on the solid accent and keep the contrast-checked accent/on-accent pairing. The image SHALL be decorative, with empty alternative text. One image file SHALL serve both the light and the dark mode.

#### Scenario: Header shows the avatar image

- **WHEN** a character with name "Sunny Thornwood" and `avatar: /characters/sunny.png` loads
- **THEN** the header contains an image whose source is `/characters/sunny.png`
- **AND** the image's alternative text is empty
- **AND** the header still shows the text "Sunny Thornwood"

#### Scenario: Name and descriptor stay on solid accent over the art

- **WHEN** a reviewer opens a sheet whose avatar resolves to an image, in light mode and in dark mode, in a browser
- **THEN** the image fills the header's right side and fades into the accent before it reaches the name and descriptor
- **AND** the name and descriptor sit on the solid accent
- **AND** the reviewer records the check, because the test environment does not compute layout

### Requirement: Theme toggle stays legible over the avatar

The theme toggle SHALL keep its place in the header when an avatar shows, and SHALL sit on a translucent backing in the accent, so it stays visible on any art.

#### Scenario: Toggle is visible over the art

- **WHEN** a reviewer opens a sheet whose avatar resolves to an image, in light mode and in dark mode, in a browser
- **THEN** the theme toggle is in the same place as on a sheet with no avatar
- **AND** the toggle is visible over the image
- **AND** the reviewer records the check

#### Scenario: Toggle still works with an avatar

- **WHEN** a character with an avatar loads and the player activates the toggle
- **THEN** the page's mode switches, as it does with no avatar

### Requirement: Header without a usable avatar is unchanged

When the avatar resolves to no avatar, or the image fails to load, the header SHALL render with no image element and the same layout as a header with no avatar.

#### Scenario: Header without an avatar has no image element

- **WHEN** a character with no `avatar` loads
- **THEN** the header contains no image element

#### Scenario: Header with a non-site-path avatar has no image element

- **WHEN** a character with `avatar: https://example.test/sunny.png` loads
- **THEN** the header contains no image element
- **AND** the header still shows the character's name

#### Scenario: A failed image load leaves the plain header

- **WHEN** a character's avatar resolves to `/characters/missing.png` and that image fails to load
- **THEN** the header shows no image element
- **AND** the header shows the name and descriptor as it does with no avatar
- **AND** no uncaught error is raised
