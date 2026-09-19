## Why

Hero Slate shows stats and trackers, but not the freeform prompts that are the
product's reason to exist. This change adds authored sections that replace a rules
catalog with short prompts a 9-year-old can read and act on. Its dependencies —
theming and the stat block — have shipped, so this Must-priority story is next.

## What Changes

- Add `sections`: an authored, ordered list of titled groups. Each group is
  `{ title, color, rows }`.
- Make each row a titled rich-text line: `{ title, color?, body }`. The title sits
  left; the body sits right.
- Add a safe rich-text renderer for every body. It supports `**bold**`, `*italic*`,
  native emoji, and `[[...]]` pills.
- Render a `[[...]]` pill as non-interactive display. A dice shape such as
  `[[d20+6]]` shows a dice pill; a signed number such as `[[+7]]` shows a bonus chip.
- Render sections in authored order below the stat blocks. A section title and a row
  title each take their named palette color, falling back to neutral when unknown.
- Omit a section or row when it is absent or invalid. Render malformed markup as
  literal text, so a typo never breaks a sheet.
- Restructure the provisional `sections` sample in `sunny.yaml` to the new shape.

The renderer builds no HTML string and never uses `{@html}`. Authored config
therefore cannot inject markup, so bodies are XSS-safe by construction.

## Capabilities

### New Capabilities

- `custom-sections`: authored sections and their titled rows — validation, authored
  order, per-title palette color, and hiding a section or row that is absent or invalid.
- `rich-text`: the safe inline markup grammar and pill rendering shared by every
  freeform body — emphasis, emoji, dice and bonus pills, and literal fallback.

### Modified Capabilities

<!-- None. `sections` was a provisional pass-through field, so no existing
     requirement changes. The theming color fallback and the provider's identity
     validation are unchanged; this change reuses them without altering them. -->

## Impact

- **New code**: `src/lib/richtext/parse.ts` and `RichText.svelte`;
  `src/lib/character/sections.ts` and `SectionsBlock.svelte`; colocated tests for each.
- **Modified code**: `CharacterView.svelte` renders the new block; `src/lib/types.ts`
  notes the resolved `sections` shape; `static/characters/sunny.yaml` gains a real sample.
- **No new dependencies, no backend.** Reuses `resolvePalette` and `data-palette`, and
  follows the established pure-resolve / thin-render pattern.
