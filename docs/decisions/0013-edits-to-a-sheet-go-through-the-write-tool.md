# 0013. Edits to an existing sheet go through the write tool's edit mode

- Status: accepted
- Date: 2026-11-25
- Supersedes: 0009, for its rule that the write tool never overwrites an existing character only
- Superseded by: none

## Context

Decision 0009 split the D&D Beyond ingest into tested tools and an agent. The
agent drafts a character file; a preview tool reads the draft with the app's
own rules and shows the Author the sheet the app will draw; a write tool runs
the same checks again and saves the draft exactly. 0009 also said the write
tool never overwrites an existing character. That rule kept a new sheet from
replacing an old one by mistake.

Character files still change after they are first written. The Author
levels a character up, adds a spell, renames a row or changes a colour. Until
now those changes were hand edits, by the Author or by an agent with no
guided flow. Nothing checked the result before it was saved, and nothing
showed the Author what an edit would change.

Two silent losses make an unchecked edit risky. The app keeps each resource
pool's remaining uses on each device under the pool's id, so renaming or
removing a pool id resets those uses everywhere. And a character file
carries comments that matter, such as the first line that records how its
avatar was made; rewriting the file with a YAML library drops them.

## Decision

Every save of a changed character file goes through the write tool, in an
*edit mode* the Author's agent turns on with a flag. In edit mode:

- the preview tool requires the character file to exist, validates the
  draft with the same checks as a new sheet, draws it, and lists every
  change against the saved file; it warns about a removed or renamed pool
  id and about each comment the draft lost
- the write tool requires the file to exist, validates the draft again,
  and replaces the file with exactly the draft's bytes

Without the flag, both tools keep 0009's rule: they refuse a file that
already exists. The rest of 0009 still applies.

## Consequences

- Every saved character file, new or changed, has passed the same checks,
  and the Author has seen a preview of it before approving.
- The Author sees a short list of what changed beside the drawn sheet, so a
  small edit to a long sheet is easy to find and approve.
- A later refresh of a sheet from D&D Beyond can reuse edit mode and the
  digest cross-check without a new save path.
- The write tool can now replace a tracked file. Replacing needs the
  explicit flag, and git keeps the previous version, but a bug in edit
  mode could damage a sheet. Its tests must cover the replace path.
- The tools still cannot prove that the Author approved a draft. As in
  0009, that depends on the skill following its instructions.
- A hand edit with no tool stays possible. The tools guard the guided flow,
  not the file system.

## Alternatives considered

**The agent edits the saved file directly after a preview.** The preview
tool would read a draft, and the agent would then apply the same change to
the saved file itself. This needs no change to the write tool. We rejected
it because the saved bytes are no longer the bytes that were checked: the
agent can make a different edit from the one it previewed, and nothing
catches it.

**A separate edit tool.** A second command-line tool would own reading,
comparing and replacing an existing file. We rejected it because it would
copy the draft validation, the preview drawing and the cross-check that the
ingest tools already wire together, and the two copies would drift.

**Keep the no-overwrite rule and save an edit under a new id.** The Author
would edit a copy and switch the character manifest to it. We rejected it
because a new id resets every device's tracked state for the character,
including hit points and pool uses, and leaves the old file behind.
