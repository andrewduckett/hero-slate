## Story

#48 install-polish — the home-screen icon shows a real Hero Slate logo, and the iPad opens to a logo splash
https://github.com/andrewduckett/hero-slate/issues/48

## Decisions

| # | Question | Answer | Source |
|---|---|---|---|
| D1 | Which devices does the table use? | Current iPads and Samsung Galaxy Tabs. | User |
| D2 | Which iPad screen sizes get a startup image? | Every iPad on sale now: 5 distinct screen sizes (mini, iPad and Air 11", Air 13", Pro 11", Pro 13"), each in portrait and landscape, so 10 images. Older iPads keep the plain screen they show today. | User |
| D3 | What does a Galaxy Tab need? | No new files. Android draws its own splash from the web app manifest: the icon on `background_color`, with the app name. The redrawn icons cover it. | Evidence: W3C Web App Manifest; `src/lib/install/webmanifest.ts` |
| D4 | What is the logo mark? | Concept A, "the slate": a chalk slate in a wooden frame with a gold star, drawn as plain SVG shapes in palette colours, with no text. | User |
| D5 | What colour sits behind the mark on the icons? | The base surface's dark-mode value (`#14171a`), the same as the splash and `background_color`. It replaces the neutral light accent. | User |
| D6 | Must the maskable icon keep the mark in its safe zone? | Yes: the whole mark sits inside the centre circle of 80% diameter. | Evidence: issue #48 Scope |
| D7 | What does the iPad splash show? | The slate alone, centred on the dark base surface. No "Hero Slate" text. | User |
| D8 | Is there a light-mode splash? | No. One dark set only. | Evidence: issue #48 Scope (out) |
| D9 | How is done proven? | Tests check each startup image's existence and pixel size, the media-query links on every page, and the icons' new background. After deploy, the user re-adds the icon on a current iPad (portrait and landscape) and a Galaxy Tab and confirms the logo shows. | User |
| D10 | Does the story need a new glossary term? | No. Specs say "startup image" (Apple's name) for the file, and "splash" for what the player sees. | Assumption |

## Changes from the story

- Changed: the icons' background becomes the dark base surface instead of the neutral accent (D5). The story left the background open.
- Added: a manual check on real devices after deploy (D9).
- Clarified: "current iPad screen sizes" means the iPads on sale now (D2), and Galaxy Tabs need no extra files (D3).

Confirmed by user: yes
