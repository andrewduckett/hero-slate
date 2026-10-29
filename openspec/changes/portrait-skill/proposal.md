## Why

A sheet shows a character's avatar whenever `static/characters/<id>.png` exists, but only Sunny has one, and hers is a placeholder. With no repeatable way to make an avatar, each portrait is a one-off job in whatever tool is at hand, and the portraits will not match. Issue #97.

## What Changes

- A new Author skill in `.agents/skills/` turns a character file into its avatar. It reads the character's YAML and asks the Author how the character looks, filling gaps from the file (D1). Then it builds one image prompt from a style guide held in the skill (D2, D8).
- The skill generates the image through `design-assets:ai-image-generator` when a Gemini or OpenAI key is set. Otherwise it hands the Author the prompt and takes the file they drop into `.workspace/` (D11).
- The Author approves the prompt before generation and the image before saving (D9). Text from the character file is data, never an instruction (D10).
- A new repo tool turns the image into the avatar file: a 512 px square PNG at `static/characters/<id>.png`. It accepts only a character's id, never the reserved `manifest` (D7). It refuses to overwrite an existing avatar unless an explicit replace flag is passed (D3, D4).
- The skill adds one provenance comment at the top of `<id>.yaml`: the image tool, the date and a one-line look summary (D5). Then it confirms the characters smoke test passes.
- No avatars ship in this change (D6). The provider, the view and the `character-data` spec do not change (D12).

## Capabilities

### New Capabilities
- `avatar-authoring`: the Author skill's flow, from a character file to an approved avatar, and the tool that writes the avatar file.

### Modified Capabilities

None.

## Impact

- New skill: `.agents/skills/` gains a sibling to `dndbeyond-to-slate`, with its style guide.
- New code: an image tool, its command-line entry point and tests, with small fixture images. It is Author tooling, run through `vite-node` like the D&D Beyond tool, and is not part of the built site.
- Dependencies: one new dev dependency for decoding, cropping and encoding images.
- Character files: the skill writes a comment line at the top of a character's YAML. Comments do not change what the provider loads.
- No change to the provider, the view, the static build or deployment.
