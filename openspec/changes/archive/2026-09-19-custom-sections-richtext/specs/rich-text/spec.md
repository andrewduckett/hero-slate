## Purpose

The rich-text capability defines a small, safe inline markup grammar for freeform
body text. It renders `**bold**`, `*italic*`, native emoji, and `[[...]]` pills as
styled inline elements without ever constructing an HTML string.

## ADDED Requirements

### Requirement: Bold and italic inline emphasis

The system SHALL render text wrapped in `**...**` as bold. It SHALL render text
wrapped in `*...*` as italic. Emphasis markers MAY nest across kinds: bold may wrap
italic, and italic may wrap bold. The system SHALL apply emphasis to the inner
content.

A marker SHALL open a span only when no span of that kind is already open. When a
span of that kind is already open, the marker SHALL close it instead. At most one
bold span and one italic span can therefore be open at once, so emphasis nesting
SHALL NOT exceed two levels. The grammar produces this bound on its own, so the
system needs no separate depth limit.

If no open span of that kind exists, a closing delimiter SHALL render as literal
characters. When closing a span, the system SHALL abandon any inner span of the
other kind that remains open within it. It SHALL render that span's opening
delimiter as literal characters within the closed span's content.

#### Scenario: Bold renders text in bold

- **WHEN** a body contains `**attack**`
- **THEN** the system renders "attack" as bold text

#### Scenario: Italic renders text in italic

- **WHEN** a body contains `*easier*`
- **THEN** the system renders "easier" as italic text

#### Scenario: Bold wraps a dice pill

- **WHEN** a body contains `**[[d20+6]]**`
- **THEN** the system renders a dice pill inside a bold span

#### Scenario: Italic nests inside bold

- **WHEN** a body contains `**some *very* strong**`
- **THEN** the system renders "very" as italic inside a bold span

#### Scenario: Overlapping markers close greedily

- **WHEN** a body contains `*italic **bold-and-italic* bold**`
- **THEN** the system closes the italic span at the first `*` it encounters
- **AND** the remaining `**` after that `*` renders as literal characters

#### Scenario: A second marker of the same kind closes instead of nesting

- **WHEN** a body contains `*first *second*`
- **THEN** the system closes the italic span at the second `*`, so only "first " is italic
- **AND** it renders "second" as plain text
- **AND** it renders the third `*` as a literal character

### Requirement: Forgiving parse of malformed markers

The system SHALL render an unmatched or unclosed emphasis marker as the literal
marker character(s). It SHALL never silently drop or skip any authored text.

#### Scenario: Unmatched asterisk renders literally

- **WHEN** a body contains a single `*` not paired with a closing `*`
- **THEN** the system renders `*` as a visible character in the output

#### Scenario: Unclosed bold renders literally

- **WHEN** a body contains `**bold` with no closing `**`
- **THEN** the system renders `**bold` as literal characters

### Requirement: Pill rendering from `[[...]]`

The system SHALL render a `[[...]]` span with non-empty trimmed inner text as a
non-interactive inline pill. It SHALL trim the inner text and classify it as one
of two flavors:

- **Bonus pill** — trimmed inner text is a signed integer: a `+` or `-` followed
  by one or more digits, with no other characters (e.g. `+7`, `-2`). The system
  SHALL render the label with no glyph.
- **Dice pill** — all other non-empty trimmed inner text. This includes dice
  notation (e.g. `d20+6`, `2d6`) and any other content (e.g. `advantage`). The
  system SHALL prefix the label with a dice glyph (🎲).

A `[[...]]` span whose inner text is empty or whitespace-only after trimming SHALL
render as the original authored characters unchanged (for example, `[[]]` renders
as `[[]]` and `[[   ]]` renders as `[[   ]]`).

The pill SHALL be display-only. The system SHALL NOT attach any interactive
behavior to a pill.

#### Scenario: Dice notation renders as a dice pill

- **WHEN** a body contains `[[d20+6]]`
- **THEN** the system renders a dice pill labeled "d20+6" with a dice glyph

#### Scenario: Multi-die notation renders as a dice pill

- **WHEN** a body contains `[[2d6]]`
- **THEN** the system renders a dice pill labeled "2d6" with a dice glyph

#### Scenario: Uppercase D renders as a dice pill

- **WHEN** a body contains `[[1D20]]`
- **THEN** the system renders a dice pill labeled "1D20" with a dice glyph

#### Scenario: Arbitrary text renders as a dice pill

- **WHEN** a body contains `[[advantage]]`
- **THEN** the system renders a dice pill labeled "advantage" with a dice glyph

#### Scenario: Positive signed number renders as a bonus pill

- **WHEN** a body contains `[[+7]]`
- **THEN** the system renders a bonus pill labeled "+7" with no glyph

#### Scenario: Negative signed number renders as a bonus pill

- **WHEN** a body contains `[[-2]]`
- **THEN** the system renders a bonus pill labeled "-2" with no glyph

#### Scenario: Empty `[[]]` renders literally

- **WHEN** a body contains `[[]]`
- **THEN** the system renders the literal text `[[]]`

#### Scenario: Pills are not interactive

- **WHEN** a player views a body containing a pill
- **THEN** the pill has no button, link, or click behavior

### Requirement: Native emoji pass through unchanged

The system SHALL render emoji in body text as authored Unicode characters. It SHALL
apply no special processing, escaping, or filtering to emoji.

#### Scenario: Emoji renders as-is

- **WHEN** a body contains `Turn into an animal 🐺`
- **THEN** the system renders the 🐺 character inline in the output

### Requirement: XSS-safe rendering

The system SHALL never construct an HTML string from authored body text. It SHALL
render all authored text as text nodes so the browser never interprets body
content as markup. It SHALL NOT use `{@html}` or equivalent raw-HTML injection
in the rich-text rendering path.

#### Scenario: HTML tags in body text render as visible characters

- **WHEN** a body contains `<script>alert(1)</script>`
- **THEN** the system renders the literal characters, including the angle brackets
- **AND** no script executes

#### Scenario: HTML injection inside a pill renders as visible characters

- **WHEN** a body contains `[[</span><img onerror=x>]]`
- **THEN** the system renders the inner text as a pill label, not as HTML
- **AND** no tag breakout occurs

#### Scenario: HTML inside emphasis renders as visible characters

- **WHEN** a body contains `**<b>hi</b>**`
- **THEN** the system renders a bold span containing the literal text `<b>hi</b>`
