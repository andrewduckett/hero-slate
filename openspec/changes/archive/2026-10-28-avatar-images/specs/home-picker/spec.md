## ADDED Requirements

### Requirement: A card shows the character's avatar

A card SHALL show the character's avatar, the image at the summary's `avatar` path, filling the card's right side and fading into the card's accent. The name and descriptor SHALL sit on the solid accent, outside the image, so they keep the contrast-checked pairing. The image SHALL be decorative, with empty alternative text, so it adds nothing to the card link's accessible name.

#### Scenario: A card shows the avatar image

- **WHEN** a listed character has name "Test Hero" and `avatar` "/characters/test-hero.png"
- **THEN** its card contains an image whose source is `/characters/test-hero.png`
- **AND** the image's alternative text is empty
- **AND** the card's link has an accessible name that includes "Test Hero" and nothing from the image

#### Scenario: Card text stays on solid accent over the art

- **WHEN** a reviewer opens `/` with a character whose avatar image exists, in light mode and in dark mode, in a browser
- **THEN** the image fills the card's right side and fades into the accent before it reaches the name and descriptor
- **AND** the name and descriptor sit on the solid accent
- **AND** the reviewer records the check, because the test environment does not compute layout

### Requirement: A card without an avatar image is unchanged

When a summary has no `avatar`, or its avatar image fails to load, the card SHALL render with no image element and the same layout as a card with no avatar.

#### Scenario: A card without an avatar has no image element

- **WHEN** a listed character has no `avatar`
- **THEN** its card contains no image element

#### Scenario: A character with no image file shows the plain card

- **WHEN** a listed character's avatar is `/characters/missing.png` and that image fails to load
- **THEN** its card shows no image element
- **AND** the card shows the name and descriptor as it does with no avatar
