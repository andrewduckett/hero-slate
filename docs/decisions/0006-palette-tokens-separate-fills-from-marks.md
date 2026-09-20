# 0006. Palette tokens separate fills from marks

- Status: accepted
- Date: 2026-09-20
- Supersedes: none
- Superseded by: none

## Context

The app renders character sheets for a child to read at a table. A config author
picks a character's colour by name, never by raw hex value. The app defines a small,
fixed set of palette names, and each name carries values for both light and dark
mode. Every pairing of text against its background must meet the WCAG AA contrast
ratio of 4.5:1, and automated tests compute those ratios from the emitted stylesheet.

A palette name originally defined two colours: an `accent`, and an `onAccent` for
text drawn on the accent.

That pair has to serve two different jobs, and they pull in opposite directions.

- **A fill** wants a colour with presence. The eye should read it as a block of
  colour. A mid-tone works well.
- **A mark** — text, an icon, a border — must contrast strongly against the page and
  against a card. It has to be dark in light mode and light in dark mode.

One value cannot do both. A mid-tone gold reads beautifully as a fill under dark
text, at roughly 6.7:1. The same gold as text on a white card measures about 2.0:1,
which fails.

Faced with that conflict, a single-token palette always resolves it the same way: it
darkens the accent until it works as text. The colour survives; the hue does not. In
this project a palette named `sun` had become a brown, and one named `berry` a
magenta. The names no longer described what a reader saw.

The shortage has a second cost. With only a fill and its text colour available,
every use of colour is all or nothing. A soft background wash, a hairline rule, or a
quiet tinted panel cannot be expressed at all, so a design reaches for solid fills
everywhere and the page flattens into a single hue.

## Decision

A palette name defines four colours, each with a light and a dark value:

- `accent` — a solid fill.
- `onAccent` — text or icons drawn on that fill.
- `tint` — a soft background wash.
- `deep` — the family colour drawn as text, as an icon, or as a border.

The contrast rules follow the split. The `accent` only has to pair with its own
`onAccent`. The `deep` carries the readable-as-text rule against the page, against a
card, and against its own tint. A name may give `deep` and `accent` the same value
when one value already satisfies every rule for both.

Two consequences of that split are deliberate. An accent is no longer required to be
readable as text, which is what lets a palette hold a mid-tone hue. And `onAccent`
varies per name, rather than being white everywhere, so a light fill can carry dark
text.

We considered three alternatives.

**Keep two tokens and blend at run time.** Derive a wash in the browser by mixing the
accent with the background, using a CSS colour-mixing function. Rejected: the contrast
tests cannot read a blended colour back from the stylesheet, so they cannot check the
value the browser actually paints. This project holds the rule that no blended colour
sits behind text.

**Keep two tokens and derive the rest at build time.** A generator already turns the
palette module into a stylesheet. It could compute each `tint` and `deep` from the
`accent` by a fixed formula and emit plain hex, which the contrast tests would read
normally. This answers the testing objection above, so it deserves its own answer.

Rejected, because a formula cannot hold a hue steady across the set. Lightening a
saturated green toward a wash drifts it grey, and the wash this project wants is the
reference page's `#cfe3bf` — a warmer, yellower green than any mechanical lightening
of `#2f5d3a` produces. The same applies to `deep`: gold needs a large, hand-judged
darkening to stay gold rather than turning brown, while a dark green needs none at
all. A formula tuned to satisfy the worst case would flatten the rest.

We accept the cost this imposes: every value is hand-tuned, and a name added later
needs four values rather than two. Should the palette ever grow past a handful of
names, generating a first draft from a formula and hand-correcting it is the obvious
next step, and nothing in this decision blocks that.

**Define a full ramp per name.** Give each name four or more steps, from darkest to
palest, as a conventional design system does. Rejected as more than this product
needs. A ramp multiplies the values to hand-tune and contrast-check, and the extra
steps would go unused.

**Add a second palette set for washes.** Keep the original pair and introduce
separate "soft" names alongside it. Rejected because it splits one concept across two
lookups. An author choosing `forest` should get the whole forest family, not a name
they must remember to pair with another.

## Consequences

Palette names describe their colours again, because a name is no longer forced dark
to survive a text-contrast rule. A design can express a wash, a rule, and a quiet
tinted panel, so colour need not arrive only as a solid block.

The cost lands in three places.

The palette roughly doubles in size, from four values per name to eight. Every added
value needs hand-tuning and a contrast check.

The tightest new rule pairs `deep` against its own `tint`. It squeezes from both
sides: the tint must stay pale enough to carry plain body text, and the deep must
stay dark enough to sit on that tint. Some values will need adjusting before they
pass.

Every component must now choose the right token rather than reaching for the only one
available. Drawing text or a border in `accent` will usually still render something
visible, so the mistake is quiet. The contrast tests check the palette's values, not
each component's usage, so this rule is carried by review rather than by a test.

We accept that a name may set `deep` equal to `accent`. It looks redundant when read
in isolation, and a later reader may be tempted to collapse the two back into one.
That is the change this record exists to prevent.
