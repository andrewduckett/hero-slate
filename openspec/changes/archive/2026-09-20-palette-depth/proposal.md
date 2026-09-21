## Why

Each palette name defines only two colors: an accent and the text drawn on it. Two
tokens can express one move — fill a shape solidly. They cannot express a soft
background wash, a colored hairline, or a colored heading on a card.

That limit has three visible costs.

First, the sheet reads as one hue. The character's accent paints the header, the
ability numbers, the combat tiles, the hit points readout, the bar, and all four
adjustment buttons. Colour marks *whose* sheet this is, never *what* a thing is.

Second, two spec rules force each accent to be dark. Every light-mode on-accent is
white, and the `Accent text is readable on the raised surface` requirement makes the
accent double as a text colour. A mid-tone hue fails both. So `sun` is `#8a5a12`, a
brown, and `berry` is `#a83278`, a magenta. The palette names no longer describe
their colours.

Third, styles that need a soft fill have none. A pool dot can only be a solid disc or
an empty ring, because no soft fill exists between them.

The bespoke sheet this app replaces gives every accent a soft companion
(`--sage`, `--berry-soft`, `--sun-soft`, `--sky-soft`) and assigns colour by
meaning. Its look comes from that depth.

## What Changes

- **BREAKING** Each palette name defines four colours, not two: `accent` (a solid
  fill), `onAccent` (text on that fill), `tint` (a soft background wash), and `deep`
  (the family colour used as text or as a border). Each gains a light and a dark
  value.
- Move the "readable as text" rule from `accent` to `deep`. An accent then only has
  to carry its own on-accent, so a palette may hold a mid-tone hue.
- Let each light-mode `onAccent` vary per palette instead of always being white.
- Retune `sun` and `berry` so each name matches the colour a reader expects.
- Assign fixed colour roles to hit points, armour class, speed, and initiative. Each
  role keeps its colour on every character's sheet. The character's own colour then
  themes the identity header and the ability tiles only.
- Add one warm structural colour to the shared base set, for tile borders and labels.
- Warm the raised surface so it stops reading as pure white against the warm page.
- Apply the new tokens across the sheet: soft-filled pool dots in a `deep` ring,
  bordered tiles, and tinted section rows.
- Extend the contrast tests to cover every new pairing, read from the emitted
  stylesheet as the existing tests are.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `theming`: each palette name defines four colours instead of two. The
  readable-as-text rule moves from `accent` to `deep`. New contrast rules cover
  `tint` and `deep`. Fixed colour roles are added for hit points, armour class,
  speed, and initiative, which narrows where the character's colour applies.

## Impact

- `src/lib/theme/palette.ts` — the `Palette` and `Base` shapes gain fields; six
  palettes gain values.
- `src/lib/theme/generate.ts` — emits the new custom properties in both modes.
- `src/lib/theme/palette.css` — regenerated; never hand-edited.
- `src/lib/theme/palette.test.ts`, `emitted-css.test.ts` — new contrast assertions.
- `src/lib/CharacterView.svelte`, `src/lib/character/*Block.svelte`,
  `src/lib/richtext/RichText.svelte` — consume the new tokens.
- No change to the data provider, the state store, the YAML format, or any
  character file. Authors still pick a colour by name.
