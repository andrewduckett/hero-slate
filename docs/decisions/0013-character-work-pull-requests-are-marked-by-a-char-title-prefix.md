# 0013. Character work pull requests are marked by a `char:` title prefix

- Status: accepted
- Date: 2026-11-25
- Supersedes: none
- Superseded by: none

## Context

Character work is creating or changing a character's files, and it changes
nothing outside `static/characters/`. Agents that help the Author are told
this in prose, and an agent can ignore prose. A CI check can enforce it, but
only on a pull request it knows is character work. A feature pull request may
change character files and code together, so the check cannot judge every
pull request. Something on the pull request must say "this is character
work", and agents must apply that mark reliably.

## Decision

A pull request is a character work pull request when its title starts with the
exact, lowercase prefix `char:`. The check reads only the title. The commits inside
the pull request keep their Conventional Commits types, such as `feat:`.

GitHub re-runs a check when a title is edited, so the Author or an agent can
add or remove the mark at any time and the check follows at once.

## Alternatives considered

- **A branch name that starts with `character/`.** A branch name cannot change
  once the pull request is open, so a wrong mark needs a new pull request. The
  name must be chosen before the work starts, and tools often pick branch
  names themselves.
- **A GitHub label.** A label is a repository setting that must exist before
  anyone can use it, and agents add labels less reliably than they write
  titles. Labels are also easy to miss when reading a pull request list.
- **`char:` on every commit as well.** The repository's commit rule is
  Conventional Commits, and a second commit vocabulary would split it. The
  check needs one mark, and the title is enough.
- **A looser match, such as any case or leading spaces.** Each extra spelling
  is another form that people and agents must learn and that the check must
  accept. One exact form is easier to state and to test.

## Consequences

- Easier: the mark is visible in every pull request list, any agent that can
  open a pull request can set it, and fixing a wrong mark is a title edit.
- Easier: the commit rule stays as it is.
- Harder: a pull request of character work without the mark is not checked. The mark depends
  on the agent or the Author remembering it, so the boundary reference must
  state the rule.
- Harder: `char:` looks like a Conventional Commits type in a title but is not
  one. Tools that parse pull request titles as Conventional Commits would not
  recognise it.
- Changing the mark later means changing the glossary, the boundary reference,
  the CI check and the habit of every agent that follows them.
