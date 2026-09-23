## Context

See `proposal.md` for why this change exists and `specs/dndbeyond-ingest/spec.md` for the behavior. This design covers where the code lives, how it runs, and how the agent and the tools share the work.

Constraints that shape the approach:

- **The app's rules already exist.** `src/lib/character/*` holds one resolver per block: abilities, combat, hit points, pools, and sections. Each resolver quietly drops what it cannot read. `src/lib/data/yaml.ts` holds the identity checks and the id grammar. `src/lib/theme/palette.ts` holds `PALETTE_NAMES`. The ingest code must reuse these, not copy them.
- **Those modules do not load under plain Node.** They import with `$lib/...` aliases and without `.ts` extensions. The palette runner, `scripts/generate-palette-css.ts`, gets away with plain `node` only because its import chain uses explicit `.ts` paths.
- **SvelteKit limits which files Vite will serve.** A spike ran each entry file under `vite-node`. An entry under `src/` loaded the resolvers correctly. An entry under `scripts/` failed with `ERR_LOAD_URL`. The spike also confirmed that `vite-node` passes arguments and exit codes through unchanged.
- **D&D Beyond's JSON is large and derived.** Urven's response is about 325 KB. Most numbers the sheet needs are not stored directly. They are sums over `stats`, `bonusStats`, `overrideStats`, `modifiers.{race,class,background,feat,item}`, `inventory`, and `characterValues`.

## Goals / Non-Goals

**Goals:**

- Every number in the digest is computed by tested code, never by the agent.
- The preview uses the same resolvers as the app, so the preview matches the rendered sheet.
- Stories 17–20 can extend the digest, the cross-check, and the skill without restructuring this design.

**Non-Goals:**

- A general D&D rules engine. The digest covers the common cases and reports `null` for the rest.
- Pixel fidelity. The preview checks the sheet's structure and numbers. It does not show fonts, colors, or rich-text styling.
- Any change to the deployed app's behavior or bundle.

## Decisions

### D1. Split the work: tested tools supply facts, the agent writes

The digest tool computes numbers. The agent chooses what to include, renames things, writes prose, and picks the colors. The preview tool checks the agent's draft against the app's rules and against the digest.

- *Alternative: the tool writes the whole YAML.* Rejected. The value of a Hero Slate sheet is editorial: reflavoring, renaming, choosing a few actions, and kid-friendly wording. Urven's sheet shows this clearly (see the ADR).
- *Alternative: the agent reads the raw JSON and does the maths.* Rejected. The sums are easy to get wrong and cannot be tested. 325 KB of JSON also crowds the agent's context.

### D2. Code layout: pure modules plus one command-line entry, all under `src/lib/ingest/ddb/`

```
src/lib/ingest/ddb/
  reference.ts    URL or id  -> numeric id, or unreadable         (pure)
  fetch.ts        id + injectable fetch -> DDB JSON or failure    (pure given fetch)
  digest.ts       DDB JSON   -> Digest                            (pure)
  armorClass.ts   DDB JSON + scores -> AC or null with reason     (pure)
  validate.ts     draft text + id -> errors and warnings          (pure)
  crosscheck.ts   draft + Digest -> mismatch warnings             (pure)
  preview.ts      draft -> ASCII lines                            (pure)
  exitCodes.ts    the exit-code table from the spec
  cli.ts          argv, file reads, process exit                  (the only impure file)
  fixtures/urven.json
```

`fetch.ts` takes an injectable fetch, in the same way `createYamlProvider` does, so every HTTP outcome is testable without a network.

- *Alternative: `scripts/ddb-to-slate.ts`, as the proposal first said.* Rejected. The spike showed that an entry under `scripts/` cannot load `$lib` modules under `vite-node`. This design updates the proposal to match.
- *Alternative: modules under `.claude/skills/`.* Rejected earlier in exploration. They would need relative imports back into `src/`, and Vitest would not find their tests.

No route imports `src/lib/ingest/`, so Vite leaves it out of the static build.

### D3. Run the command-line entry with `vite-node`, as an explicit dev dependency

