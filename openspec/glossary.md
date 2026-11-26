# Glossary

Shared vocabulary for Hero Slate. Use these meanings in specs, issues, code
names and reviews. A spec folder under `openspec/specs/` may hold its own
`glossary.md` for a narrower meaning.

## Avatar

The picture of a character that the sheet header and the picker card show. It
is the PNG named after the character's id, `static/characters/<id>.png`, and
the provider supplies its URL. "Portrait" is the everyday word for the same
picture.

## Character manifest

The roster file, `static/characters/manifest.yaml`, that lists the characters
on the home page, in the order their cards appear. Do not shorten it to
"manifest"; see [Web app manifest](#web-app-manifest).

## Character work

Creating or changing a character's files: its character file, its avatar and
its line in the character manifest. Character work changes nothing outside
`static/characters/`. When the Author wants something the sheet format cannot
express, that is a new capability: it becomes an issue, not part of the
character work.

## Character work pull request

A pull request whose title starts with `char:`. It may change only files in
`static/characters/`, compared with its base branch. The mark is on the title
only; its commits keep their Conventional Commits types. A pull request without
the mark may change character files together with anything else.

## Web app manifest

The file that tells a device how to install Hero Slate on its home screen and
open it full-screen: its name, icons and colours. Do not shorten it to
"manifest"; see [Character manifest](#character-manifest).
