## Purpose

Lets a player add Hero Slate, or one character's sheet, to a device's home screen, and opens it full-screen from that icon. This is the home-screen half of the "use with no wifi" journey.

## ADDED Requirements

### Requirement: Every page links the web app manifest

The system SHALL serve a web app manifest at `/manifest.webmanifest`. Every page, including `/` and every `/:id` sheet, SHALL link to it from the document head. The single-page fallback SHALL NOT capture this path.

#### Scenario: The built site serves the web app manifest

- **WHEN** a request is made to `/manifest.webmanifest` on the built site
- **THEN** the response status is 200
- **AND** the body parses as JSON, not the app shell

#### Scenario: A sheet links the web app manifest

- **WHEN** a player opens `/sunny`
- **THEN** the document head holds a `<link rel="manifest">` whose `href` is `/manifest.webmanifest`

### Requirement: The installed app is named Hero Slate and opens full-screen

The web app manifest SHALL set `name` and `short_name` to "Hero Slate". It SHALL set `display` to `standalone`, so the installed app opens with no browser bar.

#### Scenario: The web app manifest names the app and sets the display

- **WHEN** a test reads the web app manifest
- **THEN** `name` is "Hero Slate" and `short_name` is "Hero Slate"
- **AND** `display` is `standalone`

### Requirement: The icon opens the page it was added from

The web app manifest SHALL NOT declare `start_url`, `id` or `scope`. A device then opens an installed icon at the page the player added it from: added from `/sunny`, it opens Sunny's sheet; added from `/`, it opens the home page.

#### Scenario: The web app manifest has no fixed start page

- **WHEN** a test reads the web app manifest
- **THEN** it has no `start_url` key
- **AND** it has no `id` key and no `scope` key

### Requirement: Home-screen icons

The web app manifest SHALL list three PNG icons: 192 × 192 and 512 × 512 with purpose `any`, and 512 × 512 with purpose `maskable`. Every page SHALL link a 180 × 180 PNG as `apple-touch-icon`. Each listed or linked icon SHALL be served at its path, and its pixel size SHALL match the size it declares. Until real art ships, each icon SHALL show "HS" on the `neutral` palette's light-mode accent, in that palette's light-mode on-accent.

#### Scenario: Each icon exists at its declared size

- **WHEN** a test reads each icon the web app manifest lists, and the `apple-touch-icon`
- **THEN** each file is a PNG
- **AND** its width and height equal its declared size: 192, 512, 512 and 180

#### Scenario: The maskable icon is declared

- **WHEN** a test reads the web app manifest's icons
- **THEN** exactly one icon has purpose `maskable`, and its size is `512x512`

#### Scenario: The placeholder background is the neutral accent

- **WHEN** a test reads the top-left pixel of each icon
- **THEN** its color is the `neutral` palette's light-mode accent

### Requirement: Install colours come from the palette

The web app manifest's `theme_color` and `background_color` SHALL each equal the base surface's dark-mode value, the resting default. The values SHALL come from the palette that defines every theme colour, and a test SHALL fail when the served web app manifest differs from it.

#### Scenario: The web app manifest colours match the palette

- **WHEN** a test reads the web app manifest and the palette
- **THEN** `theme_color` and `background_color` both equal the base surface's dark-mode value

### Requirement: Theme colour follows the active mode

The page SHALL carry a `theme-color` meta tag whose value is the base surface of the mode the sheet shows. The value SHALL be set before the first paint, from the stored choice or else the device preference, as the mode is. When the player switches mode with the toggle, the value SHALL change to the new mode's surface at once, with no reload.

#### Scenario: Theme colour matches the mode on load

- **WHEN** a player whose stored choice is `light` opens any page
- **THEN** the `theme-color` meta tag's content is the base surface's light-mode value before content paints

#### Scenario: Theme colour follows the toggle

- **WHEN** a player in dark mode activates the mode toggle
- **THEN** the `theme-color` meta tag's content becomes the base surface's light-mode value

### Requirement: Page title names the character

On a sheet whose character has loaded, the page `<title>` SHALL be the character's `name`, then " — Hero Slate". On `/`, and on a sheet that is loading or shows an error, the `<title>` SHALL be "Hero Slate". The title SHALL NOT echo an id from the path.

#### Scenario: A loaded sheet titles the page with the name

- **WHEN** a player opens `/sunny` and the provider returns `found` with name "Sunny Thornwood"
- **THEN** the document title is "Sunny Thornwood — Hero Slate"

#### Scenario: The home page is titled Hero Slate

- **WHEN** a player opens `/`
- **THEN** the document title is "Hero Slate"

#### Scenario: A missing character does not echo the id

- **WHEN** a player opens `/nobody` and the provider returns `not-found`
- **THEN** the document title is "Hero Slate"

### Requirement: iPad home-screen label names the character

On a sheet whose character has loaded, the page SHALL carry an `apple-mobile-web-app-title` meta tag whose content is the character's full `name`, unshortened. On `/`, and on a sheet that is loading or shows an error, its content SHALL be "Hero Slate".

#### Scenario: A loaded sheet labels the icon with the name

- **WHEN** a player opens `/sunny` and the provider returns `found` with name "Sunny Thornwood"
- **THEN** the `apple-mobile-web-app-title` meta tag's content is "Sunny Thornwood"

#### Scenario: The home page labels the icon Hero Slate

- **WHEN** a player opens `/`
- **THEN** the `apple-mobile-web-app-title` meta tag's content is "Hero Slate"
