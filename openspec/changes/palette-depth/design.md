## Context

See `proposal.md` for why this change exists. The requirements are in the delta spec
under `specs/theming/`.

Two repo constraints shape the approach:

- `src/lib/theme/palette.ts` is the only place a color value lives. `generate.ts`
  writes `palette.css` from it, and nobody edits that file by hand.
- The contrast tests read the **emitted** stylesheet, not the TypeScript module. A
  tested value is therefore the painted value.

The reference for this work is the bespoke sheet the app replaces
(`static.home.duckett.fun/sunny/`). Its stylesheet gives every accent a soft
companion — `--sage`, `--berry-soft`, `--sun-soft`, `--sky-soft` — and assigns color
by meaning: health is red, armor is blue, speed is green, initiative is gold.

## Goals / Non-Goals

**Goals:**

- Give each palette enough tokens to express a fill, a wash, and a readable mark.
- Let a palette name describe its actual color again.
- Break the single-hue page by giving fixed roles their own colors.
- Keep every pairing checkable from the emitted stylesheet.

**Non-Goals:**

- A light/dark toggle, or a change to the default mode. That is its own story.
- Any change to page width or block layout. That is its own story.
- New character data fields. Authors keep picking a color by name.
- A full per-palette ramp of four or more steps. Four tokens is the budget.
- Motion design.

## Decisions

### D1. Four tokens per palette, not a ramp

Each name defines `accent`, `onAccent`, `tint`, and `deep`.

```
              USE                          EXAMPLE FROM THE REFERENCE
accent        solid fill                   --sun    #e9a23b
onAccent      text drawn on that fill      (dark ink on gold)
tint          soft background wash         --sun-soft #fdeccf
deep          text, icon, or border        #9a6312
```

`deep` must exist separately from `accent`. The reference proves why: it draws gold
fills in `#e9a23b` but gold *text* in `#9a6312`, because `#e9a23b` as text fails
every background. One value cannot do both jobs.

Alternative considered: a four-step ramp per name, as the reference has for green
(`forest`/`moss`/`leaf`/`sage`). Rejected. The reference never uses `--leaf`, so even
there the fourth step is dead. A ramp would also cost 6 names x 6 values x 2 modes.

Alternative considered: keep two tokens and express depth with `color-mix()`.
Rejected. A blended color cannot be read back from the stylesheet, so the contrast
test could not check what the browser paints. The `sheet-restyle` design already
ruled out blended colors behind text for this reason.

### D2. Lift the "accent is readable as text" rule

The delta spec removes that requirement and gives the 4.5:1 text rule to `deep`.

This is the unlock. Today two rules squeeze every accent dark at once: the removed
rule, and a light-mode `onAccent` fixed at `#ffffff` for all six names. Together they
turned `sun` into `#8a5a12`, a brown. Gold `#e9a23b` measures about **2.2:1** against
white and about **6.7:1** against a dark ink. It was never unusable — it was unusable
*under white text*.

So `onAccent` varies per name from now on. `sun` pairs gold with a dark ink. `forest`
keeps white.

### D3. Starting values

All values below are a starting point. The contrast tests gate the final set, exactly
as they did in `sheet-restyle`.

Light mode:

```
name      accent    onAccent   tint      deep
forest    #2f5d3a   #ffffff    #cfe3bf   #2f5d3a   (deep = accent)
fire      #c0392b   #ffffff    #fbe2df   #a8342e
ocean     #2d79a6   #ffffff    #d8e9f1   #1f5d80
berry     #b5356a   #ffffff    #f8dcea   #8e2953
sun       #e9a23b   #3a2905    #f5e5c9   #7d5010
neutral   #4a4a42   #ffffff    #e8e3d6   #4a4a42   (deep = accent)
```

Dark mode keeps the current pastel accents, and `deep` equals `accent` for every name,
because a pastel already reads on a near-black surface. A dark-mode `tint` sits
*lighter* than the raised surface, not darker. Darkening it far enough to clear the
separation floor pushes it below the page background, where a tinted panel reads as a
hole rather than a highlight:

