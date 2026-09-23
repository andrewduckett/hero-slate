## Why

Writing a character's YAML by hand is the Author's heaviest step, and every level-up makes the sheet go stale. Hero Slate needs a simplified sheet, not a copy of D&D Beyond: the Author reflavours, renames, picks a few actions, and writes kid-friendly prose. The arithmetic behind the numbers is where mistakes creep in. Urven's hand-written sheet already disagrees with D&D Beyond on Ki max and Insight. This change is the walking skeleton for the D&D Beyond ingest epic (discovery story 16). It builds the thinnest end-to-end path that stories 17–20 will extend.

## What Changes

- A new project-level agent skill, `.claude/skills/dndbeyond-to-slate/`, guides the Author from a character reference to a new `static/characters/<id>.yaml`. A character reference is a D&D Beyond character URL or its numeric id.
- The work is split by kind:
  - **A script computes facts.** It fetches the character JSON and returns a small digest of final values.
  - **The agent writes the sheet.** It drafts the YAML using its own judgement, with the digest as its source for numbers.
- The `digest` command fetches the character from the D&D Beyond character service and computes the story-16 facts:
  - the name, exactly as D&D Beyond stores it, emoji included
  - each class and its level, and the total level
  - the six final ability scores, including feat and species bonuses and any overrides
  - Armor Class, walking speed, initiative, proficiency bonus, and maximum hit points
- The digest covers the common Armor Class cases: armor with its DEX cap, shields, monk and barbarian unarmored defense, flat item bonuses, and D&D Beyond overrides. For any other source it reports the value as unknown and gives the reason, and does not guess. The skill then asks the Author for the number.
- The `digest` command reports each failure with a distinct exit code and a one-line message:
  - a private character: the message tells the Author to make it public and retry
  - a character that does not exist, or an unreadable character reference
  - a network failure or an unexpected response shape
- The agent drafts the YAML in `.workspace/`. It chooses the id, the palette `color`, and whether to keep the name's emoji, and the Author confirms each choice. The script does not pick colors or strip emoji.
- The `preview` command reads the draft and:
  - validates the draft against the character schema, the palette names, and the id grammar
  - stops if `static/characters/<id>.yaml` already exists, and points the Author to story 20 (update in place)
  - draws an ASCII preview of the draft itself, so what the Author approves is what gets written
  - draws only the story-16 blocks, and lists any other block in the draft as not previewed
  - warns, without blocking, when a draft number disagrees with the digest (level, ability scores, Armor Class, speed, initiative, maximum hit points); it matches entries by label and its common aliases, and skips a label it does not recognize
- After the Author approves the preview, the `write` command saves the draft to `static/characters/<id>.yaml`. It runs every check again, copies the draft byte for byte, and never overwrites an existing file. The skill saves character files only through this command.
- `src/lib/data/yaml.ts` exports `ID_GRAMMAR` and its identity check, so the ingest code uses the provider's rules and does not copy them.
- Out of scope: pools and spell slots (story 17), Your Turn and skills (story 18), and spells (story 19).
- Also out of scope: updating an existing sheet (story 20), and access to private characters.

## Capabilities

### New Capabilities

- `dndbeyond-ingest`: fetching a D&D Beyond character, computing its digest of facts, validating and previewing a drafted sheet, warning when the draft's numbers disagree with the digest, refusing to overwrite an existing character, and the skill's guided flow from URL to written file.

### Modified Capabilities

<!-- None. Exporting ID_GRAMMAR does not change any character-data requirement. -->

## Impact

- **New code:**
  - `src/lib/ingest/ddb/`: pure, tested modules for the reference parser, the fetch, the digest, draft validation, the cross-check, and the ASCII preview
  - `src/lib/ingest/ddb/cli.ts`: a thin command-line entry with `digest`, `preview`, and `write` commands, run with `vite-node` so it can load the app's resolvers (see `design.md`, D2 and D3)
  - `.claude/skills/dndbeyond-to-slate/SKILL.md`: the skill itself
- **Changed code:** `src/lib/data/yaml.ts` exports `ID_GRAMMAR` and its identity check. Its behavior is unchanged.
- **Dependencies:** `vite-node` becomes an explicit dev dependency. It is already installed as part of Vitest.
- **Tests:** a fixture of Urven's full D&D Beyond JSON (about 325 KB, a public character) under `src/lib/ingest/ddb/fixtures/`. The acceptance test: `preview` of `static/characters/urven.yaml` against that fixture gives no warnings for the story-16 fields.
- **Build:** no route imports `src/lib/ingest/`, so none of it enters the static bundle. The deployed app is unchanged.
- **External dependency:** the unofficial D&D Beyond character service (`character-service.dndbeyond.com/character/v5/character/{id}`). If D&D Beyond changes its shape, the fixture tests still pass, but live digests may start failing with the unexpected-shape error.
- **Docs:** this resolves two open questions in `discovery.md` for the ingest epic: where the skill lives, and the D&D Beyond JSON shape. The story-16 entry gets its change link.
