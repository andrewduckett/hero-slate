## Purpose

The D&D Beyond ingest helps the Author turn a D&D Beyond character into a new Hero Slate character file. A tool computes the character's facts. An agent writes a simplified sheet from those facts, and the Author approves a preview before anything is written.

## ADDED Requirements

### Requirement: Character reference input

The digest tool SHALL accept a D&D Beyond character reference in any of these forms:
- a character URL such as `https://www.dndbeyond.com/characters/154922980`
- the same URL with a trailing slash, a trailing path segment, or a query string
- a bare numeric character id such as `154922980`

The tool SHALL extract the numeric character id from the reference. It SHALL reject any other input as an unreadable reference, without making a network request.

#### Scenario: A character URL is accepted

- **WHEN** the Author gives `https://www.dndbeyond.com/characters/154922980`
- **THEN** the tool requests character `154922980`

#### Scenario: A bare id is accepted

- **WHEN** the Author gives `154922980`
- **THEN** the tool requests character `154922980`

#### Scenario: An unrelated URL is rejected before any request

- **WHEN** the Author gives `https://example.com/characters/154922980`
- **THEN** the tool reports an unreadable reference
- **AND** it makes no network request

### Requirement: Fetch failures are distinct and actionable

The digest tool SHALL fetch the character from the D&D Beyond character service. It SHALL end every failed run with a distinct non-zero exit code and one line of explanation on standard error. It SHALL write nothing to standard output on failure. The exit codes SHALL be:

| Code | Meaning |
|------|---------|
| 0 | Success |
| 2 | The character is private, or the service refused access |
| 4 | The reference is unreadable, or the character does not exist |
| 5 | A network failure, or a response the tool cannot read |

A private character's message SHALL tell the Author to set the character to Public on D&D Beyond and retry.

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

### Requirement: Digest of character facts

On success, the digest tool SHALL print a JSON digest to standard output and exit with code 0. The digest SHALL contain:
- `name`: the character name exactly as D&D Beyond stores it, including any emoji
- `classes`: each class with its name, its subclass name when present, and its level
- `level`: the sum of all class levels
- `proficiencyBonus`: the bonus for the total level
- `abilities`: the six final ability scores, in the order Strength, Dexterity, Constitution, Intelligence, Wisdom, Charisma
- `armorClass`, `speed`, `initiative`, and `hitPointsMax`

The digest SHALL NOT change the name. It SHALL NOT suggest a palette color or a logical id.

#### Scenario: Urven's digest

- **WHEN** the tool digests the recorded D&D Beyond response for Urven
- **THEN** `name` is `🐻‍❄️ Urven, the Silent Maw`
- **AND** `level` is 6 and `proficiencyBonus` is 3
- **AND** the ability scores are Strength 14, Dexterity 20, Constitution 16, Intelligence 10, Wisdom 14, and Charisma 11
- **AND** `armorClass` is 17, `speed` is 45, `initiative` is 5, and `hitPointsMax` is 54

#### Scenario: A multiclass character

- **WHEN** a character has Monk level 3 and Rogue level 2
- **THEN** `classes` lists both classes with their levels
- **AND** `level` is 5

### Requirement: Final ability scores

The digest SHALL compute each ability score as follows:
- An override score, when D&D Beyond has one, replaces the computed score.
- Otherwise the score is the base score, plus any bonus score, plus every flat bonus that D&D Beyond lists for that ability from species, class, background, feats, and items.
- A "set" effect that raises a score to a fixed value, such as a magic belt, applies only when its value is higher than the computed score.

#### Scenario: Feat bonuses add to the base score

- **WHEN** Dexterity has a base of 17 and two feat bonuses of 1 and 2
- **THEN** the digest reports Dexterity 20

#### Scenario: An override wins

- **WHEN** Strength has a base of 10 and an override of 19
- **THEN** the digest reports Strength 19

#### Scenario: A set effect applies only when higher

- **WHEN** Strength computes to 16 and an equipped item sets Strength to 21
- **THEN** the digest reports Strength 21

### Requirement: Derived combat facts

The digest SHALL compute these facts from the final ability scores:
- `hitPointsMax`: the override, when D&D Beyond has one. Otherwise the base hit points, plus any bonus hit points, plus the Constitution modifier times the total level, plus any flat per-level hit point bonuses times the total level.
- `speed`: the base walking speed, plus flat speed bonuses. The monk Unarmored Movement bonus counts only when the character wears no armor and holds no shield.
- `initiative`: the Dexterity modifier, plus flat initiative bonuses.

#### Scenario: Urven's hit points

- **WHEN** base hit points are 36, Constitution is 16, and the total level is 6
- **THEN** `hitPointsMax` is 54

#### Scenario: Unarmored Movement adds to speed

- **WHEN** a monk with a walking speed of 30 has Unarmored Movement bonuses of 10 and 5 and wears no armor
- **THEN** `speed` is 45

### Requirement: Armor Class covers the common cases

The digest SHALL compute Armor Class from these sources:
- worn armor with its Dexterity cap, or 10 plus the Dexterity modifier when no armor is worn
- an equipped shield
- monk Unarmored Defense (10 plus the Dexterity and Wisdom modifiers, with no armor and no shield)
- barbarian Unarmored Defense (10 plus the Dexterity and Constitution modifiers, with no armor)
- flat Armor Class bonuses from equipped items
- a D&D Beyond Armor Class override, which replaces the computed value

When the character has an Armor Class source outside this list, the digest SHALL report `armorClass` as `null`. It SHALL add a reason that names the unrecognized source. It SHALL NOT report a guessed number.

#### Scenario: Monk Unarmored Defense