```
name      accent    onAccent   tint      deep
forest    #7fd8a0   #06301a    #2c4636   #7fd8a0   (deep = accent)
fire      #ff9f8a   #3a0d06    #4a2f2a   #ff9f8a   (deep = accent)
ocean     #8fc4ff   #062146    #2b3c4f   #8fc4ff   (deep = accent)
berry     #f0a6d0   #3d0a29    #46303e   #f0a6d0   (deep = accent)
sun       #ffd86b   #3a2905    #453a24   #ffd86b   (deep = accent)
neutral   #c9d1d9   #14171a    #383d42   #c9d1d9   (deep = accent)
```

The author computed every pair above against every rule in the delta spec, in both
modes, and a cross-model reviewer re-derived them independently. All pass. The tightest results are `forest` muted-on-
tint in dark mode at 4.71:1, and `fire` deep-on-tint in light mode at 5.33:1. The
separation floor's tightest result is `fire` in light mode at 1.21:1.

Base colors change in two ways:

```
token        light     dark      note
raised       #fffdf6   #1e2327   warmed from #ffffff, which fought the warm page
structural   #6b4a2b   #b9a68a   a warm brown; the dark value is its light counterpart
```

The structural token is the reference's `--bark`: a warm brown for tile borders and
small labels. It is a base color, not a palette color, because it is shared across
characters.

### D4. Role-to-palette mapping

Four fixed roles, each resolving to an existing palette name. The mapping lives in
code, not config.

```
role         palette   rationale
health       fire      health is red by strong convention
armor        ocean     matches the reference's --sky
speed        forest    matches the reference's --moss
initiative   sun       matches the reference's --sun
```

Sunny's sheet then reads: forest header, forest ability numbers, a four-color metric
row, a red tracker, blue and green pool dots, forest and berry section cards.

Trade-off accepted: a forest druid's hit points card is red. The reference does this
and it works, because "health is red" is a stronger cue than a character's theme.

Alternative considered: give roles their own base colors instead of reusing palette
names. Rejected for now. Reusing names means the roles inherit every contrast rule for
free and add no new values to tune.

That reuse couples two things with no reason to stay aligned. Warming `fire` so the
`fire` *character theme* reads more like fire would also turn every character's hit
points tracker orange, on every sheet. Nobody editing a palette would expect that. We
accept the coupling because six names and four roles is small enough to hold in one
head, and because the escape hatch is cheap: give the roles their own token set. That
changes no part of the palette contract. Anyone retuning a palette must check the role
table first — see ADR 0007.

### D5. Where each token gets used

```
header          accent fill + onAccent text        (character color)
ability tile    raised fill, structural border,
                deep number, muted score           (character color)
metric tile     accent fill + onAccent text        (role color)
hp tracker      raised fill, deep ring on the bar,
                accent fill, tint track            (health role)
pool dot        tint fill + deep ring, unspent
                -> transparent + structural ring,
                spent                              (authored pool color)
section card    tint title strip + deep title,
                raised body                        (authored section color)
dice pill       tint fill + deep border and text   (inherited from its row)
```

Five components draw text in `var(--accent)` today. Every one moves to `var(--deep)`:

```
src/lib/character/AbilitiesBlock.svelte:62     the modifier
src/lib/character/SectionsBlock.svelte:77      the row title
src/lib/richtext/RichText.svelte:33            the dice pill's text and border
src/lib/character/HitPointsBlock.svelte:139    the current-value readout
src/lib/character/HitPointsBlock.svelte:183    the damage button labels
```

The last two are easy to miss, because the tracker's fills dominate the block. Nothing
breaks today if they are left behind — the health role maps to `fire`, which stays dark.
The failure is latent: remap health to a mid-tone role later and the readout renders at
about 2.2:1, which is the exact defect this change exists to remove.

Two structural moves come with this, both taken from the reference:

