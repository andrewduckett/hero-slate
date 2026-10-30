## ADDED Requirements

### Requirement: The sheet links back to the picker

A loaded sheet SHALL show a link to the home page, `/`, whose accessible name is "All heroes" and whose visible text is "← All heroes". It SHALL be a plain link, so one tap opens the home page in a browser and in the installed full-screen app alike. The home page SHALL NOT show this link.

#### Scenario: A loaded sheet links to the home page

- **WHEN** a character with name "Sunny Thornwood" loads
- **THEN** the page contains a link named "All heroes"
- **AND** the link's address is `/`
- **AND** the link shows the text "← All heroes"

#### Scenario: The home page has no link to itself

- **WHEN** the home page lists its characters
- **THEN** the page contains no link named "All heroes"

### Requirement: Page controls sit in a bar above the header

The "All heroes" link and the theme toggle SHALL sit in one bar directly above the identity header, on the page surface in the foreground colour. The link SHALL sit at the start of the bar and the toggle at its end; on the home page the bar SHALL hold only the toggle. The bar SHALL take the place of the page's top margin. Each control SHALL offer a tap target of at least 44 by 44 CSS pixels, and none SHALL overlap the avatar.

#### Scenario: The bar holds the link, then the toggle

- **WHEN** a character with an avatar loads
- **THEN** the "All heroes" link and the theme toggle sit in one bar that comes before the header
- **AND** the header contains neither the link nor the toggle
- **AND** the link comes before the toggle

#### Scenario: The home page's bar holds only the toggle

- **WHEN** the home page lists its characters
- **THEN** the theme toggle sits in a bar that comes before the header
- **AND** the header does not contain the toggle

#### Scenario: The toggle still works on a sheet with an avatar

- **WHEN** a character with an avatar loads and the player activates the toggle
- **THEN** the page's mode switches, as it does with no avatar

#### Scenario: The bar keeps the art clear on a phone

- **WHEN** a reviewer opens a sheet whose avatar image exists, in light mode and in dark mode, in a browser 360 CSS pixels wide
- **THEN** no control overlaps the image
- **AND** the link and the toggle each offer a tap target of at least 44 by 44 CSS pixels
- **AND** the header starts no more than 60 CSS pixels from the top of the page
- **AND** the page does not scroll sideways
- **AND** the reviewer records the check

#### Scenario: The bar spans both columns on a wide screen

- **WHEN** a reviewer opens a sheet in a browser 1280 CSS pixels wide
- **THEN** the bar spans the full width above both columns
- **AND** the reviewer records the check

#### Scenario: The link works in the installed app

- **WHEN** a reviewer opens a sheet from its home-screen icon and taps the "All heroes" link
- **THEN** the home page opens, still full-screen
- **AND** the reviewer records the check

### Requirement: Error and not-found messages link back to the picker

When a sheet shows "Character not found" or "Could not load this character. Try again.", the page SHALL also show a link to `/` with the text "Choose your hero", with a tap target of at least 44 by 44 CSS pixels. A reviewer SHALL confirm the tap target in a browser.

#### Scenario: Not-found message links to the home page

- **WHEN** a player opens `/:id` and the provider returns `not-found`
- **THEN** the page shows the text "Character not found"
- **AND** the page shows a link with the text "Choose your hero" whose address is `/`

#### Scenario: Invalid message links to the home page

- **WHEN** a player opens `/:id` and the provider returns `invalid`
- **THEN** the page shows a link with the text "Choose your hero" whose address is `/`

#### Scenario: Error message links to the home page

- **WHEN** a player opens `/:id` and the provider returns `error`
- **THEN** the page shows the text "Could not load this character. Try again."
- **AND** the page shows a link with the text "Choose your hero" whose address is `/`

#### Scenario: The message link is large enough to tap

- **WHEN** a reviewer opens a not-found id in a browser 360 CSS pixels wide and measures the "Choose your hero" link
- **THEN** its tap target is at least 44 by 44 CSS pixels
- **AND** the reviewer records the check

## REMOVED Requirements

### Requirement: Theme toggle stays legible over the avatar

**Reason**: The theme toggle moves out of the header into the bar above it, so it no longer sits over the art and needs no opaque backing.

**Migration**: "Page controls sit in a bar above the header" now places the toggle. Its scenario "The toggle still works on a sheet with an avatar" keeps the old check that the toggle works with an avatar.
