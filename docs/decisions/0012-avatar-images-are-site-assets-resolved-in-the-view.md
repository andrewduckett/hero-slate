# 0012. Avatar images are site assets, resolved in the view

- Status: accepted
- Date: 2026-10-28
- Supersedes: none
- Superseded by: none

## Context

A character sheet can carry a portrait. The character file names it in an
`avatar` field, and the identity header and the picker card show it. The sheet is
a static site, and its main reader is a child. Decision 0005 keeps the page from
requesting anything from another host, for privacy and for offline use; it was
written for fonts, and an image is the next thing an author could point at a
third-party server.

The field also sits on a trust boundary. Whatever `avatar` holds becomes an
image's `src`. A remote URL reports every visit to that host. A `javascript:` or
`data:` value is not an image at all.

Two layers could enforce a rule: the data provider that validates the file, or the
view that renders the image. The provider already treats `color` as data it does
not interpret, and the theming layer falls back to neutral when a colour makes no
sense, so a bad value never breaks a sheet.

## Decision

An avatar is a site path: a string that starts with `/` and not `//`, naming a
file the site itself serves. The provider checks only that `avatar` is a string
and carries it through. The view resolves it with one pure function, and shows
an image only when the value is a site path. Anything else renders as if the
character had no avatar: no image element, no request, no error.

We rejected accepting remote URLs. They make the page report visits to another
host, and they do not work offline. We rejected rejecting non-site paths in the
provider. That would turn a typo in a decorative field into "Character not
found", and would put rendering knowledge in the data layer. We rejected an
allow-list of hosts. It needs maintenance and still leaks visits.

## Consequences

- Authors put art under `static/` and write `avatar: /characters/<id>.png`. A
  copied D&D Beyond or Discord image URL shows nothing, by design.
- The page's third-party-request rule now covers images as well as fonts.
- The site-path check lives in one function, so a later hosted backend keeps the
  same rule by serving images from the site's own origin.
- A future feature that wants uploaded or remote art must change this record, not
  just the check.
