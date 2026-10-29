## Why

The install story (#32) shipped placeholder "HS" icons, and left the launch screen to the device. So each time Sunny taps the icon on her tablet, she sees a placeholder and then a plain screen. A real logo, and a splash that shows it, make the installed app feel like hers to open.

## What Changes

- Add a logo mark: the slate (D4). It is drawn as plain SVG shapes in palette colours, with no text.
- Redraw the four home-screen icons (192, 512, 512 maskable and the 180 `apple-touch-icon`) with the slate on the dark base surface. This replaces "HS" on the neutral accent (D5). The maskable icon keeps the whole mark inside its safe zone (D6).
- Add iPad startup images: the slate alone, centred on the dark base surface (D7). There is one for each iPad on sale now, in portrait and in landscape: 10 images (D2). The images are drawn by a script and committed.
- Every page links each startup image with `apple-touch-startup-image` and a media query that matches its screen size and orientation.
- Galaxy Tabs need no new files: Android draws its splash from the redrawn icons and the web app manifest's background colour (D3).
- There is no light-mode splash (D8).

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `home-screen-install`: the "Home-screen icons" requirement drops the "HS until real art ships" placeholder rule. Instead, each icon shows the logo on the dark base surface. A new requirement covers the iPad startup images: their sizes, and the links every page carries.

## Impact

- **Code:** `scripts/generate-icons.ts` (the logo SVG, the icons and the startup images), `src/lib/install/webmanifest.ts` (the list of startup images beside `ICONS` and `APPLE_TOUCH_ICON`), `src/app.html` (the startup-image links).
- **Tests:** `src/lib/install/icons.test.ts` and `src/lib/install/head.test.ts`.
- **Static assets:** the four icons in `static/` are redrawn, and 10 startup images are added there.- **Dependencies:** none new. `sharp` already draws the icons.
- **Verification:** besides the tests, the user checks a real iPad and a Galaxy Tab after deploy (D9).
