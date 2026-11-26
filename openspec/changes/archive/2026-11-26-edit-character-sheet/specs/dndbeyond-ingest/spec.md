<!-- Plain language: Name the actor, condition and observable result. Explain necessary domain terms using the agreed glossary. Keep requirement and scenario headings and WHEN/THEN syntax exactly as required. -->

## MODIFIED Requirements

### Requirement: Failures are distinct and actionable

The digest, preview, and write tools SHALL end every failed run with a distinct non-zero exit code and at least one line of explanation on standard error. The digest tool SHALL write nothing to standard output on failure. The exit codes SHALL be:

| Code | Meaning | Tools |
|------|---------|-------|
| 0 | Success | all |
| 1 | The draft has at least one error | preview, write |
| 2 | The character is private, or the service refused access | digest |
| 3 | The target character file already exists (new-character mode) | preview, write |
| 4 | The character reference is unreadable, or the character does not exist | digest |
| 5 | A network failure, or a response the digest tool cannot read | digest |
| 6 | The target character file does not exist (edit mode) | preview, write |

The digest tool SHALL fetch the character from the D&D Beyond character service. A private character's message SHALL tell the Author to set the character to Public on D&D Beyond and retry. "Required digest fields" and "Optional digest fields" say which responses are unreadable.

#### Scenario: A private character

- **WHEN** the service answers with HTTP 403
- **THEN** the tool exits with code 2
- **AND** its message tells the Author to set the character to Public and retry

#### Scenario: A missing character

- **WHEN** the service answers with HTTP 404
- **THEN** the tool exits with code 4

#### Scenario: A network failure

- **WHEN** the request fails before any response arrives
- **THEN** the tool exits with code 5

#### Scenario: An unexpected response shape

- **WHEN** the service answers with HTTP 200 but the body lacks the character data the digest needs
- **THEN** the tool exits with code 5
- **AND** its message names the missing part

#### Scenario: A field with the wrong type

- **WHEN** the service answers with HTTP 200 and `inventory` is an object instead of a list
- **THEN** the tool exits with code 5
- **AND** its message names `inventory`

#### Scenario: A null optional field means none

- **WHEN** the service answers with HTTP 200 and `bonusHitPoints` is `null`
- **THEN** the digest adds no bonus hit points
- **AND** the tool exits with code 0

### Requirement: No overwrite of an existing character

The preview tool and the write tool run in *new-character mode* unless they receive the edit flag. In new-character mode, each SHALL stop with exit code 3 when `static/characters/<id>.yaml` already exists for the target logical id. The message SHALL say that the file already exists and that the edit flag changes an existing sheet. The preview tool SHALL run this check before it draws anything, so the Author never approves a draft that the write tool would refuse.

#### Scenario: The target id is taken

- **WHEN** the Author previews a draft for id `urven` without the edit flag, and `static/characters/urven.yaml` exists
- **THEN** the tool exits with code 3
- **AND** it draws no preview
- **AND** its message names `static/characters/urven.yaml` and the edit flag

### Requirement: The write tool saves only a valid, approved draft

The write tool SHALL be the only way the ingest saves a character file. Given a draft file in new-character mode, it SHALL:
- take the target logical id from the draft's file name, without the `.yaml` extension
- run every draft validation check again, and stop with exit code 1 on any error
- stop with exit code 3 when `static/characters/<id>.yaml` already exists
- create `static/characters/<id>.yaml` with exactly the bytes of the draft file
- refuse to replace a file that appears between its check and its write

In edit mode, it replaces an existing file instead, as "The edit write replaces the saved file" says.

"The write tool writes only inside the characters folder" says where it writes.

#### Scenario: A valid draft is written byte for byte

- **WHEN** the write tool receives a valid draft `.workspace/urven-2.yaml` and no `static/characters/urven-2.yaml` exists
- **THEN** it creates `static/characters/urven-2.yaml` with the same bytes as the draft
- **AND** it exits with code 0

#### Scenario: A draft with errors is not written

- **WHEN** the write tool receives a draft with no `name`
- **THEN** it exits with code 1
- **AND** it creates no file

#### Scenario: A file name outside the id grammar is refused

- **WHEN** the write tool receives a draft named `Urven.yaml`
- **THEN** it reports that the id `Urven` does not match the id grammar
- **AND** it exits with code 1 and creates no file

## ADDED Requirements

### Requirement: Required digest fields

The digest tool SHALL treat these fields as required: `name`, `classes` (a non-empty list, each with a level), `stats` (all six abilities), `baseHitPoints`, the base walking speed, `modifiers`, and `inventory`. A required field that is missing, `null`, or of an unexpected type SHALL make the response unreadable (exit 5).

#### Scenario: A missing required field

- **WHEN** the service answers with HTTP 200 and the character data has no `stats`
- **THEN** the tool exits with code 5
- **AND** its message names `stats`

### Requirement: Optional digest fields

