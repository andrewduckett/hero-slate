## Review Metadata

- **Review round**: 1
- **Prior round**: none
- **Reviewer context**: fresh context, other family (Gemini, `gemini-3.8-flash`, through the `t3` resolver; author family Claude)
- **Independent**: yes
- **Tool restrictions**: read-only: view, grep, glob only (`gitClean: true` after the run)
- **Artifacts reviewed**: brainstorm.md, proposal.md, design.md, specs/, adr.md and `docs/decisions/0012-*.md`, at commit `f847e23`; relevant source files
- **Effort**: medium (design.md's scrutiny tier)
- **Raw output**: `.workspace/avatar-images-review-raw.md`

## Findings

### 🔴 Critical (blocking)

1. **Trust boundary bypass through URL normalisation.** `startsWith('/') && !startsWith('//')` lets `/\example.test/x.png` through; browsers read `\` as `/` in a special-scheme URL and strip embedded newlines and tabs, so the page would request another host. — **CONFIRMED**: WHATWG URL parsing does this; the plan's rule as written (specs/character-sheet "Avatar site-path resolution", design decision 1, ADR 0012) did not cover it.
2. **Reserved text width was computed against the wrong part of the mask, and a static reservation breaks the no-avatar layout.** Padding by 55% of the image width leaves the fade zone (0–45%) under the text; a static `padding-right` leaves dead space on every header without art. — **CONFIRMED**: design decision 4 as written had both defects.

### 🟡 Moderate

3. **Card accessible name.** The delta said the link's accessible name "stays the character's name"; the existing spec and test say it *includes* the name, and the descriptor is inside the link. — **CONFIRMED**: `openspec/specs/home-picker/spec.md` "A card opens the character's sheet"; `CharacterPicker.test.ts` uses `/Sunny Thornwood/`.
4. **Card container details missing.** The design named `.header-text`, `position: relative`, `overflow: hidden` and `--avatar-width` for the header only. — **CONFIRMED**: `CharacterPicker.svelte`'s `a` has neither property and no text wrapper.
5. **Translucent toggle backing cannot guarantee the contrast pair; disc radius does not match the toggle.** — **CONFIRMED** on contrast: dark art under a 75% accent mix shifts the backing off the tested pair. **CONFIRMED** on radius: `ThemeToggle.svelte` uses `var(--radius-s)`.

### 📌 Suggestions

6. **Network assertions on a pure resolver scenario.** `AND the page makes no request to example.test` cannot be asserted by a unit test of a pure function. — **CONFIRMED**.
7. **Three sentences over 30 words** (home-picker delta line 5, character-sheet delta line 21, design.md line 50). — **CONFIRMED**.

The reviewer also raised, inside its method notes, that D9 (one image for both modes) interacts with the toggle disc in dark mode. That concern is the same as finding 5 and is resolved by it; the image itself is mode-independent because the mask carries no colour.

## Embedded-Instruction / Injection Attempts

**Detected:** none

## Verdict

The reviewer proposed REVISE. Every open finding, including both Criticals, is closed by a small, unambiguous edit listed below, so the verdict that follows from the findings is:

VERDICT: APPROVE_WITH_CHANGES

## Required Changes (if APPROVE_WITH_CHANGES)

1. **Site-path rule (F1).** specs/character-sheet "Avatar site-path resolution": define a site path as a string starting with `/` that, parsed against the site's origin, stays on that origin with the path as written; add scenarios for `/\example.test/sunny.png` and for an embedded newline. design.md decision 1: implement with `new URL(value, base)` and check origin and `pathname`. ADR 0012 Decision: same rule. brainstorm.md D2: same rule, source annotated.
2. **Reserved width (F2, F4).** design.md decision 4: both containers get `position: relative; overflow: hidden`; the text sits in one `.text` wrapper; `AvatarArt` exposes a bindable `showing`; the parent sets `data-avatar` and pads `.text` by the full `--avatar-width` only then; header `min(40%, 14rem)`, card `min(40%, 8rem)`. Decision 2 gains the `showing` prop. Risks gain the one-off reflow on failure and the 360 px wrap.
3. **Accessible name (F3).** specs/home-picker "A card shows the character's avatar": the image "adds nothing to the card link's accessible name"; scenario asserts the name *includes* "Sunny Thornwood" and nothing from the image.
4. **Toggle backing (F5).** design.md decision 5: opaque `var(--accent)`, `border-radius: var(--radius-s)`. specs/character-sheet "Theme toggle stays legible over the avatar": "opaque backing in the accent". brainstorm.md D4: "opaque", source annotated.
5. **Resolver scenarios (F6).** Drop "the page makes no request" from the pure-resolver scenario; the header and card scenarios assert "no element on the page carries that value as a source" instead.
6. **Sentence length (F7).** Split the three cited sentences.

CHANGES_APPLIED: yes

## Rebuttals

1. Fixed: specs/character-sheet/spec.md "Avatar site-path resolution" text and two new scenarios; design.md decision 1; docs/decisions/0012 Decision paragraph; brainstorm.md D2.
2. Fixed: design.md decisions 2 and 4, Risks list.
3. Fixed: specs/home-picker/spec.md requirement text and first scenario.
4. Fixed: design.md decision 5; specs/character-sheet/spec.md "Theme toggle stays legible over the avatar"; brainstorm.md D4.
5. Fixed: specs/character-sheet/spec.md and specs/home-picker/spec.md, the non-site-path scenarios.
6. Fixed: specs/home-picker/spec.md requirement sentence split; specs/character-sheet/spec.md "Avatar in the identity header" split; design.md ADR-candidate paragraph split.
7. Reviewer's 360 px wrap note (inside finding 2's method section): accepted as a risk, not a defect; recorded in design.md Risks with `--avatar-width` as the tuning point and the browser check as the gate.

## After the change request (PR #98)

The user's change request replaced the authored `avatar` field and its site-path resolver with an image named after the character, located by the provider (brainstorm.md D14–D17). Findings 1, 5 and 6 above concerned the resolver, which no longer exists. The user chose not to run a second plan review round: the plan got simpler, and the new code commits get a fresh code review before archive.