- **Borders carry separation, not shadows.** Containers gain a 3px border in `deep`
  or in the structural color. The current design leans on `box-shadow`, which is
  nearly invisible on the dark surface, so cards stop reading as cards in dark mode.
- **The shadow gains a tinted second layer**, as the reference's
  `0 6px 0 ...,  0 14px 30px rgba(47,93,58,.12)` does.

The shadow sits outside the token contract. It is decorative, carries no text, and lives
in `base.css` rather than the palette. The `Color values are opaque sRGB` requirement
governs theme colour values, which the contrast tests read; a shadow is not one, and
`base.css` already ships a blended shadow under the rule `sheet-restyle` set. The
proposal does not mention this tweak, so treat it as optional: drop it if it draws
debate, because nothing else in the change depends on it.

### D6. Generator and tests

`generate.ts` gains `--tint`, `--deep`, and `--structural`. It emits them in the same
per-palette and per-mode blocks it already writes, so the stylesheet's shape does not
change.

New assertions, all loops over the six names and two modes:

```
foreground on tint      >= 4.5      12 checks
muted on tint           >= 4.5      12
deep on tint            >= 4.5      12
deep on surface         >= 4.5      12
deep on raised          >= 4.5      12
tint vs raised          >= 1.20     12
structural on surface   >= 4.5       2
structural on raised    >= 4.5       2
```

Two existing assertions must change, and the first was missed in an earlier draft of
this design. `emitted-css.test.ts` asserts accent on the surface (line 65) and accent on
the raised surface (line 96). Only the second had a requirement behind it. Both are
retargeted to `deep`, because the delta spec now states that an accent need not be
readable as text on any background. Leaving either in place fails the build the moment
the `sun` accent lands: gold on the light surface measures about 1.9:1.

No other existing assertion is loosened.

## Risks / Trade-offs

- **`deep` on `tint` squeezes from both sides** → The tint must stay pale enough for
  body text, and `deep` must stay dark enough to sit on it. The reference's own gold
  pairing (`#9a6312` on `#fdeccf`) measures about **4.30:1** and fails. The values in
  D3 resolve this — the tightest is `fire` at 5.33:1 — but any later retune must
  re-check the whole set, not one pair.
- **The separation floor and the readability rules pull against each other** → Deepening
  a tint to clear 1.2:1 against the raised surface also darkens what `deep` must sit on.
  In dark mode the two rules cannot both be met by darkening, which is why dark tints
  run lighter than the raised surface. Anyone retuning a tint must move `deep` with it.
- **Sunny's health card turns red** → A deliberate product call, not a bug. It is
  cheap to reverse: the role mapping is one table in code.
- **The palette module grows from 24 to 60-odd values** → Mitigated because
  `palette.ts` stays the single source and every value is machine-checked.
- **`sun`, `berry`, and `ocean` shift hue** → Any character already using them changes
  appearance. Only two sample characters exist; neither uses `sun` or `berry`, and
  `sunny.yaml` uses `ocean` for three spell-slot pools, which will read slightly softer.
- **An accent that fails as text is now legal, and nothing tests component usage** →
  The contrast tests check the palette's values, not which token a component reached
  for. Drawing text in `accent` still renders something visible, so the mistake is
  quiet. The five call sites in D5 are the full list today; a new one is caught by
  review, not by CI.

## Migration Plan

1. Extend the `Palette` and `Base` types, then add values for one name only.
2. Extend `generate.ts`; regenerate `palette.css`.
3. Add the new contrast assertions. They fail for the five unfilled names. Fill them
   until green.
4. Add the role table and point the tracker and the metric tiles at it.
5. Apply the tokens block by block.
6. Run `npm test` and `npm run build`.

Rollback is a revert. No data, storage key, or config format changes, so no character
file or stored state needs migrating.

## Open Questions

None. The one question this design previously carried — whether dark-mode `deep` should
alias dark-mode `accent` — is answered in D3: it does, for every name.