- **WHEN** a monk wears no armor and holds no shield, with Dexterity 20 and Wisdom 14
- **THEN** `armorClass` is 17

#### Scenario: Armor with a Dexterity cap and a shield

- **WHEN** a character wears medium armor with base Armor Class 14 and a Dexterity cap of 2, has Dexterity 18, and holds a shield
- **THEN** `armorClass` is 18

#### Scenario: An unrecognized source gives an unknown value

- **WHEN** a character has an Armor Class effect the digest does not recognize
- **THEN** `armorClass` is `null`
- **AND** the digest includes a reason naming that effect

### Requirement: Draft validation

The preview tool SHALL read a drafted character file and check it before it draws anything. These are **errors**:
- The file is not parseable YAML, or its top level is not a mapping.
- The file would fail the character provider's identity checks for `name`, `level`, `class`, or `color`.
- The logical id does not match the provider's id grammar.
- The file sets an `id` that differs from the target logical id.

These are **warnings**:
- `color` on the character, a pool, a section, or a row is not a palette name. The app would fall back to neutral.
- An entry in `abilities`, `combat`, `pools`, or `sections` would be silently dropped by the app.
- `hitPoints.max` is present but is not an integer greater than 0.

The preview tool SHALL list every error and warning. It SHALL exit with a non-zero code when there is at least one error.

#### Scenario: A missing name is an error

- **WHEN** the draft has no `name`
- **THEN** the preview reports an error
- **AND** it exits with a non-zero code

#### Scenario: An unknown color is a warning

- **WHEN** the draft sets `color: purple`
- **THEN** the preview warns that `purple` is not a palette name and will fall back to neutral
- **AND** it still draws the preview

### Requirement: No overwrite of an existing character

The preview tool SHALL stop with exit code 3 when `static/characters/<id>.yaml` already exists for the target logical id. Its message SHALL say that updating an existing sheet is not supported yet. The check SHALL run before the Author is asked to approve anything.

#### Scenario: The target id is taken

- **WHEN** the Author previews a draft for id `urven` and `static/characters/urven.yaml` exists
- **THEN** the tool exits with code 3
- **AND** it draws no preview

### Requirement: The preview shows the draft as the app will render it

The preview tool SHALL draw an ASCII preview of the draft file itself, not of the digest. It SHALL use the same rules the app uses to read each block. It SHALL show every block the app would render: identity, abilities with their modifiers, combat, hit points, pools, and sections. It SHALL NOT show entries the app would drop.

#### Scenario: A computed modifier appears in the preview

- **WHEN** the draft lists Dexterity with value 20
- **THEN** the preview shows Dexterity 20 with modifier +5

#### Scenario: Authored sections appear in the preview

- **WHEN** the draft includes a section titled "Your Turn" with valid rows
- **THEN** the preview shows that section and its rows

### Requirement: Advisory cross-check against the digest

When the Author gives the preview tool a digest, the tool SHALL compare the draft's numbers with the digest's facts. It SHALL compare:
- `level`
- each ability, matched by its label (ignoring case) or a common abbreviation such as `Str` or `STR`
- the combat entries for Armor Class (`Armor Class` or `AC`), speed (`Speed`), and initiative (`Initiative` or `Init`)
- `hitPoints.max`

A combat value written as a signed string, such as `"+5"`, SHALL equal the number 5. For each mismatch, the tool SHALL print a warning with the label, the draft value, and the digest value. The tool SHALL NOT compare the name. It SHALL skip labels it does not recognize and digest facts that are `null`. Mismatches SHALL NOT block the preview or change its exit code.

#### Scenario: Urven's authored sheet matches its digest

- **WHEN** the Author previews `static/characters/urven.yaml`, under a new id, against Urven's digest
- **THEN** the preview reports no cross-check warnings

#### Scenario: A stale number is flagged

- **WHEN** the draft lists Dexterity 18 and the digest says Dexterity 20
- **THEN** the preview warns that the draft shows Dexterity 18 but D&D Beyond says 20
- **AND** it still draws the preview

#### Scenario: A renamed label is skipped

- **WHEN** the draft labels an ability `Quickness`
- **THEN** the preview does not compare that entry

#### Scenario: An unknown Armor Class is skipped

- **WHEN** the digest reports `armorClass` as `null`
- **THEN** the preview does not compare Armor Class

### Requirement: Guided skill flow

The skill SHALL guide the Author from a D&D Beyond reference to a written character file in this order:
1. Ask the Author for the reference, and run the digest.
2. On a digest failure, relay the tool's message, and stop.
3. When a digest fact is `null`, ask the Author for that value, and do not guess it.
4. Draft the character in the workspace directory. The draft covers the name, level, class, color, abilities, combat, and hit points.
5. Propose a logical id, a palette color, and whether to keep the name's emoji. The Author confirms or changes each one.
6. Run the preview with the digest, and show the Author its output, including every warning.
7. Write `static/characters/<id>.yaml` only after the preview shows no errors and the Author approves it.

The skill SHALL write the same file the Author approved. It SHALL run the preview again after any change to the draft. It SHALL NOT overwrite an existing character file.

#### Scenario: The Author changes the color

- **WHEN** the Author asks for `ocean` instead of the proposed color
- **THEN** the skill updates the draft and runs the preview again
- **AND** it asks for approval of the new preview

#### Scenario: No write without approval

- **WHEN** the preview shows no errors but the Author has not approved it
- **THEN** the skill writes nothing to `static/characters/`

#### Scenario: A private character stops the flow

- **WHEN** the digest exits with code 2
- **THEN** the skill tells the Author to set the character to Public and retry
- **AND** it drafts nothing
