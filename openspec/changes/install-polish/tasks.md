## 1. The startup-image list

- [x] 1.1 [easy] `STARTUP_SCREENS` in `src/lib/install/startup-images.ts` expands to 10 startup images, one per iPad screen in the spec's table and orientation. Each image has its file `startup/<width>x<height>.png` in pixels, its pixel width and height (swapped in landscape), its orientation, and a media query that uses the portrait points in both orientations, such as `(device-width: 744px) and (device-height: 1133px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)` for `startup/2266x1488.png`. No two media queries are equal (verify: npx vitest run src/lib/install/startup-images) (✓ npx vitest run src/lib/install/startup-images passed)

## 2. The art [depends-on: 1]

- [x] 2.1 [medium] `npm run generate:icons` redraws the four home-screen icons with the slate logo (frame `BASE.structural.dark`, slate `BASE.raised.dark`, star `PALETTE.sun.deep.dark`) on `BASE.surface.dark`, at the sizes in design.md, and the redrawn PNGs are committed. In each icon, the top-left pixel is the dark base surface and the centre pixel is not (verify: npx vitest run src/lib/install/icons) (✓ npx vitest run src/lib/install/icons passed)
- [x] 2.2 [medium] On the maskable icon, every pixel outside the centre circle whose diameter is 80% of the width is the dark base surface (verify: npx vitest run src/lib/install/icons) (✓ npx vitest run src/lib/install/icons passed; fails when the maskable logo is drawn unscaled)
- [x] 2.3 [medium] `npm run generate:icons` also draws the 10 startup images into `static/startup/`: the slate alone, centred, its box 40% of the shorter side, on the dark base surface. They are committed. Each is a PNG at its listed pixel size, its top-left pixel is the dark base surface, and its centre pixel is not (verify: npx vitest run src/lib/install/icons) (✓ npx vitest run src/lib/install/icons passed)

## 3. The app shell head [depends-on: 1]

- [x] 3.1 [parallel] [easy] `src/app.html` links all 10 startup images with `rel="apple-touch-startup-image"`. The set of `href` and `media` pairs in its head equals the set `STARTUP_SCREENS` expands to, with each `href` starting with `/` (verify: npx vitest run src/lib/install/head) (✓ npx vitest run src/lib/install/head passed)
- [x] 3.2 [parallel] [easy] `src/app.html` carries `<meta name="apple-mobile-web-app-capable" content="yes">` (verify: npx vitest run src/lib/install/head) (✓ npx vitest run src/lib/install/head passed)

## 4. Integration [depends-on: 2, 3]

- [x] 4.1 [easy] The full suite passes, and the static build holds every startup image beside the icons, such as `build/startup/1488x2266.png` and `build/icon-512-maskable.png` (verify: npm test && npm run build && test -f build/startup/1488x2266.png && test -f build/startup/2752x2064.png) (✓ npm test: 888 passed; npm run build passed; both startup files in build/)
- [ ] 4.2 [easy] The pull request description lists the after-deploy device check (D9): on a current iPad, remove the old icon and add it again, then open it in portrait and in landscape and see the slate splash; open a sheet from the installed home page and confirm it stays full-screen; on a Galaxy Tab, add the icon again and see the slate icon and splash (verify: gh pr view install-polish --json body --jq .body | grep -q 'stays full-screen')

## Deviations Ledger

- 2.2: the maskable icon's 80% scale shipped with 2.1, because the script draws all four icons in one pass. So 2.2 adds only the safe-zone test. It passes on the committed art, and fails when the maskable logo is drawn at full size.
