## Context

- The D&D Beyond skill sets the pattern for Author tooling. Its prose lives in `.agents/skills/dndbeyond-to-slate/SKILL.md`. Its deterministic work lives in `src/lib/ingest/ddb/cli.ts`, run through `vite-node`. The CLI splits into a pure `run(argv, deps)` that tests drive with injected file access, and a small `main` that wires the real `fs` and `process`.
- The provider's id grammar is `ID_GRAMMAR` in `src/lib/data/yaml.ts`: `^[a-z0-9][a-z0-9-]*$`.
- The sheet header and picker card show the avatar right-aligned, with `object-fit: cover` and `object-position: center top`, and fade its left edge (`src/lib/AvatarArt.svelte`).
- The repo has no image library. `ffmpeg` is on the Author's machine, but CI does not promise it. Vitest runs in `jsdom` by default.
- The shipped-characters smoke test fails on a PNG not named after a character file.

## Goals / Non-Goals

**Goals:**
- One tool command turns any approved image into a correct avatar file, and records its provenance, with the same result every time.
- One style guide, held as a file in the skill, so every prompt uses the same words.
- Every rule in the spec that a machine can check is checked by a test of the tool.

**Non-Goals:**
- No change to the provider, the view or the static build.
- No calls to an image API from the tool. Generation stays in the skill, through `design-assets:ai-image-generator` or the Author's own tool.
- No checks on what the image looks like. The Author approves it by eye.

## Test Seams

- **Primary test seam:** the avatar tool's `run(argv, deps)`, the same shape as the D&D Beyond CLI. Tests pass in images built in memory with the image library (solid colours, red and blue bands), plus an in-memory file map and a fixed clock. Then they assert the exit code, the PNG's size and pixels, and the character file's bytes.
- **Existing seams reused:** `src/lib/data/characters.smoke.test.ts`, which the skill runs after saving. Its orphan-PNG check already covers the avatar's name.

The skill's prose is checked by reading it during verify, as the D&D Beyond skill's is. A unit test also checks that the style guide file contains every element the spec lists.

## Scrutiny Tier & Blast Radius

- **Tier:** medium
- **Blast radius:** a new folder `src/lib/authoring/avatar/`, a new skill folder, and one new dev dependency with a native binary. The tool writes inside `static/characters/`, so its id check is a path trust boundary. The built site does not import the tool.

## Decisions

**D1. The image library is `sharp`, as a dev dependency.**
It decodes PNG, JPEG and WebP, crops, resizes and encodes PNG in one call, and installs prebuilt binaries for Linux and macOS. `jimp` is pure JavaScript, but it needs a separate plugin for WebP and is slower. Shelling out to `ffmpeg` adds no dependency, but CI cannot rely on it being installed, and its errors are hard to map to the spec's messages. Only the tool imports `sharp`, so it never reaches the client bundle.

**D2. The crop is `fit: 'cover'` with `position: 'top'`.**
For a tall image, top gravity keeps the top rows, so the head stays in frame. For a wide image, the same gravity centres the crop horizontally. One setting meets both spec scenarios, and it matches how the view shows the image (`center top`). The tool calls `.rotate()` first, so a phone photo's orientation flag is applied before the crop.

**D3. The tool lives at `src/lib/authoring/avatar/`, with its own exit codes.**
Avatar work is not ingest, so it gets its own folder rather than a place under `ingest/ddb/`. Its exit codes reuse the D&D Beyond numbers that mean the same thing: 0 for success, 1 for unusable input, 3 for an existing target. A reader who knows one tool can read the other.

**D4. Two commands: `prompt` and `save`.**

```
npx --silent vite-node src/lib/authoring/avatar/cli.ts prompt <look-file>
npx --silent vite-node src/lib/authoring/avatar/cli.ts save <image> <id> --tool "<image tool>" --look "<summary>" [--replace]
```

`prompt` prints the look description from the file, then the style guide from `.agents/skills/character-avatar/style-guide.md`, unchanged. That makes "every prompt carries the whole style guide" something the tool does, not something the agent must remember. The style guide still lives in the skill, as the story asks. Keeping the look in a file under `.workspace/` stops shell quoting from mangling the Author's words.

**D5. `save` checks everything before it writes anything.**
In order: the id matches `ID_GRAMMAR` → `static/characters/<id>.yaml` exists → `--tool` and `--look` are non-empty and single-line → the target PNG is absent, or `--replace` is set → the image decodes → its shorter side is at least 512 px. The tool builds the PNG in memory, writes it (with the `wx` flag unless `--replace` is set), then rewrites the character file. The target path comes only from the id, never from the input's path.

**D6. The provenance comment is the first line, matched by its prefix.**
A first line that starts with `# Avatar: ` is replaced. Otherwise the new line is inserted above the file's first line. The tool splits off only that first line, so every other byte stays the same, including line endings and any comment that was there before, such as Sunny's. The date is the local calendar date from the injected clock.

**D7. The avatar tool's tests run in Node, not jsdom.**
The test file opens with `// @vitest-environment node`. `sharp` checks for Node `Buffer` and `Uint8Array` types, and jsdom swaps out some globals. Other tests keep the jsdom default.

**D8. The skill is `.agents/skills/character-avatar/`, with `SKILL.md` and `style-guide.md`.**
"Avatar" is the glossary term. `SKILL.md` follows the spec's seven-step flow, and borrows the D&D Beyond skill's data-not-instructions and approval wording. When a key is set, the skill hands the built prompt and a square (1:1) aspect ratio to `design-assets:ai-image-generator`, and saves the result under `.workspace/`. Either way, `save` reads the image from `.workspace/`.

## Risks / Trade-offs

- [`sharp`'s native binary fails to install on a new Node release or platform] → It is a dev dependency used only by an Author tool. A failed install breaks the avatar tests, not the site. Renovate already tracks dependency updates. The fallback is the `jimp` route in D1.
- [`sharp` slows `npm ci` in CI] → It installs prebuilt binaries in seconds, and no build from source is expected on Linux x64.
- [An image service ignores "no text" or the composition rules] → The Author approves every image by eye, and can ask for a new one (spec: revise before saving).
- [A look summary carries text that a later agent reads as an instruction] → The summary is a single YAML comment line, and the skill treats character-file text as data.

## Migration & Rollback

N/A. No data changes shape. To roll back, remove the skill folder, the tool folder and the `sharp` dev dependency. Any avatars saved meanwhile are plain files that the sheet already understands.
