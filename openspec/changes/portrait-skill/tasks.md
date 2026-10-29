## 1. The avatar tool

- [x] 1.1 [medium] `save <image> <id>` turns a 1024 × 1024 JPEG for a character with a YAML file into a 512 × 512 PNG at `static/characters/<id>.png`, and exits 0. Adds `sharp` as a dev dependency, and the test runs in the Node environment (design D1, D7) (verify: npx vitest run src/lib/authoring/avatar) (✓ npx vitest run src/lib/authoring/avatar passed)
- [x] 1.2 [medium] A tall image keeps its top and a wide image keeps its horizontal centre: the red/blue band images from the spec give an avatar with no blue pixels (verify: npx vitest run src/lib/authoring/avatar) (✓ npx vitest run src/lib/authoring/avatar passed)
- [x] 1.3 [easy] `save` exits 1 and writes nothing for an id outside `ID_GRAMMAR` (such as `../evil`), for the reserved `manifest`, and for an id with no `static/characters/<id>.yaml`. Each message names the check that failed (verify: npx vitest run src/lib/authoring/avatar) (✓ npx vitest run src/lib/authoring/avatar passed)
- [x] 1.4 [easy] `save` exits 1 and writes nothing for a file that is not a PNG, JPEG or WebP image, and for an image under 512 px on its shorter side (verify: npx vitest run src/lib/authoring/avatar) (✓ npx vitest run src/lib/authoring/avatar passed)
- [x] 1.5 [medium] `save` exits 3 and changes no file when `<id>.png` exists without `--replace`, and replaces it with `--replace` (verify: npx vitest run src/lib/authoring/avatar) (✓ npx vitest run src/lib/authoring/avatar passed)
- [x] 1.6 [medium] `save --tool <name> --look-file <file>` makes the character file's first line `# Avatar: <name>, <YYYY-MM-DD>. Look: <summary>.`, from the injected clock. It replaces an existing avatar comment and keeps every other byte (verify: npx vitest run src/lib/authoring/avatar) (✓ npx vitest run src/lib/authoring/avatar passed)
- [x] 1.7 [easy] `save` exits 1 and writes nothing when the tool name or the look summary is empty or has a line break (verify: npx vitest run src/lib/authoring/avatar) (✓ npx vitest run src/lib/authoring/avatar passed)
- [ ] 1.8 [easy] `prompt <look-file>` prints the look description, then the style guide unchanged (verify: npx vitest run src/lib/authoring/avatar)

## 2. The skill [depends-on: 1]

- [ ] 2.1 [easy] `.agents/skills/character-avatar/style-guide.md` asks for each element the spec lists: storybook painting with warm light, a friendly face, head and shoulders centred high in a square frame, a plain soft background, and no text or watermark. A test checks each one is present (verify: npx vitest run src/lib/authoring/avatar)
- [ ] 2.2 [medium] `.agents/skills/character-avatar/SKILL.md` follows the spec's seven-step flow, with its rules on approval, replacing, image source and data-not-instructions. It gives the exact `prompt` and `save` commands (verify: test -f .agents/skills/character-avatar/SKILL.md && npx vitest run src/lib/data/characters.smoke.test.ts)

## 3. Integration [depends-on: 2]

- [ ] 3.1 [easy] The full suite and the static build pass, and the built client bundle does not contain `sharp` (verify: npm test && npm run build && ! grep -rl sharp build)

## Deviations Ledger

- 1.3: `src/lib/data/yaml.ts` now exports `MANIFEST_ID`, so the avatar tool reuses the provider's reserved id instead of copying it. The provider's behaviour does not change.
