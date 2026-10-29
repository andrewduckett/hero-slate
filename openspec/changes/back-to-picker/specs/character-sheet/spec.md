## ADDED Requirements

### Requirement: The sheet header links back to the picker

The identity header on a loaded sheet SHALL hold a link to the home page, `/`, whose accessible name is "All heroes" and whose visible content is the house glyph ⌂. It SHALL be a plain link, so one tap opens the home page in a browser and in the installed full-screen app alike. The home page's header SHALL NOT show this link.

#### Scenario: A loaded sheet links to the home page

- **WHEN** a character with name "Sunny Thornwood" loads
- **THEN** the header contains a link named "All heroes"
- **AND** the link's address is `/`
- **AND** the link shows the text "⌂"

#### Scenario: The home page has no link to itself

- **WHEN** the home page lists its characters
- **THEN** the header contains no link named "All heroes"

### Requirement: The way back sits under the theme toggle

The "All heroes" link SHALL sit directly below the theme toggle, on the toggle's opaque backing in the accent, so the toggle keeps its place and the link keeps the accent/on-accent pairing over any art. The link SHALL offer a tap target of at least 44 by 44 CSS pixels. A reviewer SHALL confirm the layout in a browser, because the test environment does not compute layout.

#### Scenario: The link sits on the toggle's backing

- **WHEN** a character with an avatar loads
- **THEN** the "All heroes" link and the theme toggle share one opaque accent backing
- **AND** the theme toggle comes before the link

#### Scenario: The link is visible and large enough over the art

- **WHEN** a reviewer opens a sheet whose avatar image exists, in light mode and in dark mode, in a browser 360 CSS pixels wide
- **THEN** the link sits directly below the theme toggle, and the toggle is in the same place as on a sheet with no avatar image
- **AND** the link is visible over the image
- **AND** the link's tap target is at least 44 by 44 CSS pixels
- **AND** the page does not scroll sideways
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
