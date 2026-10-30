## ADDED Requirements

### Requirement: The sheet header is the way back to the picker

On a loaded sheet, the identity header SHALL be a link to the home page, `/`, whose accessible name is "All heroes". It SHALL show the caption "‹ All heroes" above the name, on the solid accent, so a player can tell what a tap does. It SHALL be a plain link, so one tap opens the home page in a browser and in the installed full-screen app alike. The home page's header SHALL NOT be a link.

#### Scenario: A loaded sheet's header links to the home page

- **WHEN** a character with name "Sunny Thornwood" loads
- **THEN** the page contains a link named "All heroes"
- **AND** the link's address is `/`
- **AND** the link contains the text "Sunny Thornwood"

#### Scenario: The caption comes before the name

- **WHEN** a character with name "Sunny Thornwood" loads
- **THEN** the header shows the text "‹ All heroes"
- **AND** that text comes before the heading "Sunny Thornwood"

#### Scenario: The home page has no link to itself

- **WHEN** the home page lists its characters
- **THEN** the page contains no link named "All heroes"

#### Scenario: The caption keeps the art clear on a phone

- **WHEN** a reviewer opens a sheet whose avatar image exists, in light mode and in dark mode, in a browser 360 CSS pixels wide
- **THEN** the caption sits on the solid accent, outside the image
- **AND** nothing covers the image
- **AND** the header starts at the page's top margin, as it does on the home page
- **AND** the page does not scroll sideways
- **AND** the reviewer records the check

#### Scenario: The card stays one row on a tablet

- **WHEN** a reviewer opens a sheet whose avatar image exists in a browser 768 CSS pixels wide
- **THEN** the name sits on one line, with the caption above it and the descriptor below it
- **AND** the reviewer records the check

#### Scenario: The link works in the installed app

- **WHEN** a reviewer opens a sheet from its home-screen icon and taps the header
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

**Reason**: The theme toggle leaves the sheet. It lives in the home page's header only, where there is no avatar, because the chosen mode applies to every route.

**Migration**: The `theming` spec's "Manual mode toggle" now places the control on the home page. Nothing on a sheet sits over the art.