The skill runs `npx --silent vite-node src/lib/ingest/ddb/cli.ts <command> ...`. `vite-node` reads `vite.config.ts`, so the `$lib` alias and extensionless imports resolve as they do in tests. `vite-node` is already installed as a dependency of Vitest. This change adds it to `devDependencies` at the locked version, so the tool does not rely on a transitive package.

- *Alternative: rewrite the resolvers' imports with `.ts` extensions.* Rejected. It touches app code for a tooling need, and `$lib` would still fail under plain Node.
- *Alternative: add `tsx`.* Rejected. `tsx` does not read the Vite alias config, and it adds a new package.

### D4. Two commands, with the id taken from the draft's file name

```
cli.ts digest  <reference>                      -> digest JSON on stdout
cli.ts preview <draft.yaml> [--digest <file>]   -> ASCII preview, errors, warnings
```

The target logical id is the draft file's base name. `.workspace/urven.yaml` targets `static/characters/urven.yaml`. One source of truth means the id cannot drift between the draft and the flags. The skill saves the digest to `.workspace/<ddb-id>.digest.json` and passes it to `preview`.

There is no `write` command. After the Author approves, the skill copies the draft into `static/characters/` with a copy that refuses to overwrite. `preview` has already stopped on an existing file (exit 3).

- *Alternative: a `--write` flag on `preview`.* Deferred. The Author chose agent-side writing. Story 20 will need a real write step for merging, and it can add one then.

### D5. The preview reads the draft through the app's resolvers

`validate.ts` parses the YAML and applies the same identity checks as the provider. To support this, `yaml.ts` exports `ID_GRAMMAR`. It also exports its identity check as a small named function, so the ingest code does not copy the rules. To find entries the app would drop, it compares each raw list with the output of `validEntries`, `resolveSections`, and `resolvePools`.

`preview.ts` draws only the resolved output. Its layout has no right-hand border. Emoji in names and titles vary in display width, so a right border would never line up. Rich-text bodies appear with their markup as written.

### D6. The cross-check matches by label aliases and skips what it cannot place

`crosscheck.ts` holds a small alias table. For example, `strength`, `str` → Strength, and `armor class`, `ac` → Armor Class. Matching ignores case and surrounding whitespace. A signed string such as `"+5"` is parsed to a number before comparison. An unmatched label is skipped silently, because renaming is the Author's right. A `null` digest fact is skipped.

### D7. Armor Class uses an allowlist of understood sources

`armorClass.ts` first collects every Armor Class–affecting input: equipped armor and shields, `armor-class` modifiers, `unarmored-armor-class` sets, and the override in `characterValues`. It computes a value only when every input is on the list the spec names. Otherwise it returns `null` with the first unrecognized source as the reason. An allowlist fails safe: a new kind of effect produces "unknown", not a wrong number.

## Risks / Trade-offs

- **D&D Beyond changes its unofficial JSON shape.** → The digest checks the fields it reads and exits 5 with the missing part named. The fixture tests keep the mapping honest for the shape we know.
- **The fixture covers one character: a monk with no armor.** → Unit tests use small handmade JSON fragments for armor with a DEX cap, shields, barbarian Unarmored Defense, overrides, and set effects. Later stories can add more real fixtures.
- **Stored modifiers may not match rules text.** For example, Alert's initiative bonus might not appear as a flat modifier. → The digest trusts D&D Beyond's modifiers. The cross-check warnings then show the Author any disagreement with the sheet they expect.
- **The agent can bypass the preview.** Nothing technically stops it from writing a file directly. → The skill makes preview-then-approve a required step and uses a copy that refuses to overwrite. Story 20's write step can harden this if it proves a problem.
- **`vite-node` start-up takes about a second per run.** → Acceptable for an interactive authoring flow.
- **The fixture adds about 325 KB to the repo.** → Acceptable for one fixture. Trimming it would hide the real structure that the unexpected-shape checks depend on.

## Migration Plan

No migration. The change adds new files, one dev dependency, and two new exports from `yaml.ts` with unchanged behavior. Rollback is a revert.

## Open Questions

- Exact D&D Beyond field names for barbarian Unarmored Defense and for magic-item "set" effects. The fixture does not contain them. The unit tests will use the shapes documented by the community tooling. A real fixture can confirm them later without changing this design.
