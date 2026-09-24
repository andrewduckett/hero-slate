# 0010. Recorded fixtures carry no personal data

- Status: accepted
- Date: 2026-09-23
- Supersedes: none
- Superseded by: none

## Context

Hero Slate includes an authoring tool that reads a character from D&D Beyond, a popular online character builder. The tool fetches a public character as JSON and computes the numbers for a Hero Slate sheet. Its tests run against *recorded fixtures*: real D&D Beyond responses saved as files in the repository.

A real response holds more than the character. It names the account that owns it, by username and user id. It links that account's chosen avatar, frame, and backdrop images. When the character is in a campaign, it also lists the campaign's name, its description, the game master's username, and every other player's username, character name, and avatar. It has room for the player's free-text notes, such as a backstory, and a physical description, such as age and height.

This repository is public. The first two fixtures went in with all of those fields intact. One of them named six other players who never agreed to appear in a public code repository. Removing that data took a history rewrite on the main branch. Copies still remained where a rewrite cannot reach, such as pull request references on GitHub.

The tests do not need any of this data. The tool reads a character's classes, abilities, modifiers, actions, spells, and inventory. It never reads the owner, the decorations, the campaign, the notes, or the description.

## Decision

We blank every recorded D&D Beyond response before we commit it. The blanking makes these changes:
- The owner's username becomes an empty string, and the user id becomes 0.
- The campaign becomes empty.
- Every avatar, frame, and backdrop field becomes empty. The display theme colour stays, because it identifies no one.
- Every free-text note and every physical-description field becomes empty.

The character's name and custom items stay. They are fictional game content, and the tests read them.

A checked-in script does the blanking, so each new fixture gets the same treatment. A test checks every fixture on each run, and fails when any of these fields is still set.

We considered three alternatives.

**Keep raw fixtures.** This is the simplest path, and the data is already public on D&D Beyond. We rejected it. A public character page shows one player's choices in context. A repository copy moves other people's data somewhere they did not choose, where it outlives any later change to their privacy settings.

**Write fixtures by hand.** Small, invented inputs carry no personal data at all. We rejected them as the only fixtures. The value of a recorded response is that it shows D&D Beyond's real shape, including fields we did not expect. Hand-written inputs still serve the unit tests.

**Blank only the fields a reviewer notices.** We rejected this. The first fixtures show how easily a campaign roster slips past review. A test catches what a reviewer misses.

## Consequences

- A new fixture takes one extra step: run the blanking script before committing.
- If someone commits a raw response, a test fails loudly. The failure stops the mistake before the pull request merges.
- A fixture no longer matches D&D Beyond byte for byte. Its personal fields differ, and the script's JSON output may escape some characters differently. The character data itself is unchanged.
- If D&D Beyond adds a new personal field, the blanking script and the test will not know about it. Whoever records a new fixture should check its top-level fields for anything that names a person.
