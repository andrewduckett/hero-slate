## Why

Hero Slate's two freeform sections, "Your Turn" and "Strengths", carry the product's idea: short prompts instead of a menu of rules. Today the Author writes both sections by hand, and the numbers in their pills drift. Urven's sheet shows Insight `[[+6]]`, but his Wisdom and proficiency give +5. This change extends the D&D Beyond ingest (discovery story 18) so that every pill number comes from tested code. The agent then recommends a few rows, and the Author decides what goes on the sheet.

## What Changes

- The digest tool reports two new kinds of fact:
  - **Skills**: all 18 skills, each with its ability, its proficiency level (none, half, proficient, or expertise), and its final bonus.
  - **Actions**: the character's class, species, background, and feat actions, plus its equipped weapons. Each action carries its to-hit bonus, its damage, and its save DC, where it has one.
- The digest tool reports a number as unknown, with a reason, when it cannot prove it. Examples are a Monk's martial-arts damage die, a weapon under a rule the digest does not recognize, and a DC with no ability named.
- The skill runs a short interview for each section. It recommends a few rows, gives a reason for each, and lets the Author keep, cut, swap, or add rows. It never lists every action or skill as a checklist.
- **Your Turn**: the skill recommends 3 to 5 rows. These are the main attack, one signature feature, and one short "cool move" prompt. A row whose number is unknown becomes prose with no pill. The Author may type a number in later.
- **Strengths**: the skill recommends proficient skills. It groups skills that share both an ability and a final bonus into one row, such as "flips and sneaking `[[+8]]`". The grouping teaches the player that similar skills share a number.
- The skill suggests an emoji, a short plain-words gloss, and a palette color for each section. The Author confirms or changes them.
- Every pill number is copied character for character from the digest, or left out. The agent never computes a number.
- The preview tool draws `sections`: each section's title and color, and each row's title and body, with the pills as written. It stops listing `sections` under "Not previewed".
- The draft validation warns when the app would drop a section or row, and when a section or row color is not a palette name.
- Out of scope: spell sections (story 19), a cross-check of pill numbers against the digest (story 20), and interactive dice rolling.

## Capabilities

### New Capabilities

<!-- None. Sections extend the existing ingest capability. -->

### Modified Capabilities

- `dndbeyond-ingest`: the digest adds skills and actions. The draft validation and preview cover `sections`. The guided skill flow adds the Your Turn and Strengths interview.

## Impact

- **Changed code** in `src/lib/ingest/ddb/`:
  - the digest, for skills and actions, in new focused modules
  - the draft validation and preview, for sections
- **Changed skill:** `.claude/skills/dndbeyond-to-slate/SKILL.md` adds the interview step and drops the "no sections" limit.
- **Unchanged app:** the section renderer, the rich-text pills, and the palette stay as they are. The preview reuses the app's section resolver.
- **Tests:** acceptance tests check the skill and action facts for the existing Urven and Zip fixtures. No new fixture is needed.
- **No pill cross-check:** the preview shows every pill in context for the Author to review. Story 20 owns drift detection.
- **Build:** no route imports `src/lib/ingest/`, so the deployed app is unchanged.
- **Docs:** the story-18 entry in `discovery.md` gets its change link.
