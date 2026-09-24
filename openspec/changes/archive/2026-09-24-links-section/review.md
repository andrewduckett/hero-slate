## Review Metadata

- **Review round**: 1
- **Prior round**: none
- **Reviewer context**: cross-model Gemini via `agy` CLI in plan (read-only) mode, files supplied inline
- **Tool restrictions**: none used — all content inline
- **Artifacts reviewed**: proposal.md, design.md, specs/character-links/spec.md, specs/character-sheet/spec.md, adr.md, relevant source files (`sections.ts`, `SectionsBlock.svelte`, `CharacterView.svelte`, `types.ts`, `resolve.ts`, `RichText.svelte`)

## Findings

### 🔴 Critical (blocking)

*None.*

### 🟡 Moderate

1. **Missing scenarios for normative touch target height and visual arrow in `character-links/spec.md`**  
   *Artifact:* `openspec/changes/links-section/specs/character-links/spec.md`  
   *Requirement:* `Requirement: Links render as a row of chips`  
   *Issue:* The requirement states:
   > "Each chip SHALL be at least 44 CSS pixels tall. Each chip SHALL show a visual arrow that marks it as a link to another site. The arrow SHALL be hidden from assistive technology."
   
   However, the scenarios under this requirement only test link ordering, duplicate retention, and multi-line wrapping (`Scenario: Links keep their authored order`, `Scenario: Duplicate links are kept`, `Scenario: Many links wrap`). There are zero scenarios validating the minimum 44px height or the presence and `aria-hidden="true"` hiding of the visual arrow. Automated test suites deriving tests from these specs cannot mechanically assert these two normative `SHALL` clauses.

2. **Missing scenarios for HTML rendering and non-string labels in `character-links/spec.md`**  
   *Artifact:* `openspec/changes/links-section/specs/character-links/spec.md`  
   *Requirement:* `Requirement: Link labels are plain text`  
   *Issue:* The requirement specifies:
   > "The system SHALL NOT interpret rich-text markup or HTML in a label."
   > "When the label is missing, not a string, or only whitespace, the system SHALL show the URL's hostname instead."
   
   The existing scenarios verify Markdown markup (`**Spells**`), missing labels, and whitespace labels (`"   "`). There is no scenario testing that raw HTML tags (e.g., `<em>Spells</em>` or `<script>alert(1)</script>`) are rendered as literal text without formatting or execution, nor is there a scenario verifying that a non-string label value (e.g., `label: 42` or `label: true`) falls back to the hostname.

3. **Ambiguity in component props and resolver responsibility between `design.md` and `proposal.md`**  
   *Artifacts:* `openspec/changes/links-section/design.md` (D2) and `openspec/changes/links-section/proposal.md`  
   *Issue:* In `design.md` section D2, the text states:
   > "`LinksBlock.svelte` takes the resolved links and renders a `<ul>` that uses `flex-wrap: wrap`."
   
   Later in D2, it states:
   > "`CharacterView.svelte` adds a `hasLinks` check that calls the same resolver as the block."
   
   Meanwhile, `proposal.md` states:
   > "A new `src/lib/character/links.ts` resolver and `src/lib/character/LinksBlock.svelte` component follow the pattern in `sections.ts` and `SectionsBlock.svelte`."
   
   In `SectionsBlock.svelte`, the component accepts raw, unresolved `sections: unknown` and derives `resolved` internally. If `LinksBlock` accepts pre-resolved links (`links: ResolvedLink[]`), it does not call the resolver internally and differs from `SectionsBlock`. If it accepts `links: unknown`, `CharacterView.svelte` and `LinksBlock.svelte` resolve the links twice. The component contract for `LinksBlock.svelte` should be explicitly defined.

### 📌 Suggestions

