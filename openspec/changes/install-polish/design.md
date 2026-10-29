## Context

- `scripts/generate-icons.ts` draws the four icons from an inline SVG with `sharp`, and writes them to `static/`. It is run by hand (`npm run generate:icons`), and the PNGs are committed. The build does not run it, because different `sharp` versions can render different PNG bytes from the same SVG.
- `src/lib/install/webmanifest.ts` holds `ICONS` and `APPLE_TOUCH_ICON`: the icon files and their sizes. The script, the web app manifest and the tests all read them.
- `src/app.html` is the one app shell. Every page is rendered from it (`ssr = false`, only the shell is prerendered), so a tag in its head is on every page. Its `apple-touch-icon` link is written by hand, and `head.test.ts` checks it against `APPLE_TOUCH_ICON`.
- The current "HS" art uses `<text>` with `font-family="sans-serif"`, so its look depends on the fonts of the machine that runs the script.
- iPad does not build a splash from the web app manifest. It shows a startup image only when a `<link rel="apple-touch-startup-image">` has a media query that exactly matches the screen and orientation. Android builds its own splash from the manifest's icon and `background_color`.

## Goals / Non-Goals

**Goals:**

- One drawing of the logo, used by every icon and every startup image.
- One list of the startup images. The script, the app shell links and the tests all check against it.
- Art that renders the same on any machine: shapes only, no fonts.

**Non-Goals:**

- Running the image script during the build.
- Startup images for iPhones or older iPads.
- Changing the web app manifest. Its icon paths and sizes stay the same.

## Test Seams

- **Primary test seam:** the committed files. Vitest reads each PNG in `static/` with `sharp` (size and pixels) and parses the head of `src/app.html` with `DOMParser`. Both compare against the typed lists in `src/lib/install/`.
- **Existing seams reused:** `src/lib/install/icons.test.ts` and `src/lib/install/head.test.ts`. Both already read these files this way.

## Scrutiny Tier & Blast Radius

- **Tier:** low
- **Blast radius:** static assets in `static/`, one script, a typed list in `src/lib/install/`, and the head of `src/app.html`. No character data, provider, theme tokens or runtime code paths change.

## Decisions

### The logo is one SVG fragment in palette colours

A new `logoSvg()` returns the slate as SVG elements in a 100 × 100 box: a rounded frame in `BASE.structural.dark`, the slate inside it in `BASE.raised.dark`, and a five-point star in `PALETTE.sun.accent.dark`. The background is `BASE.surface.dark`. Each image wraps the fragment in its own `<svg>` with a `transform` that places and scales it. The mark keeps one shape and one colour set at every size. These are the colours of the concept the user picked (D4).

*Alternatives:* a hand-drawn SVG file in the repository. It would need a second source for its colours, and `palette.ts` is the only place colour values live.

The star's centre is filled, so a test can tell that the centre pixel of every image is not the background.

### How large the logo is

- Icons with purpose `any` and the `apple-touch-icon`: the 100-unit box fills the whole icon. The frame then spans 72% of the width.
- The maskable icon: the box is scaled to 80%, around the centre. The frame's farthest corner is then about 37.5% of the width from the centre, inside the 40% safe-zone radius. The test checks this pixel by pixel.
- Startup images: the box is 40% of the image's shorter side, centred. The mark is then about the size of an app icon on the iPad's screen, as on Apple's own launch screens.

### The startup images are listed in one typed module

A new `src/lib/install/startup-images.ts` exports `STARTUP_SCREENS`: the five screens, each with its portrait width and height in points and its pixel ratio. A function expands them into the 10 images. Each image has its `file` (`splash/<width>x<height>.png`, in pixels), its pixel `width` and `height`, its `orientation` and its `media` query.

*Alternatives:* adding the list to `webmanifest.ts`. That module builds the web app manifest, which does not list startup images, so a separate module keeps each one about one thing.

The images go in `static/splash/`, named by their pixel size. That keeps 10 files out of the root of `static/`, and the name says which screen each image is for.

### The app shell carries the links as written tags

The 10 `<link rel="apple-touch-startup-image">` tags are written by hand in `src/app.html`, in the same order as the list. `head.test.ts` checks that the set of `href` and `media` pairs in the shell equals the set the list expands to. This follows the `apple-touch-icon` link.

*Alternatives:*

- Adding them at run time with `<svelte:head>`. The prerendered shell would not hold them, and iPad may read the head before the app script runs.
- Generating `app.html` from a template. That adds a build step to keep 10 lines in line, when a test already does it.

### The script draws the startup images too

`scripts/generate-icons.ts` draws the icons and the startup images from the same logo, so one command (`npm run generate:icons`) redraws all of the art. The PNGs are committed, and the build still does not run the script.

### The app shell adds `apple-mobile-web-app-capable`

The head gains `<meta name="apple-mobile-web-app-capable" content="yes">`. Apple's documentation ties startup images to web apps that set this tag. The web app manifest's `display: standalone` already opens the app full-screen, so the tag changes nothing else. It is a guard against iPad ignoring the startup images without it. The real-device check (D9) is the only test that can prove whether it is needed.

## Risks / Trade-offs

- [iPad ignores the startup images, for example because the links need a tag this design does not add] → The real-device check after deploy (D9) catches it. The fix is in the app shell head only, and the images stay as they are.
- [Apple ships an iPad with a new screen size] → That iPad shows the plain screen, as every iPad does today. Adding it is one entry in `STARTUP_SCREENS`, a new pair of images, and two links.
- [A device keeps its cached "HS" icon after the update] → Re-adding the icon to the home screen picks up the new one. The device check does this.
- [`sharp` antialiasing puts a non-background pixel just outside the maskable safe zone] → The frame's corners sit 2.5% of the width inside the circle. The test checks every pixel outside the circle, so a drift fails it.

## Migration & Rollback

N/A. Nothing changes shape: the icon paths and sizes stay the same, and the new files are additions. To roll back, revert the change. The old icons come back from the repository history.
