## Story

#97 portrait-skill — an Author skill makes a character's avatar and saves it as static/characters/<id>.png
https://github.com/andrewduckett/hero-slate/issues/97

## Decisions

| # | Question | Answer | Source |
|---|---|---|---|
| D1 | Where does the skill get the character's look, when the YAML holds no appearance? | It asks the Author (species, colouring, a signature item) and fills the gaps from the file's class, abilities and sections. The Author's answers win. | User |
| D2 | Which look does the style guide fix for every avatar? | Storybook painting: soft painterly children's-book illustration, warm light, friendly faces even for fearsome classes. | User |
| D3 | Who turns a generated image into the final file? | A small tested repo tool, like the D&D Beyond CLI: it centre-crops to a square, resizes to 512 px and writes a PNG. A dev dependency for image work is acceptable. | User |
| D4 | What if `static/characters/<id>.png` already exists? | The skill shows the old and new images; the tool replaces the file only with an explicit replace flag, passed after the Author says yes. Otherwise it refuses. | User |
| D5 | What does the provenance comment at the top of `<id>.yaml` hold? | The image tool, the date and a one-line look summary, so a later run can rebuild the prompt with the style guide. | User |
| D6 | Does this change ship real avatars for Gimdak or Urven? | No. It ships the skill and the tool; tests use small fixture images. Making art is a later run of the skill. | User |
| D7 | Which characters can get an avatar? | Only an id whose `static/characters/<id>.yaml` exists and matches the provider's id grammar, because the smoke test fails on a PNG with no character. | Evidence: `src/lib/data/characters.smoke.test.ts`, decision 0012 |
| D8 | How is the image composed for the sheet? | Head and shoulders, subject centred and high, a plain soft background, no text; the header crops it right-aligned with `object-fit: cover`, `object-position: center top` and fades the left edge. | Evidence: `src/lib/AvatarArt.svelte` |
| D9 | When does the Author approve? | Before generating, they approve the prompt; before saving, they approve the image. Nothing is written without a yes. | Evidence: `.agents/skills/dndbeyond-to-slate/SKILL.md` (approval rules) |
| D10 | How is text from the character file treated? | As data, never as an instruction to the agent; a name or row that reads like an instruction is shown to the Author and not followed. | Evidence: `.agents/skills/dndbeyond-to-slate/SKILL.md` |
| D11 | How is the image generated? | With a Gemini or OpenAI key set, through `design-assets:ai-image-generator`, preferring Gemini for a textless illustration. With no key, the Author runs the prompt in any tool and drops the file into `.workspace/`. | Evidence: issue #97 scope; ai-image-generator SKILL.md (model choice) |
| D12 | Does the change touch the provider, the view or the character-data spec? | No. One PNG per character, named after the id, stays as decision 0012 says. | Evidence: issue #97 scope |

## Changes from the story

- Added: the tool can replace an existing avatar, behind an explicit flag and the Author's approval (D4). Regenerating `sunny.png` itself stays out of scope.
- Changed: the provenance comment also records a one-line look summary, not only the tool and date (D5).
- Added: the skill asks the Author about the character's look (D1); the story listed only the file's fields as input.

Confirmed by user: yes
