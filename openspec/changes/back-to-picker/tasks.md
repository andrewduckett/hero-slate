## 1. Way back to the picker

- [x] 1.1 [easy] The shared header shows a link named "All heroes" to `/`, showing "⌂", only when its caller asks for it; without the request it shows no such link (verify: npm test -- src/lib/AppHeader.test.ts) (✓ npm test -- src/lib/AppHeader.test.ts passed)
- [x] 1.2 [easy] The "All heroes" link sits inside the toggle's opaque accent backing, after the theme toggle, sized and bordered like the toggle (min 44 by 44 CSS pixels) and stacked below it (verify: npm test -- src/lib/AppHeader.test.ts) (✓ npm test -- src/lib/AppHeader.test.ts passed)
- [x] 1.3 [easy] A loaded sheet's header contains the "All heroes" link to `/` (verify: npm test -- src/lib/CharacterView.test.ts) (✓ npm test -- src/lib/CharacterView.test.ts passed)
- [x] 1.4 [easy] The home page's header contains no "All heroes" link (verify: npm test -- src/lib/CharacterPicker.test.ts) (✓ npm test -- src/lib/CharacterPicker.test.ts passed)
- [x] 1.5 [easy] The not-found and invalid results show a "Choose your hero" link to `/` under "Character not found" (verify: npm test -- src/lib/CharacterView.test.ts) (✓ npm test -- src/lib/CharacterView.test.ts passed)
- [x] 1.6 [easy] The error result shows a "Choose your hero" link to `/` under "Could not load this character. Try again.", with a tap target of at least 44 by 44 CSS pixels shared with 1.5 (verify: npm test -- src/lib/CharacterView.test.ts) (✓ npm test -- src/lib/CharacterView.test.ts passed)
- [ ] 1.7 [medium] A reviewer checks in a browser at 360 CSS pixels wide, in light and dark mode, on a sheet with an avatar: the link sits under the toggle, the toggle has not moved, the link is visible over the art, both links are at least 44 by 44, and nothing scrolls sideways; record the check in the pull request (verify: npm run build)
- [ ] 1.8 [easy] A reviewer opens a sheet from its home-screen icon, taps "All heroes", sees the home page still full-screen, and records the check in the pull request (verify: npm run build)
- [ ] 1.9 [easy] The full suite and the static build pass (verify: npm test && npm run build)