The digest tool SHALL treat these fields as optional: bonus and override scores, `bonusHitPoints`, `overrideHitPoints`, `characterValues`, any single modifier group such as `modifiers.item`, and a subclass. D&D Beyond uses `null` or leaves such a field out to mean "none". The digest tool SHALL read a missing or `null` optional field as none. It SHALL treat an optional field that is present, not `null`, and of an unexpected type as unreadable (exit 5).

#### Scenario: An optional field with the wrong type

- **WHEN** the service answers with HTTP 200 and `bonusHitPoints` is the string `"four"`
- **THEN** the tool exits with code 5
- **AND** its message names `bonusHitPoints`

### Requirement: The write tool writes only inside the characters folder

In both modes, the write tool SHALL ignore the draft's directory when it builds the target path. Because the logical id must also match the provider's id grammar, the write tool SHALL only ever write a `.yaml` file directly inside `static/characters/`.

#### Scenario: The draft's directory is ignored

- **WHEN** the write tool receives a valid draft `.workspace/edit/sunny.yaml` with the edit flag
- **THEN** the only file it writes is `static/characters/sunny.yaml`

### Requirement: Edit mode

The preview tool and the write tool SHALL each accept an edit flag, `--edit`. With it, a tool runs in *edit mode*, for a character file that already exists. The *saved file* is `static/characters/<id>.yaml`, where `<id>` is the draft's file name without `.yaml`. In edit mode, each tool SHALL stop with exit code 6 when the saved file does not exist, with a message that names the missing file. The preview tool SHALL run this check before it draws anything.

#### Scenario: An edit preview for a missing character

- **WHEN** the Author previews `.workspace/edit/nobody.yaml` with the edit flag, and `static/characters/nobody.yaml` does not exist
- **THEN** the tool exits with code 6
- **AND** it draws no preview
- **AND** its message names `static/characters/nobody.yaml`

#### Scenario: An edit write for a missing character

- **WHEN** the write tool receives `.workspace/edit/nobody.yaml` with the edit flag, and `static/characters/nobody.yaml` does not exist
- **THEN** it exits with code 6
- **AND** it creates no file

### Requirement: The edit preview validates and draws the draft

In edit mode, the preview tool SHALL run every draft validation check and stop with exit code 1 on any error, as in new-character mode. On no error, it SHALL draw the draft as "The preview shows the draft as the app will render it" says, and SHALL run the cross-check when it receives a digest. It SHALL then print the change list, and then every warning.

#### Scenario: An edit preview for an existing character

- **WHEN** the Author previews a valid draft `.workspace/edit/sunny.yaml` with the edit flag, and `static/characters/sunny.yaml` exists
- **THEN** the tool draws the draft
- **AND** it prints the change list after the drawing
- **AND** it exits with code 0

#### Scenario: An edit preview with errors

- **WHEN** the Author previews a draft `.workspace/edit/sunny.yaml` with no `name`, with the edit flag
- **THEN** the tool exits with code 1
- **AND** it draws no preview

### Requirement: The edit write replaces the saved file

In edit mode, the write tool SHALL run every draft validation check again, and stop with exit code 1 on any error, leaving the saved file unchanged. On no error, it SHALL replace the saved file with exactly the bytes of the draft file, and exit with code 0.

#### Scenario: An edit write replaces the file byte for byte

- **WHEN** the write tool receives a valid draft `.workspace/edit/sunny.yaml` with the edit flag, and `static/characters/sunny.yaml` exists
- **THEN** `static/characters/sunny.yaml` holds exactly the bytes of the draft
- **AND** the tool exits with code 0

#### Scenario: An edit write with errors changes nothing

- **WHEN** the write tool receives a draft `.workspace/edit/sunny.yaml` with no `name`, with the edit flag
- **THEN** it exits with code 1
- **AND** `static/characters/sunny.yaml` is unchanged

### Requirement: The edit preview lists every change

In edit mode, the preview tool SHALL compare the draft with the saved file and print a *change list* under the heading `Changes:`. The list SHALL have one line for each changed, added, or removed entry, as "Edit preview entries" defines them. Each line SHALL say whether the entry was changed, added, or removed, and SHALL name the block and the entry. A line for a changed entry SHALL show the saved value and the draft value. When nothing differs, the list SHALL say `No changes`.

#### Scenario: A level-up

- **WHEN** the saved file has `level: 7`, and the draft has `level: 8` and no other difference
- **THEN** the change list has one line, saying that `level` changed from 7 to 8

#### Scenario: A new pool and a changed maximum

- **WHEN** the draft adds a pool with id `slots-5`, and raises the pool `wild-shape` from `max: 3` to `max: 4`
- **THEN** the change list says that the pool `slots-5` was added
- **AND** it says that the pool `wild-shape` changed its `max` from 3 to 4

#### Scenario: A removed row