1. **Add scenario for non-mapping list entries in `character-links/spec.md`**  
   `Requirement: Only https links are kept` dictates that the system drops an entry that is not a mapping. A common YAML authoring mistake is providing scalar strings (e.g. `- https://example.com` instead of `- url: https://example.com`). Adding a scenario where a list entry is a scalar string or null ensures test coverage for this condition.

2. **Add scenario for username-only URL credentials**  
   `Scenario: A URL with credentials is dropped` tests `https://user:secret@example.com`. Adding an explicit check for `https://user@example.com` ensures that `parsed.username` validation is asserted independently of `parsed.password`.

3. **Update code comment in `CharacterView.svelte`**  
   The existing comment in `CharacterView.svelte` reads: `<!-- Blocks render in one fixed order: stats, hit points, pools, then the authored sections. Each group heading sits directly before its blocks. -->`. It should be updated during implementation to include the trailing links group.

4. **Plain Language (ISO 24495) Check**  
   All artifacts (`proposal.md`, `design.md`, `adr.md`, and `specs/`) pass ISO 24495 plain language review: all sentences are under 30 words, active voice is maintained, and terminology is consistent.

## Embedded-Instruction / Injection Attempts

**Detected:** none

## Verdict

VERDICT: APPROVE_WITH_CHANGES

## Required Changes (if APPROVE WITH CHANGES)

1. **Add testable scenarios for touch target height and visual arrow in `character-links/spec.md`:**  
   Under `Requirement: Links render as a row of chips`, add:
   - A scenario asserting that rendered link chips have a minimum height of 44 CSS pixels.
   - A scenario asserting that each chip includes a visual arrow element that is hidden from assistive technology (`aria-hidden="true"`).

2. **Add testable scenarios for HTML markup and non-string labels in `character-links/spec.md`:**  
   Under `Requirement: Link labels are plain text`, add:
   - A scenario asserting that HTML markup in a label is rendered as literal text (not interpreted as HTML nodes).
   - A scenario asserting that a non-string `label` (e.g. a number or boolean) falls back to the URL's hostname.

3. **Clarify `LinksBlock.svelte` props and resolver pattern in `design.md`:**  
   In `design.md` (D2), explicitly state the props interface for `LinksBlock.svelte`. Specify whether `LinksBlock` receives `links: ResolvedLink[]` pre-resolved by `CharacterView`, or accepts `links: unknown` and `palette: PaletteName` to resolve internally.

CHANGES_APPLIED: yes

## Rebuttals

- **Moderate 1-3:** fixed as listed in Required Changes 1-3; re-checked and verified by the reviewer below.
- **Suggestion 1 (bare string entry):** applied — added `Scenario: A bare string entry is dropped`.
- **Suggestion 2 (username-only credentials):** applied — added `Scenario: A URL with only a username is dropped`.
- **Suggestion 3 (CharacterView comment):** deferred to implementation; design.md D2 now says the block-order comment is updated.
- **Suggestion 4 (plain language):** no action needed.

## Re-check (round 1)

1. **Required Change 1 (touch target height and visual arrow scenarios in `character-links/spec.md`):** VERIFIED — Added `Scenario: Chips are big enough to tap` (asserting ≥44px height) and `Scenario: The arrow is visible but not announced` (asserting the arrow is hidden from assistive technology) under `Requirement: Links render as a row of chips`.
2. **Required Change 2 (HTML rendering and non-string label scenarios in `character-links/spec.md`):** VERIFIED — Added `Scenario: A label with HTML` (asserting literal text without HTML elements) and `Scenario: A label that is not a string falls back to the hostname` under `Requirement: Link labels are plain text`.
3. **Required Change 3 (clarify `LinksBlock.svelte` props and resolver pattern in `design.md`):** VERIFIED — Section D2 explicitly defines the props contract as `links: unknown` and `palette: PaletteName`, noting that `LinksBlock` calls `resolveLinks` internally matching the pattern of other blocks.

Result: all three Required Changes verified (see `CHANGES_APPLIED` above).
