## Purpose

Lists the characters on the roster at `/` as large tappable cards, so a player finds and opens a sheet with one tap instead of typing its link. This is the multi-character front door of the "find my character" journey.

## ADDED Requirements

### Requirement: Home lists characters as cards

The system SHALL render, at `/`, one card for each character summary the data provider lists, in the order the provider returns them. Each card SHALL show the character's name as text content, not markup. When the summary carries a level or a class, the card SHALL also show the descriptor line built by the same function the sheet header uses. The system SHALL NOT show search or filter controls, and SHALL NOT show per-device tracking state on a card.

#### Scenario: Three characters render as three cards in order

- **WHEN** a player opens `/` and the provider lists `sunny`, `gimdak` and `urven` in that order
- **THEN** the page shows three cards
- **AND** the first card shows "Sunny Thornwood", the second "Gimdak Steelward" and the third "Urven, the Silent Maw"

#### Scenario: A card shows the descriptor line

- **WHEN** a listed character has name "Sunny Thornwood", level 7 and class "Druid"
- **THEN** its card shows the text "Sunny Thornwood"
- **AND** its card shows the text "Level 7 Druid"

#### Scenario: A card without level or class shows the name alone

- **WHEN** a listed character has a name and neither level nor class
- **THEN** its card shows the name and no descriptor element

#### Scenario: Authored name renders as text, not markup

- **WHEN** a listed character's name is the string `<b>x</b>`
- **THEN** the card shows that literal string as visible text
- **AND** the page creates no corresponding HTML element

### Requirement: A card opens the character's sheet

Each card SHALL be a link whose destination is `/<id>`, where `<id>` is the summary's logical id. The link's accessible name SHALL include the character's name. The system SHALL NOT reference a file name or a storage location in the destination.

#### Scenario: The card links to the sheet and is named after the character

- **WHEN** the card for "Sunny Thornwood" renders
- **THEN** a link with an accessible name containing "Sunny Thornwood" exists
- **AND** its destination is `/sunny`

### Requirement: A card carries the character's color

The system SHALL resolve each summary's `color` through the theming layer's color name resolution and SHALL apply the resolved palette name to that card. A summary with no `color`, or with a value that is not a palette name, SHALL get the `neutral` palette, and the card SHALL still render. The card's text SHALL use a contrast-checked pairing from the resolved palette.

#### Scenario: A known color themes the card

- **WHEN** a listed character has `color: forest`
- **THEN** its card carries the `forest` palette

#### Scenario: An unknown or missing color falls back to neutral

- **WHEN** a listed character has `color: rainbow`, or no `color`
- **THEN** its card carries the `neutral` palette
- **AND** the card still renders its name

### Requirement: Cards are large enough to tap

Each card SHALL offer a tap target at least 44 by 44 CSS pixels. The cards SHALL fit a viewport 360 CSS pixels wide without horizontal scrolling. A reviewer SHALL confirm these properties in a browser, because the test environment does not compute layout.

#### Scenario: Cards fit a phone screen

- **WHEN** a reviewer opens `/` in a browser 360 CSS pixels wide
- **THEN** the page does not scroll sideways
- **AND** each card's tap target is at least 44 by 44 CSS pixels

### Requirement: Home header and page width

The system SHALL show the identity header at `/` with the title "Hero Slate" and the subtitle "Choose your hero", in the `neutral` palette. The home page SHALL keep a content width of at most 44rem at every viewport width.

#### Scenario: The home header invites a choice

- **WHEN** a player opens `/`
- **THEN** the header shows the text "Hero Slate"
- **AND** the header shows the text "Choose your hero"

### Requirement: Home loading, empty and failure states

While the listing is pending, the system SHALL show the fixed text "Loading…" and no cards. When the provider returns `error`, the page SHALL show the fixed text "Could not load characters. Try again." When the provider returns `found` with no summaries, the page SHALL show the fixed text "No characters yet." In every state the page SHALL raise no uncaught error.

#### Scenario: Listing failure shows a retry message

- **WHEN** a player opens `/` and the provider returns `error`
- **THEN** the page shows the fixed text "Could not load characters. Try again."
- **AND** the page shows no cards
- **AND** no uncaught error is raised

#### Scenario: An empty roster shows an empty message

- **WHEN** a player opens `/` and the provider lists no characters
- **THEN** the page shows the fixed text "No characters yet."
- **AND** the page shows no cards

#### Scenario: Cards appear only after the listing resolves

- **WHEN** a player opens `/` and the listing is still pending
- **THEN** the page shows "Loading…" and no cards
- **AND** when the listing resolves with summaries, the page shows the cards and no longer shows "Loading…"
