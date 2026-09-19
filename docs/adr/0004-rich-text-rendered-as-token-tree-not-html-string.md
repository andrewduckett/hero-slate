# 0004. Rich-text rendered as a token tree, not an HTML string

- Status: accepted
- Date: 2026-09-19
- Supersedes: none
- Superseded by: none

## Context

The app lets an author write short freeform prompts in a character's YAML file.
These prompts appear on the sheet during play, so a child may be reading them at
the table. The prompts support a small inline markup grammar: bold, italic, emoji,
and display-only dice pills.

The app has no backend. Character data goes from a YAML file, fetched over the
network, straight into the page. The file is edited by hand on GitHub — but the
author and the player are different people. An adversarial file, or a mistake
that accidentally resembles an HTML tag, must never execute as code or break the
page layout.

There are two well-established ways to render a markup grammar in a browser:

1. **Build an HTML string.** Parse the markup, produce a sanitized HTML string,
   and inject it with a raw-HTML slot (`innerHTML`, or the framework equivalent).
   This requires a sanitizer — a separate library, or a carefully maintained
   allowlist — to strip or escape anything dangerous before the string lands in
   the DOM.

2. **Build a token tree.** Parse the markup into a plain data structure — a tree
   of typed nodes — and walk the tree with the framework's own element and text
   primitives. Text nodes ride the framework's default escaping, so the browser
   receives only escaped characters, never markup.

## Decision

We render rich text from a token tree. We never build an HTML string or use
`{@html}` (SvelteKit's raw-HTML escape hatch) anywhere in the rich-text path.

The parser produces a small typed tree of node kinds: text, bold span, italic span,
and pill (for `[[...]]` tokens). The renderer is a recursive Svelte component that
walks that tree. When it reaches a text node, it binds the string to a Svelte text
slot; Svelte escapes it automatically. No HTML string is ever constructed.

We rejected the HTML-string approach for two reasons. First, XSS safety becomes a
runtime filter: the sanitizer must be correct, kept up to date, and tested against
every dangerous pattern. A gap in the allowlist is a vulnerability. With the token
tree, there is nothing to filter — the attack surface does not exist. Second, the
HTML-string path adds a sanitizer dependency (or a bespoke allowlist), which is
maintenance weight we are not willing to carry in a static, no-backend app aimed at
a child audience.

We also considered `{@html}` with a carefully written internal sanitizer. We
rejected it for the same reason: its safety property lives in a runtime check.
Structure is more reliable than a check.

## Consequences

- Authored body text cannot inject markup, execute scripts, or break the page
  layout, by construction. No sanitizer library is needed, and no sanitizer test
  maintenance is required.
- The adversarial test cases in the spec (`<script>` tags, injected attributes,
  HTML inside emphasis) all verify the same property: text nodes carry the
  characters, never the markup. Those tests are simple and stable.
- The token tree is a pure data structure, so the parser is a pure function. It
  has no browser dependency and runs in any test environment.
- Adding a new markup kind — a link, a superscript, a highlight — means adding a
  new node kind to the tree and a new case to the renderer. It does not change the
  safety property.
- We accept that the parser is a small amount of custom code rather than a reused
  library. The grammar is intentionally tiny (four node kinds), so the parser is
  straightforward to write, read, and maintain.
- `{@html}` is permanently out of scope for the rich-text path. Any future
  contributor proposing it should read this ADR first: the decision is deliberate
  and the safety property is the reason.
