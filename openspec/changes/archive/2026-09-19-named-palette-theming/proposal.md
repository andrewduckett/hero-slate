## Why

The walking skeleton renders a character's identity with no styling at all. It ships no colors, no dark mode, and `sunny.yaml` has no `color` field. From the next story onward, config references color names, so the palette must exist first.

We build theming now for two reasons. A child must be able to read the sheet in whatever light the room has, so it must follow the device between light and dark. And later stories — custom sections, the picker — assume a character has a palette color to render in.

## What Changes

- Add a named palette: a fixed set of color names (`forest`, `fire`, `ocean`, `berry`, `sun`) plus a `neutral` default. Each name defines an accent and an on-accent color.
- Give each color a light-mode and a dark-mode value. A test checks that every accent and on-accent pair meets WCAG AA contrast in both modes.
- Add a shared base surface and foreground color, each with a light and a dark value, for the page background and body text. A test checks their contrast too.
- Follow the device's light or dark preference automatically, with no toggle. The page background, body text, and header all switch modes, even while the sheet stays open.
- Apply a character's `color` to the identity header. The header shows the accent as its background and the on-accent as its text.
- Fall back to `neutral` when a character omits `color` or names a value that is not a palette name, including a raw hex string. An unknown color never breaks a sheet.
- Add `color` to the character definition as an optional string, validated at the provider and resolved by the theming layer.

Out of scope: per-row and per-section colors (story 6), a user-facing light/dark toggle, and raw hex colors in config.

## Capabilities

### New Capabilities

- `theming`: A fixed named palette of accent colors, each with a light and a dark value tuned for readable contrast. The sheet follows the device's light or dark mode. A character's `color` name themes the header, and any unknown or missing name falls back to a neutral default.

### Modified Capabilities

- `character-data`: Make `color` part of the validated identity contract. The provider accepts `color` only as a string and carries it through unresolved. This changes the `Definition validation` and `Character schema shape` requirements, which today validate only name, level, and class.

## Impact

- New theme layer: `src/lib/theme/palette.ts` holds every name with its four accent values plus the shared surface and foreground pair, and a build step generates `src/lib/theme/palette.css` from it.
- New root layout `src/routes/+layout.svelte` imports the generated stylesheet, so tokens apply site-wide.
- Modified `src/lib/CharacterView.svelte`: resolve the character's `color` and apply the palette to the identity header.
- Modified `src/lib/types.ts` and the data provider's validation: add the optional `color` string field.
- Modified `static/characters/sunny.yaml`: add `color: forest` as the worked example.
- New tests: a resolver table test and a contrast test over the palette.
