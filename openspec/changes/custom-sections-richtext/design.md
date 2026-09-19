## Context

See proposal.md — Why for the motivation.

The codebase already establishes two patterns this design follows exactly:

1. **Pure resolver + thin renderer**: every block (abilities, combat, pools) has a pure
   TypeScript module that validates and resolves raw YAML, and a thin Svelte component that
   renders the result. No logic lives in components.
2. **Named-palette color**: `resolvePalette(color)` maps an authored name to a
   `PaletteName`, falling back to `neutral`. Components set `data-palette` and read
   `--accent` / `--on-accent` from the generated CSS.

The test suite currently enforces two contrast pairs:
- `--on-accent` on `--accent` background (per palette, both modes).
- `--foreground` on `--surface` (base, both modes).

A third pair — `--accent` as text on `--surface` — is not yet tested. All six
palettes pass WCAG AA for this pair in both modes (minimum 5.04:1, forest light),
but the test suite does not enforce it.

## Goals / Non-Goals

**Goals:**

- Parse each row body into a token tree in a pure function. Render the tree with
  recursive Svelte so text nodes ride Svelte's default escaping.
- Support `**bold**`, `*italic*` (nestable), emoji (plain Unicode, zero handling),
  and `[[...]]` pills (dice or bonus flavor).
- Render sections in authored order. Omit invalid sections or rows silently.
- Render section headings with accent background and on-accent text.
- Render row titles as accent-colored text on the sheet surface.
- Add a tested guarantee for accent-as-text on surface to the theming suite.

**Non-Goals:**

- In-app authoring or editing of sections.
- Interactive dice rolls — pills are non-interactive display only.
- Raw HTML, hex colors, or block-level markup in body text.
- A number-fallback for large pools (already deferred to "Could" in discovery).

## Decisions

### Decision 1 — Token tree, not HTML string

**Chosen:** Parse each body to a `Node[]` token tree; render with recursive Svelte.
No `{@html}` anywhere in the rich-text path.

**Alternatives:**
- *Sanitize to HTML string + `{@html}`*: simpler parser, but requires a sanitizer,
  adds a dependency, and leaves XSS safety to a runtime filter rather than
  eliminating the attack surface.

**Why:** The token tree makes XSS structurally impossible — no HTML string exists.
The test suite can verify adversarial inputs render as visible text with zero
special infrastructure. This is the same guarantee `pools.ts` gives with own-key
reads for `__proto__`: the problem is removed, not filtered.

The token tree also enables a companion ADR covering this decision permanently.

**Token shape:**

```ts
type Node =
  | { kind: 'text';   text: string }
  | { kind: 'strong'; children: Node[] }
  | { kind: 'em';     children: Node[] }
  | { kind: 'pill';   flavor: 'dice' | 'bonus'; text: string }
```

`strong` and `em` nest; `text` and `pill` are leaves. The renderer recurses into
`children` for the nesting kinds and never builds a string.

### Decision 2 — Forgiving parse; malformed markers render literally

**Chosen:** Unmatched `*`, `**`, or unclosed `[[...]]` renders as the literal
character(s). The parser never drops or silently eats trailing text.

**Alternatives:**
- *Strict — drop malformed spans*: cleaner output when correct, but a typo in
  a YAML file at the table causes silent data loss. Hard to debug.

**Why:** Authors edit YAML by hand, often on a phone. A stray `*` turning into
visible punctuation is preferable to half a sentence vanishing.

### Decision 3 — `[[...]]` pill classification

**Chosen:** Classify the trimmed inner text of `[[...]]` as one of:
1. **Dice** — contains the pattern `\d*d\d` (e.g. `d20+6`, `1d8`, `2d6`).
   Renders as `🎲 <text>` pill.
2. **Bonus** — is a signed integer (leading `+` or `-` followed by digits,
   e.g. `+7`, `-2`). Renders as a plain `<text>` chip with no glyph.
3. **Fallback** — anything else renders as a dice pill (opaque display label).
   `[[]]` (empty after trim) renders as the literal `[[]]`.

**Why:** The `[[+7]]` syntax removes the need for a separate `bonus:` field.
Any section can carry inline bonuses without special-casing. Keeping the fallback
as a dice pill rather than a special error state means future notations (e.g.
`[[advantage]]`) naturally become pills without a code change.

### Decision 4 — Section heading vs. row title color rendering

**Chosen:** Two distinct rendering treatments for the two kinds of title:

- **Section heading**: accent background + on-accent text — the same treatment the
  character header uses. Uses the already-tested `--on-accent on --accent` pair.
- **Row title**: accent-colored text on the sheet surface. All six palettes pass
  WCAG AA for this pair in both modes (minimum 5.04:1). A new test group extends
  the theming suite to enforce this guarantee permanently.

**Alternatives:**
- *Row title as chip (accent bg + on-accent)*: eliminates the need for a third
  contrast test, but makes each row look like a button. Visually heavy for a
  two-column text layout.
- *Row title in foreground color only*: no contrast work needed, but loses the
  per-row color that lets an author visually group rows within a section.

**Why:** The contrast math shows all palettes pass with margin. Adding a test is
less design compromise than forcing a chip on row titles or losing per-row color.

### Decision 5 — Module layout

Two new modules, mirroring the established pattern:

```
src/lib/richtext/
  parse.ts              <- pure tokenizer: string -> Node[]
  parse.test.ts         <- grammar rules + adversarial XSS fixtures
  RichText.svelte       <- recursive renderer; no {@html}

src/lib/character/
  sections.ts           <- pure resolver: unknown -> ResolvedSection[]
  sections.test.ts      <- validation + authored-order rules
  SectionsBlock.svelte  <- renders resolved sections using <RichText>
```

`CharacterView.svelte` adds `<SectionsBlock sections={result.character.sections} />`
below `<CombatBlock>`. No state store involvement — sections are definition data only.

## Risks / Trade-offs

**Nesting depth → stack depth** — The recursive renderer could stack-overflow on
pathological input. Mitigation: the only nesting kinds are `strong` and `em`; real
bodies are short prompts. Cap nesting depth at parse time (e.g. 8 levels) and emit
a `text` node for anything beyond.

**`sun` accent on white is the tightest pair (5.04:1)** — Passes AA but has no
headroom against a future palette edit. Mitigation: the added contrast test catches
any regression the instant the palette changes.

**Row title is optional (body-only rows)** — Discovery does not call this out
explicitly, but some prompts have no label. Mitigation: treat `title` as optional on
a row; a row with a non-empty body and no title renders as body-only.

## Open Questions

- **Dice pill glyph for the fallback flavor** — if `[[advantage]]` becomes a pill
  via the fallback rule, the `🎲` glyph may not fit. Deferrable: the glyph can be
  conditioned on the dice flavor alone without touching the spec.
