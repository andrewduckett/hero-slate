## Purpose

Lets an author give a character sheet a short list of links to other sites used during play, such as a D&D Beyond sheet. The sheet shows only safe `https:` links, and a character without links shows nothing.

## ADDED Requirements

### Requirement: Links are optional character data

The system SHALL read links from an optional `links` key in a character definition. The value SHALL be a list, and each entry SHALL be a mapping with a `url`, an optional `label`, and an optional `color`. The system SHALL treat a missing `links` key, or a value that is not a list, as a character with no links. An invalid `links` value SHALL NOT stop the rest of the sheet from rendering.

#### Scenario: A character without links

- **WHEN** a character definition has no `links` key
- **THEN** the sheet renders every other block as before
- **AND** the sheet shows no links

#### Scenario: A links value that is not a list

- **WHEN** a character definition sets `links` to a string
- **THEN** the sheet shows no links
- **AND** the sheet renders every other block as before

### Requirement: Only https links are kept

The system SHALL keep a link only when its `url` is a string that parses as an absolute URL with the `https:` scheme. The system SHALL drop a link whose URL carries a username or a password. The system SHALL drop an entry that is not a mapping or has no `url`. The system SHALL drop each invalid link silently and keep the valid links around it.

#### Scenario: An https link is kept

- **WHEN** a character lists a link with the URL `https://www.dndbeyond.com/spells`
- **THEN** the sheet shows that link

#### Scenario: A script URL is dropped

- **WHEN** a character lists a link with the URL `javascript:alert(1)`
- **THEN** the sheet does not show that link

#### Scenario: An http link is dropped

- **WHEN** a character lists a link with the URL `http://example.com`
- **THEN** the sheet does not show that link

#### Scenario: A URL with credentials is dropped

- **WHEN** a character lists a link with the URL `https://user:secret@example.com`
- **THEN** the sheet does not show that link

#### Scenario: A relative or malformed URL is dropped

- **WHEN** a character lists a link with the URL `/sunny` or `not a url`
- **THEN** the sheet does not show that link

#### Scenario: An invalid link does not hide valid ones

- **WHEN** a character lists a valid link, then an entry with no `url`, then another valid link
- **THEN** the sheet shows the two valid links in their authored order

### Requirement: Link labels are plain text

The system SHALL show a link's `label` as plain text. The system SHALL NOT interpret rich-text markup or HTML in a label. Emoji in a label SHALL display as written. When the label is missing, not a string, or only whitespace, the system SHALL show the URL's hostname instead.

#### Scenario: A label with emoji

- **WHEN** a character lists a link labelled `📜 D&D Beyond`
- **THEN** the link shows the text `📜 D&D Beyond`

#### Scenario: A label with markup

- **WHEN** a character lists a link labelled `**Spells**`
- **THEN** the link shows the text `**Spells**` exactly, with no bold styling

#### Scenario: A missing label falls back to the hostname

- **WHEN** a character lists a link with the URL `https://www.dndbeyond.com/spells` and no label
- **THEN** the link shows the text `www.dndbeyond.com`

#### Scenario: A blank label falls back to the hostname

- **WHEN** a character lists a link with the label `"   "` and the URL `https://example.com/tool`
- **THEN** the link shows the text `example.com`

### Requirement: Link colour defaults to the character's palette

The system SHALL colour each link with the palette named by its `color`. When a link has no `color`, the system SHALL use the character's palette. The system SHALL resolve an unknown palette name the same way it resolves any other palette name, so an unknown name never breaks the sheet.

#### Scenario: A link without a colour

- **WHEN** a character with the `ocean` palette lists a link with no `color`
- **THEN** the link renders in the `ocean` palette

#### Scenario: A link with its own colour

- **WHEN** a character with the `ocean` palette lists a link with the `color` `fire`
- **THEN** the link renders in the `fire` palette

#### Scenario: A link with an unknown colour

- **WHEN** a character lists a link with the `color` `plaid`
- **THEN** the link renders in the fallback palette
- **AND** the sheet renders without error

### Requirement: Links render as a row of chips

The system SHALL show the kept links as a row of chips that wraps onto more lines when it runs out of width. The system SHALL show the links in their authored order and SHALL keep duplicate links. Each chip SHALL be at least 44 CSS pixels tall. Each chip SHALL show a visual arrow that marks it as a link to another site. The arrow SHALL be hidden from assistive technology.

#### Scenario: Links keep their authored order

- **WHEN** a character lists the links "Sheet", "Spells", and "Map", in that order
- **THEN** the chips appear in the order "Sheet", "Spells", "Map"

#### Scenario: Duplicate links are kept

- **WHEN** a character lists the same URL twice with different labels
- **THEN** the sheet shows both chips

#### Scenario: Many links wrap

- **WHEN** a character lists more links than fit on one line of a phone screen
- **THEN** the chips wrap onto more lines
- **AND** the page does not scroll sideways

### Requirement: Links open in a new tab without a referrer

The system SHALL open each link in a new browser tab. The system SHALL NOT give the opened page access to the sheet's window. The system SHALL NOT send the sheet's address to the linked site. Each link's accessible name SHALL include its label and state that it opens in a new tab.

#### Scenario: Tapping a link keeps the sheet open

- **WHEN** a player taps a link chip
- **THEN** the linked site opens in a new tab
- **AND** the sheet stays open in its own tab

#### Scenario: The linked site learns nothing about the sheet

- **WHEN** a player opens a link
- **THEN** the linked site receives no referrer
- **AND** the linked site has no handle to the sheet's window

#### Scenario: A screen reader announces the new tab

- **WHEN** a screen reader reads a link chip labelled "D&D Beyond"
- **THEN** it announces "D&D Beyond" and that the link opens in a new tab
