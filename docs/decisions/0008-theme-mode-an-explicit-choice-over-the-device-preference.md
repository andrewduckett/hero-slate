# 0008. Theme mode: an explicit choice layered over the device preference

- Status: accepted
- Date: 2026-09-22
- Supersedes: none
- Superseded by: none

## Context

The app renders a character sheet that a child reads at a game table. It supports a light and a dark color scheme. Until now the scheme followed the device's `prefers-color-scheme` setting alone, through a pure CSS media query, with no control on the page. That was a deliberate simplicity: the colors switched with no script and no stored state.

Two needs now push against that simplicity. First, we want dark by default at the table. But a device that states no preference resolves to light in current browsers, so pure media-query following cannot give us that. Second, a player who wants the other mode should switch it on the page, not by leaving to change a device setting.

Adding a control means the page now holds a mode that can disagree with the device. That raises two questions this decision must settle. How does an explicit choice relate to the device preference? And where does the chosen mode live, given the app already has a store for per-device state?

A related constraint shapes the second question. The app already keeps per-device *character* state, such as current hit points, behind a key-value store. That store keys every value by a character's logical id, so a future hosted database can sync the state across a player's devices. The theme mode is per-device too. But it belongs to no character, and screens that show no character still read it.

## Decision

We resolve the mode by a fixed precedence: an explicit choice wins, else the device preference, else dark. Dark is the resting default when the device states nothing.

We express this in the stylesheet, not in script. The generated CSS carries each mode twice. One copy is the device path: the base rules hold dark, and a `prefers-color-scheme: light` media query holds light. The other copy sits under a `data-theme` attribute that a stored choice sets on the document root. The attribute's selector outranks the device path, so a choice overrides the device whatever it prefers. When no choice is stored, no attribute is set, and the device path drives the colors on its own, as before.

We considered driving the colors from JavaScript that reads the choice and swaps values. We rejected it. The media query already switches colors with no script, and a script-driven swap would need care to avoid a wrong-mode flash on every load.

We keep the chosen mode **out of** the character-state store. It is a single global value in device storage under one key. We considered routing it through that store, to have one place for per-device state. We rejected that for two reasons. First, the store keys every value by a character's logical id, and the mode belongs to no character. Second, the store is built to sync per-character state across a player's devices later. A display mode is a poor fit for that sync: a tablet in dark and a phone in light is a reasonable state, not a conflict to resolve.

To stop the wrong mode from painting first, a small static script in the page head reads the stored choice and sets the `data-theme` attribute before the body paints. The prerendered shell serves before the app hydrates, so this pre-paint step, not the app, sets the initial mode.

## Consequences

- A player switches mode on the page, and the choice persists per device and survives a reload.
- The colors still switch with no script for anyone who has made no choice, so the common path keeps its original simplicity.
- The head script repeats the storage key as a literal string, because it cannot import the module that owns the key. A test ties the two together so they cannot drift.
- The stylesheet grows: each mode's values appear under both the device path and the `data-theme` selector. The file stays small and static. A test asserts the two paths carry identical values, so a choice can never reach an unchecked color pairing.
- The theme mode will not ride the future account sync that the character-state store is built for. If cross-device mode sync is ever wanted, it needs its own decision; this one keeps the mode a local device setting.
- This reverses the earlier "pure media query, no toggle" constraint recorded in the project guide. That guide and the affected release stories are amended in the same change.
