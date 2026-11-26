# Character work

Read this before you create or change a character's files, with or without a
skill. The `dndbeyond-to-slate` and `character-avatar` skills follow it, and so
does a hand edit.

## What character work is

Character work is creating or changing a character's files: its character
file, its avatar and its line in the character manifest. The glossary defines
it: [Character work](../../openspec/glossary.md#character-work).

## Where character work writes

Character work writes only these two folders:

- `static/characters/`, for the character file, the avatar and the character
  manifest
- `.workspace/`, for drafts and scratch files, which git ignores

It never creates or changes any other file. These are off limits:

- app code, such as anything under `src/`
- tests
- specs, under `openspec/`
- skill instructions, under `.agents/skills/`, including this file
- the avatar style guide, `.agents/skills/character-avatar/style-guide.md`

## What the sheet supports

Offer the Author only what the app reads and draws today. These specs define
it:

- [`character-data`](../../openspec/specs/character-data/spec.md): the
  character file's identity fields, abilities, combat, hit points and avatar
- [`character-sheet`](../../openspec/specs/character-sheet/spec.md): what the
  sheet draws
- [`resource-pools`](../../openspec/specs/resource-pools/spec.md): limited
  uses, spell slots and Pact Magic
- [`custom-sections`](../../openspec/specs/custom-sections/spec.md): sections
  and their rows
- [`character-links`](../../openspec/specs/character-links/spec.md): links
- [`rich-text`](../../openspec/specs/rich-text/spec.md): the text and pills
  in a row
- [`theming`](../../openspec/specs/theming/spec.md): the palette colors

Read the specs when you need the details; this file does not copy them.

A preview warning that the app drops an entry is evidence that the sheet does
not support that entry. Treat it as a gap. The nearest supported choice is
often prose in a custom section row.
