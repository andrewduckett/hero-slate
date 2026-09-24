## Why

Spells are the largest block of a spellcaster's D&D Beyond data that the ingest does not yet read (discovery story 19). A level 6 Druid like Sunny has 13 class spells, plus spells from her species and subclass. A child cannot use a list that long. Sunny's hand-written sheet shows the fix: a few choices with numbers and a few with none, "so it's easy to use your imagination". That sheet also shows the drift risk. Its spell attack says `d20+6`, but her Wisdom and proficiency give +7.

This change lets the Author build that sheet from D&D Beyond. Every spell number comes from tested code, and the agent and Author choose the spells.

## What Changes

- The digest reports **spells**. It lists every spell in the character's class spell lists and in the `class`, `race`, and `feat` groups of `spells`. It lists each spell once, by name, with each way the character can cast it. Each way carries:
  - where it comes from, and a readiness status: `cantrip`, `always`, `granted`, `prepared`, or `not-prepared`
  - whether it uses a spell slot, and any limited uses with their reset
  - its casting ability, and its to-hit, damage, healing, and save DC
- A cantrip's damage uses the step for the character's level, such as `2d6` for Thorn Whip at level 6. A leveled spell's damage is its damage at its own level. The digest never computes upcast damage.
- The digest reports a number as unknown, with a reason, when it cannot prove it. Examples are a spell with two damage entries, and a casting ability the digest cannot link to one class.
- The digest reports **spellcasting**: for each spellcasting class, its casting ability, its spell attack, and its spell save DC.
- The skill builds a **two-tier sheet** for a spellcaster:
  - **Your Turn** gains a "Cast a Spell" row with the caster's spell attack and DC.
  - A new **Magic** section follows Your Turn. The skill recommends one spell with a save DC, one with an attack, and 2 or 3 flavor spells with no pills, each with a reason.
- The Author keeps, cuts, swaps, or adds Magic rows, and may ask for any digest spell by name, prepared or not.
- The skill proposes the section order Your Turn, Magic, Strengths, and a color for Magic. The Author confirms or changes both.
- The skill writes healing as a dice pill, such as `[[2d8+4]]`, copied from the digest like every other pill.
- A character with no spellcasting class gets no "Cast a Spell" row and no Magic section by default. The skill still tells the Author about any granted spells.
- Sunny's D&D Beyond response becomes a third recorded fixture, with its personal fields blanked. A test keeps every recorded fixture free of personal fields.
- Out of scope: item spells, upcast damage, spell descriptions, a cross-check of pill numbers, and interactive dice rolling.

## Capabilities

### New Capabilities

<!-- None. Spells extend the existing ingest capability. -->

### Modified Capabilities

- `dndbeyond-ingest`: the digest adds spell facts and a per-class spellcasting summary. It reads class spell lists and each class's casting ability as optional fields. The guided skill flow adds the "Cast a Spell" row, the Magic section, and the healing pill. A new requirement keeps recorded fixtures free of personal data.

## Impact

- **Changed code** in `src/lib/ingest/ddb/`:
  - the digest, which reads class spell lists and each class's id and casting ability
  - a new focused spells module, beside `actions.ts` and `skills.ts`
- **New fixture:** `src/lib/ingest/ddb/fixtures/sunny.json`, blanked before it is committed.
- **New tooling:** a small checked-in script blanks personal fields in a recorded response. A test checks every fixture.
- **Changed skill:** `.claude/skills/dndbeyond-to-slate/SKILL.md` adds the "Cast a Spell" row, the Magic step, and the healing pill, and drops the "no spells" limit.
- **Unchanged app:** the section renderer, the rich-text pills, the preview, and the validation already handle a Magic section. No route imports the ingest, so the deployed app is unchanged.
- **Docs:** a new ADR records that recorded fixtures carry no personal data.