- **WHEN** the draft removes the row titled `Help` from the section `Your Turn`
- **THEN** the change list says that the row `Help` was removed from `Your Turn`

#### Scenario: An unchanged draft

- **WHEN** the draft has the same content as the saved file
- **THEN** the change list says `No changes`

### Requirement: Edit preview entries

The preview tool SHALL match each list entry between the saved file and the draft by a key:
- an `abilities` or `combat` item by its `label`
- a pool by its `id`
- a section by its `title`
- a row, within its section, by its `title`, or by its `body` when it has no title
- a link by its `url`

Entries that share a key in one block SHALL be matched in their order.

#### Scenario: A renamed ability label

- **WHEN** the draft renames the ability label `Wisdom` to `Wits`, with the same value
- **THEN** the change list says that `Wisdom` was removed from `abilities`
- **AND** it says that `Wits` was added to `abilities`

### Requirement: Edit preview fields

The preview tool SHALL compare every field outside those lists, such as `level` or `hitPoints.max`, and every other top-level key, by its key, as one whole value. It SHALL compare values as written in the files, including entries the app would drop.

#### Scenario: A changed hit point maximum

- **WHEN** the saved file has `hitPoints.max` 52 and the draft has 60
- **THEN** the change list says that `hitPoints.max` changed from 52 to 60

#### Scenario: An entry the app would drop is still listed

- **WHEN** the draft adds a link with the URL `http://example.com/map`
- **THEN** the change list says that the link `http://example.com/map` was added
- **AND** the preview warns that the app would drop a `links` entry

#### Scenario: An unknown top-level block

- **WHEN** the draft adds a top-level block named `notes`
- **THEN** the change list says that `notes` was added

### Requirement: The edit preview reports a new order

When the matched entries of a block appear in a different order in the draft than in the saved file, the change list SHALL have one line saying that the block's order changed. For the rows of a matched section, the line SHALL name the section.

#### Scenario: Reordered sections

- **WHEN** the draft swaps the order of the sections `Strengths` and `Your Turn`, and changes nothing else
- **THEN** the change list has one line, saying that the order of `sections` changed

#### Scenario: Reordered rows

- **WHEN** the draft swaps the rows `Attack` and `Cast a Spell` in the section `Your Turn`, and changes nothing else
- **THEN** the change list has one line, saying that the order of rows in `Your Turn` changed

### Requirement: The edit preview warns when pool uses would reset

The app keeps each pool's remaining uses on each device under the pool's id. In edit mode, the preview tool SHALL print a warning for each pool id in the saved file that the draft does not have. The warning SHALL name the pool id. It SHALL say that every device forgets that pool's remaining uses, and that a pool with a new id starts full. A renamed pool id gets this warning for its old id. The warning SHALL NOT block the preview or change its exit code.

#### Scenario: A renamed pool id

- **WHEN** the saved file has a pool with id `wild-shape`, and the draft has the same pool with id `wildshape`
- **THEN** the preview warns that the pool id `wild-shape` is gone, and that its remaining uses reset on every device
- **AND** it exits with code 0

#### Scenario: A removed pool

- **WHEN** the draft removes the pool with id `spell-slots-4`
- **THEN** the preview warns that the pool id `spell-slots-4` is gone, and that its remaining uses reset on every device

#### Scenario: A changed maximum keeps its uses

- **WHEN** the draft changes only the `max` of the pool `wild-shape`
- **THEN** the preview prints no pool reset warning

### Requirement: The edit preview warns when a comment is lost

In edit mode, the preview tool SHALL print a warning for each comment in the saved file that the draft does not have. The warning SHALL quote the comment. A comment counts as kept when the draft has the same comment text, wherever it appears; a comment that appears twice in the saved file needs to appear twice in the draft. The warning SHALL NOT block the preview or change its exit code.

#### Scenario: The avatar provenance line is dropped

- **WHEN** the saved file starts with `# Avatar: Gemini 4 Argon, 2026-10-29. Look: wood elf, auburn hair, leaf circlet, fox kit Pip on shoulder.`, and the draft has no such line
- **THEN** the preview warns that this comment is missing from the draft, and quotes it
- **AND** it exits with code 0

#### Scenario: Every comment is kept

- **WHEN** the draft keeps every comment of the saved file and changes only `level`
- **THEN** the preview prints no lost comment warning

### Requirement: An existing id points to the edit skill

When the preview tool exits with code 3 during the guided skill flow, the skill SHALL tell the Author that a character file with that id already exists. It SHALL say that the `character-edit` skill changes an existing sheet, and that a refresh from D&D Beyond is issue #41. It SHALL then ask the Author for a different id.

These scenarios describe skill behavior. A scripted manual walkthrough of the skill validates them, not an automated test.

#### Scenario: The Author picks an id that is taken

- **WHEN** the Author confirms the id `urven` and the preview tool exits with code 3
- **THEN** the skill names the `character-edit` skill and issue #41
- **AND** it asks the Author for a different id
