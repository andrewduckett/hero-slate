## Review Metadata

- **Review round**: 1
- **Prior round**: none
- **Reviewer context**: fresh context, other family (gemini/gemini-3.8-flash, through the `t3` resolver)
- **Independent**: yes. The plan's author is Claude; the reviewer is Gemini.
- **Tool restrictions**: read-only; the working tree was clean before and after the review.
- **Artifacts reviewed**: brainstorm.md, proposal.md, design.md, specs/, adr.md, relevant source files, at commit 207240b

## Findings

### 🔴 Critical (blocking)

1. **The `apple-mobile-web-app-capable` tag is not specified or tested, and may break navigation.** The reviewer said the tag could make iPad open links between pages in Safari, outside the installed app, and that nothing tests the tag. Check: **CONFIRMED in part.** Nothing tested the tag, and only a device can prove its effect. The breakout scenario is **REFUTED** for this site: see Rebuttals.

### 🟡 Moderate

2. **"Startup image" and "splash" are two words for one thing, with no glossary entry.** D10 is an `Assumption`, and the design put startup images in a `splash/` folder while the module is `startup-images.ts`. Check: **CONFIRMED in part.** The folder name mixed the two terms. The glossary part is **REFUTED**: see Rebuttals.
3. **The spec gave no URL for the startup images, and no landscape scenario.** A test could not find "the iPad mini portrait image" without the design's file convention. A landscape link with width and height swapped would pass the uniqueness check. Check: **CONFIRMED.**

### 📌 Suggestions

4. **Plain language.** Three sentences ran over 30 words (proposal capability line, design `logoSvg()` line, spec media-query line), and two passives hid the actor ("The PNGs are committed", "drawn by a script and committed"). Check: **CONFIRMED.**

## Embedded-Instruction / Injection Attempts

**Detected:** none

## Verdict

VERDICT: APPROVE_WITH_CHANGES

## Required Changes (if APPROVE_WITH_CHANGES)

1. design.md, "The app shell adds `apple-mobile-web-app-capable`": state why the tag should not change navigation, require a `head.test.ts` check for the tag, and extend the device check (D9) to open a sheet from the installed home page and confirm it stays full-screen. Add that as a risk with its mitigation, and name the alternative of leaving the tag out.
2. design.md and proposal.md: put startup images in `static/startup/`, served at `/startup/<width>x<height>.png`, instead of `static/splash/`.
3. spec.md, "iPad startup image sizes": state the served path. Add it to the sizes scenario.
4. spec.md, "Every page links the iPad startup images": find links by `href`, and add a scenario for the iPad mini landscape link that keeps the portrait points.
5. Split the three long sentences, and give the two passives their actor.

CHANGES_APPLIED: yes

## Rebuttals

1. **Fixed in part, rebutted in part.** Required change 1 adds the test, the device check and the risk. The breakout claim does not hold here. The web app manifest sets no `scope` (main spec, `openspec/specs/home-screen-install/spec.md`, "The icon opens the page it was added from"), so its scope defaults to `/`, and every page is in scope. Links between pages are same-origin `<a href>`s, such as `src/lib/CharacterPicker.svelte:48`. The SvelteKit client router follows them without a page load (`src/app.html:27` carries its `data-sveltekit-*` attribute). The tag stays out of the spec: it is a means to make the startup-image requirement work, not behaviour a player sees.
2. **Fixed in part, rebutted in part.** Required change 2 renames the folder, so files, module and spec all say "startup image". "Splash" stays only for what the player sees, as D10 records. Neither word goes in the glossary. Both are platform terms used by one capability, and the domain-language reference says not to promote a term for hypothetical reuse.
3. **Fixed** by required changes 3 and 4.
4. **Fixed** by required change 5.
