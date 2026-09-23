# 0009. Ingest: tools compute the facts, the agent writes the sheet

- Status: accepted
- Date: 2026-09-23
- Supersedes: none
- Superseded by: none

## Context

Hero Slate shows a child player a short, simplified character sheet. A parent, the Author, writes each sheet by hand as a YAML file. Most characters already exist on D&D Beyond, a popular online character builder. We want an agent skill that turns a D&D Beyond character into a Hero Slate sheet.

A Hero Slate sheet is an adaptation of a D&D Beyond character, not a copy. Take the sheet for Urven, a level-6 monk. The Author:
- kept 4 of D&D Beyond's 14 actions
- recast the monk's unarmed strike as "swipe with your claws" to fit the character's species
- renamed "Stealth" to "Sneaking" and "Focus Points" to "Ki"
- wrote short, kid-friendly glosses and added emoji
- chose every color

No mapping table produces those choices. They take judgement about the character and about the child who will play it.

The numbers on the sheet are a different kind of work. D&D Beyond stores few of the final values. A final Dexterity score is a base value plus bonuses from feats, species, and items. Armor Class depends on armor, shields, class features, and item bonuses. Maximum hit points depend on the base, the Constitution modifier, the level, and per-level bonuses. The raw response for one character is about 325 KB of JSON. This arithmetic is where errors creep in. Urven's hand-written sheet already disagrees with D&D Beyond on two numbers.

An agent is good at judgement and unreliable at repeated arithmetic over large inputs. Tested code is the reverse.

## Decision

We split the ingest by the kind of work, and put a checked boundary between the two parts.

- **Tested tools compute the facts.** A digest tool fetches the character and reduces it to a small set of final values: ability scores, Armor Class, speed, initiative, maximum hit points, and levels. When the tool meets an input it does not understand, it reports the value as unknown. It never guesses.
- **The agent writes the sheet.** It drafts the YAML using its own judgement, and takes its numbers from the digest. It decides what to include, what to rename, how to phrase things, and which colors to suggest. The Author confirms those choices.
- **A preview tool checks the draft before the write tool saves anything.** It reads the draft with the app's own rules, and draws the sheet as the app will show it. It warns when a draft number disagrees with the digest. The warnings are advisory, because the Author may change a number on purpose.
- **A write tool saves the approved draft.** It runs the same checks again, copies the draft exactly, and never overwrites an existing character. The agent never writes a character file itself.

We considered two alternatives.

**The tool writes the whole sheet.** A deterministic mapper would turn D&D Beyond data straight into YAML, and the agent would only confirm choices. We rejected it because it produces a copy, and a copy is what the product exists to avoid. Every editorial choice would need a new flag or rule.

**The agent reads the raw data and does everything.** This is the simplest to build: one prompt, no code. We rejected it because we cannot test the agent's arithmetic, errors would differ from run to run, and the raw JSON crowds out the agent's working context.

## Consequences

- Each number on a new sheet traces back to tested code, or to a value the Author typed in because the tool reported it unknown.
- The agent is free to reword, reflavour, and select, and the preview catches numeric drift the Author did not intend.
- Later features extend the same shape. New trackers and sections add facts to the digest and checks to the preview. Keeping a sheet up to date after a level-up reuses the same comparison between the sheet and the digest.
- The digest follows an unofficial D&D Beyond data format. If that format changes, the digest fails loudly rather than producing wrong numbers. We accept that live runs can break until the mapping is updated.
- The tools guarantee that every saved file passes the checks and is exactly the draft. They cannot prove that the Author approved it. That step depends on the skill following its instructions, which we accept for an authoring tool used by one person.
- The ingest writes the character file directly, because it is an authoring tool, like a text editor. It is not a sheet consumer, so it does not go through the character-data interface that screens use. If character storage moves to a hosted database, only the write tool must change. The digest, the draft, and the preview stay as they are.
