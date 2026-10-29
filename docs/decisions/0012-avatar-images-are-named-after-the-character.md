# 0012. Avatar images are named after the character, located by the provider

- Status: accepted
- Date: 2026-10-28
- Supersedes: none
- Superseded by: none

## Context

A character sheet can carry a portrait, which the identity header and the picker
card show. The sheet is a static site, and its main reader is a child. Decision
0005 keeps the page from requesting anything from another host, for privacy and
for offline use. It was written for fonts, and an image is the next thing that
could point at a third-party server.

Whatever names the image becomes an `<img>` element's `src`, so it is a trust
boundary. If authors could write it, a remote URL would report every visit to
that host, and a crafted path such as `/\host` would reach another host too.

Every character already has a stable id that the provider checks against a strict
grammar, and the provider already turns that id into a location:
`/characters/<id>.yaml` (decision 0002).

## Decision

A character's avatar is the image named after its id, `/characters/<id>.png`.
Character files have no avatar field; the provider ignores one if it is there.
The provider builds the URL from the validated id and puts it on the character
and its summary. The view shows the image at that URL, and drops it if it fails
to load. The provider does not check that the file exists, so a character with no
art costs one failed request on the site's own origin.

We rejected an authored `avatar` field checked by a site-path resolver. It works,
but it is input the sheet does not need, and the check has to know how browsers
rewrite URLs. We rejected building the path in the view from the id. Only the
provider knows where character files live, and a hosted provider will keep
images somewhere else. We rejected an existence check before showing the image.
On a static site, that would cost the same request the image itself makes.

## Consequences

- Authors add art by putting `<id>.png` next to `<id>.yaml`. There is nothing to
  type, and no way to point at another host.
- The page's no-third-party-requests rule now covers images as well as fonts.
- Characters without art make one failed request per view. The image is dropped
  and the layout is the same as before.
- A later hosted provider returns its own avatar URL. It must keep that URL on the
  site's own origin, or change this record.
- Art in another format, or more than one image per character, needs a change to
  this record.
