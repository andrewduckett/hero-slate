# 0007. Colour marks meaning, not identity

- Status: accepted
- Date: 2026-09-20
- Supersedes: none
- Superseded by: none

## Context

Each character in this app carries a colour, chosen by name in a config file that a
parent edits by hand. A druid is `forest`, a monk is `neutral`. The colour is part of
how a child recognises their own sheet.

The sheet renders several kinds of block: an identity header, ability scores, combat
metrics such as armour class and speed, a hit points tracker, resource pools, and
freeform prompt sections.

Until now one rule governed all of them. The character's colour flowed down the whole
sheet, and every block that showed any colour showed that one. A forest character's
page was green: green header, green ability numbers, green metric tiles, green tracker,
green buttons. Pools and prompt sections were the exception, because a config author
colours those individually.

That rule is simple to state and simple to implement. It also has a cost that grows
with the sheet. When one hue paints every block, colour stops distinguishing anything.
A reader cannot tell the hit points tracker from the armour class tile by colour,
because both are the same green. Colour is the strongest signal a page has, and the
sheet was spending all of it on a fact the reader already knows: whose sheet this is.

The sheet this app replaces did the opposite. It painted health red, armour blue, speed
green and initiative gold, on every character's page, and reserved the character's own
colour for the header and the prompt sections. Four adjacent tiles in four colours.

There is a real tension here. A child's attachment to "my colour" is not nothing, and a
sheet that ignores it loses something.

## Decision

Colour marks what a block is, not whose sheet it is.

Four blocks take a fixed colour role: hit points, armour class, speed and initiative.
Each role resolves to one palette name, the same for every character. Health is red
regardless of whether the character is a forest druid.

The character's own colour keeps the identity header and the ability tiles. Those are
the blocks that answer "who am I", so identity is the right thing for them to carry.
Pools and prompt sections keep their authored colours, as before.

We considered three alternatives.

**Keep the character colour everywhere.** The status quo. Rejected because it is the
defect: a single hue across a page carries no information, and the sheet had no way to
distinguish blocks by colour at all.

**Let a config author colour each block.** Add fields so a parent could paint the
tracker or the metric tiles. Rejected for now. It hands the author a way to make the
sheet unreadable, and it solves a problem nobody has reported. The spec for this change
therefore describes only what the app does today — it ignores such a field — rather
than promising never to add one.

**Give the roles their own colours, outside the palette set.** Rejected because reusing
palette names means the roles inherit every contrast rule already enforced, and add no
new values to hand-tune. That reuse has a cost, recorded below.

## Consequences

Colour now distinguishes blocks. Four adjacent metric tiles read as four things rather
than one. A reader locates the tracker by colour before reading a word, which matters
for an operator who is nine and mid-turn.

A character's colour means less than it did. A forest druid's hit points card is red.
We accept that trade: "health is red" is a convention a child already knows from games
and from life, and it is a stronger cue than a theme colour. The header and the ability
tiles still carry the character's colour, so the sheet is still recognisably theirs.

Roles borrow palette names, which couples two things that have no reason to stay
aligned. Warming `fire` because the `fire` character theme should read more like fire
would turn every character's tracker orange, on every sheet. Nobody editing a palette
would expect that. The escape hatch is to give the roles their own token
set, which changes no part of the palette contract. Until someone does that, a palette
edit is also a role edit.

The mapping itself is one table and trivial to edit. That is exactly why this record
exists. An engineer who finds the table, sees how cheap it looks, and points it back at
the character's colour will have undone the decision without meeting it. The cost of
the change is not the measure of its importance.
