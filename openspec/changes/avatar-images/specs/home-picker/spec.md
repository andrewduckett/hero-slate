## ADDED Requirements

### Requirement: A card shows the character's avatar

When a summary's `avatar` resolves to an image source by the same site-path rule the sheet header uses, the card SHALL show that image filling the card's right side and fading into the card's accent, so that the name and descriptor sit on the solid accent and keep the contrast-checked pairing. The image SHALL be decorative, with empty alternative text, so the card link's accessible name stays the character's name.

#### Scenario: A card shows the avatar image

- **WHEN** a listed character has name "Sunny Thornwood" and `avatar` "/characters/sunny.png"
- **THEN** its card contains an image whose source is `/characters/sunny.png`
- **AND** the image's alternative text is empty
- **AND** the card's link is still named "Sunny Thornwood"

#### Scenario: Card text stays on solid accent over the art

- **WHEN** a reviewer opens `/` with a character whose avatar resolves to an image, in light mode and in dark mode, in a browser
- **THEN** the image fills the card's right side and fades into the accent before it reaches the name and descriptor
- **AND** the name and descriptor sit on the solid accent
- **AND** the reviewer records the check, because the test environment does not compute layout

### Requirement: A card without a usable avatar is unchanged

When a summary's avatar resolves to no avatar, or the image fails to load, the card SHALL render with no image element and the same layout as a card with no avatar.

#### Scenario: A card without an avatar has no image element

- **WHEN** a listed character has no `avatar`
- **THEN** its card contains no image element

#### Scenario: A card with a non-site-path avatar has no image element

- **WHEN** a listed character's `avatar` is `https://example.test/sunny.png`
- **THEN** its card contains no image element
- **AND** the page makes no request to `example.test`

#### Scenario: A failed image load leaves the plain card

- **WHEN** a listed character's avatar resolves to `/characters/missing.png` and that image fails to load
- **THEN** its card shows no image element
- **AND** the card shows the name and descriptor as it does with no avatar
