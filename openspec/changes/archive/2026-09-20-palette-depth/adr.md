# ADR Review Manifest

- Status: completed
- Review date: 2026-09-20

## Review Summary

ADR review completed for this change. We read every in-force record under
`docs/decisions/`, built the supersession graph, and checked each decision in
`design.md` against the bar for a durable record.

No record in force is superseded by this change. The supersession graph is flat:
every record reads `Supersedes: none` and `Superseded by: none`. The highest
sequence number in use was 0005, so the new record takes 0006.

Two decisions met the bar. Two did not, and we record why below rather than inventing
records for them.

## In-Force ADRs Reviewed

- `docs/decisions/0001-static-first-sveltekit-on-cloudflare-workers.md` — static-first
  hosting. Still in force. This change ships no server code, so it holds.
- `docs/decisions/0002-character-data-behind-a-provider-interface.md` — character data
  behind a provider interface. Still in force. This change adds no field to the
  character definition and does not touch the provider.
- `docs/decisions/0003-per-device-state-behind-a-key-value-store-interface.md` —
  per-device state behind a key-value store. Still in force and untouched.
- `docs/decisions/0004-rich-text-rendered-as-token-tree-not-html-string.md` —
  rich text as a token tree. Still in force. The dice pill changes colour tokens
  only, never how it renders.
- `docs/decisions/0005-self-hosted-fonts-no-third-party-requests.md` — self-hosted
  fonts. Still in force and untouched.

## New Durable ADRs Created

- `docs/decisions/0006-palette-tokens-separate-fills-from-marks.md` — a palette name
  defines four colours, and the readable-as-text rule belongs to `deep` rather than
  to `accent`.
- `docs/decisions/0007-colour-marks-meaning-not-identity.md` — colour marks what a block
  is rather than whose sheet it is. Hit points, armour class, speed and initiative take
  fixed roles; the character's colour keeps the header and the ability tiles.

## Decisions That Did Not Meet the Bar

- **The role-to-palette mapping** (health to `fire`, armour to `ocean`, speed to
  `forest`, initiative to `sun`). The *principle* behind it is recorded in `0007`. Which
  palette name each role points at is not: it is one table, a line per row, and changing
  a role from `ocean` to `forest` forecloses nothing.
- **The starting colour values.** The contrast tests gate them, and `palette.ts`
  already states that it is the only place a colour value lives. A reader learns
  these by reading them.
- **Borders rather than shadows for separating cards.** This is styling. It is
  reversible per component and needs no shared understanding to change.
