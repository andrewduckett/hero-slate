## REMOVED Requirements

### Requirement: Home-screen icons

**Reason**: Real art replaces the "HS" placeholder. The requirement is split in two: "Home-screen icon files" keeps the list of icon files and their sizes unchanged, and "Home-screen icons show the logo" replaces the placeholder rule.
**Migration**: None for players. The icon files keep their paths and sizes. A device that already installed the app shows the new icon when it next refreshes the icon or the app is added again.

## ADDED Requirements

### Requirement: Home-screen icon files

The web app manifest SHALL list three PNG icons: 192 × 192 and 512 × 512 with purpose `any`, and 512 × 512 with purpose `maskable`. Every page SHALL link a 180 × 180 PNG as `apple-touch-icon`. Each listed or linked icon SHALL be served at its path, and its pixel size SHALL match the size it declares.

#### Scenario: Each icon exists at its declared size

- **WHEN** a test reads each icon the web app manifest lists, and the `apple-touch-icon`
- **THEN** each file is a PNG
- **AND** its width and height equal its declared size: 192, 512, 512 and 180

#### Scenario: The maskable icon is declared

- **WHEN** a test reads the web app manifest's icons
- **THEN** exactly one icon has purpose `maskable`, and its size is `512x512`

### Requirement: Home-screen icons show the logo

Each home-screen icon SHALL show the Hero Slate logo, centred, on the base surface's dark-mode value. On the maskable icon, the whole logo SHALL lie inside the centre circle whose diameter is 80% of the icon's width.

#### Scenario: The icon background is the dark base surface

- **WHEN** a test reads the top-left pixel of each icon
- **THEN** its colour is the base surface's dark-mode value

#### Scenario: The icon shows the logo

- **WHEN** a test reads the centre pixel of each icon
- **THEN** its colour is not the base surface's dark-mode value

#### Scenario: The maskable logo stays inside the safe zone

- **WHEN** a test reads every pixel of the maskable icon outside the centre circle whose diameter is 80% of its width
- **THEN** each of those pixels is the base surface's dark-mode value

### Requirement: iPad startup image sizes

The site SHALL serve a PNG startup image at `/startup/<width>x<height>.png` for each iPad screen below, in portrait and in landscape. Each image's size SHALL be its screen's pixels; landscape swaps width and height. Every screen has a pixel ratio of 2.

| iPad | Points | Pixels |
|---|---|---|
| mini 8.3" | 744 × 1133 | 1488 × 2266 |
| iPad, Air 11" | 820 × 1180 | 1640 × 2360 |
| Pro 11" | 834 × 1210 | 1668 × 2420 |
| Air 13" | 1024 × 1366 | 2048 × 2732 |
| Pro 13" | 1032 × 1376 | 2064 × 2752 |

#### Scenario: Each startup image exists at its screen size

- **WHEN** a test reads the startup image for each screen and orientation in the table
- **THEN** there are 10 files, and each is a PNG
- **AND** its width and height equal that screen's pixels in that orientation, such as 1488 × 2266 for the mini in portrait and 2266 × 1488 in landscape
- **AND** it is served at `/startup/<width>x<height>.png`

### Requirement: iPad startup images show the logo

Each startup image SHALL show the Hero Slate logo, centred, on the base surface's dark-mode value, with no text.

#### Scenario: A startup image shows the logo on the dark base surface

- **WHEN** a test reads the top-left pixel and the centre pixel of each startup image
- **THEN** the top-left pixel is the base surface's dark-mode value
- **AND** the centre pixel is not

### Requirement: Every page links the iPad startup images

Every page, including `/` and every `/:id` sheet, SHALL link each startup image from the document head with `rel="apple-touch-startup-image"`. Each link's media query SHALL match only its own screen and orientation. It SHALL use `device-width`, `device-height`, `-webkit-device-pixel-ratio` and `orientation`. `device-width` and `device-height` SHALL be the portrait points, in both orientations.

#### Scenario: A page links a startup image for each screen and orientation

- **WHEN** a test reads the document head of the app shell
- **THEN** it holds 10 `<link rel="apple-touch-startup-image">` elements
- **AND** each `href` names a startup image the site serves

#### Scenario: The iPad mini portrait link matches only that screen

- **WHEN** a test reads the link whose `href` is `/startup/1488x2266.png`
- **THEN** its `media` is `(device-width: 744px) and (device-height: 1133px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)`

#### Scenario: The iPad mini landscape link keeps the portrait points

- **WHEN** a test reads the link whose `href` is `/startup/2266x1488.png`
- **THEN** its `media` is `(device-width: 744px) and (device-height: 1133px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)`

#### Scenario: Each link's media query is unique

- **WHEN** a test reads the `media` of every startup-image link
- **THEN** no two are equal
