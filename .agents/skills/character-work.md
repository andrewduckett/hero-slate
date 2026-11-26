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
not support that entry. Treat it as a gap, and follow
[the gap steps](#when-the-author-wants-something-the-sheet-cannot-do). The
nearest supported choice is often prose in a custom section row.

## When the Author wants something the sheet cannot do

A *gap* is something the Author wants that the sheet format cannot express,
such as a pool of more than 100 uses, a link that is not `https:`, or a second
avatar. On a gap, do these four things in order:

1. Tell the Author that the sheet cannot do it, and why.
2. Offer the nearest supported choice, such as prose in a custom section row.
3. Offer to open an issue for it through the `lets-shape` skill.
4. Carry on with the sheet or the avatar, whether the Author accepts or
   declines each offer.

When the Author accepts the issue, do not run `lets-shape` yet. Add the gap
as one line to `.workspace/<id>.gaps.md`, where `<id>` is the character's id,
and carry on. After the sheet is written or the avatar is saved, run
`lets-shape` once for every gap in that file. When the Author declines, open
no issue and add no line.

## When the Author asks for a change outside character work

Do not change any file outside `static/characters/` and `.workspace/`, such
as app code, a test, a spec, a skill's instructions or the avatar style
guide, even when the Author asks for the change now. That change is new
work, not character work. Tell the Author that:

- the change starts as an issue through the `lets-shape` skill
- the `lets-go` skill builds it later, on its own branch and pull request
- they can start that run once the sheet or the avatar is done

Then offer the issue as in [the gap steps](#when-the-author-wants-something-the-sheet-cannot-do),
and carry on with the character.

## Commits

The character skills do not commit. When the Author asks you to commit the
character work, commit only files under `static/characters/`. If the working
tree holds other changes, leave them out of the commit, and tell the Author
which files you left out.
