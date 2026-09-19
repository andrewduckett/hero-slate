# 0005. Self-hosted fonts, with no third-party requests from the sheet

- Status: accepted
- Date: 2026-09-19
- Supersedes: none
- Superseded by: none

## Context

Hero Slate shows Dungeons & Dragons character sheets to players at the table. The
main player is a child. The site is static: it builds to plain files that Cloudflare
serves, with no server code.

The sheet needs web fonts to look polished. The usual way to add web fonts is to
link a font service, such as Google Fonts, from the page. The browser then fetches
the font stylesheet and files from that service's servers on each first visit.

That approach has two costs here:

- **Privacy.** Every visit tells a third party that a device opened the page. The
  request carries the device's IP address and the page address. We do not want a
  child's page to report visits to anyone but our own host.
- **Offline use.** The roadmap makes the sheet work with no network at the table. A
  font on another host is one more thing the offline cache must reach and keep.

## Decision

We serve every font from the site's own origin. The font files and their licences
live in the repository and ship with the static build. The stylesheet declares
them with paths on our own site. The page makes no request to any other host for
fonts, or for font stylesheets.

We only use fonts whose licence allows this kind of redistribution, such as the SIL
Open Font License. Each font's licence file ships next to the font files.

We rejected a font CDN for the privacy and offline reasons above. We rejected
installing fonts as npm packages that the bundler copies into the build. The
bundler would not copy the licence files into the build, and a vendored file is
easier to audit.

## Consequences

- The page makes no font requests to third parties. The offline cache only needs our
  own files.
- We update fonts by hand. A new font version means replacing the vendored files.
- The repository carries a few hundred kilobytes of binary font files.
- Any later change that adds a font must follow the same rule. A test fails if a
  font source names another host.
