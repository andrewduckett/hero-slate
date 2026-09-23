## REMOVED Requirements

### Requirement: Automatic light and dark

**Reason**: This change reverses the no-toggle contract. Light/dark is no longer a pure device-following behavior with no control. A manual toggle now exists, a player's choice persists and overrides the device, and dark becomes the resting default when the device states no preference. The follow-the-device behavior is preserved by the new `Device preference sets the mode until a choice` requirement.

**Migration**: No config or data changes. The device-following behavior continues for any player who has not chosen a mode. A player who wants the other mode now uses the on-screen toggle instead of a device setting.

## ADDED Requirements

### Requirement: Device preference sets the mode until a choice

Until a player chooses a mode by hand, the system SHALL follow the device's light or dark preference. When the device prefers dark, the sheet SHALL render each palette's dark-mode values and the dark-mode surface. When the device prefers light, the sheet SHALL render each palette's light-mode values and the light-mode surface.

The device path for dark is the stylesheet's base `:root`. The device path for light is the `@media (prefers-color-scheme: light)` block. When no player choice is stored and the device preference changes while the sheet is open, the sheet SHALL switch modes with no reload and no user action.

#### Scenario: Dark device with no stored choice

- **WHEN** the device prefers dark and the player has stored no choice
- **THEN** the sheet renders the dark-mode surface, body text, and accent values

#### Scenario: Light device with no stored choice

- **WHEN** the device prefers light and the player has stored no choice
- **THEN** the sheet renders the light-mode surface, body text, and accent values

#### Scenario: Mode change while the sheet is open

- **WHEN** the device switches from light to dark while a sheet is open and no choice is stored
- **THEN** the surface, body text, header accent, and header text update to the dark-mode values
- **AND** the sheet does not reload

### Requirement: Dark is the resting default

The stylesheet's base `:root` SHALL carry the dark-mode values. This base applies whenever no `data-theme` choice is set and no `prefers-color-scheme` media query matches. This makes dark the fallback the sheet renders when nothing else selects a mode.

This is the observable rule: dark applies when the light media query does not match and no choice is stored. A device that reports a light or dark preference still resolves through its media path. Current browsers usually report `light` for a device that never set a preference, so this dark fallback is reached mainly in the prerendered shell and in a browser that reports no preference at all.

#### Scenario: The base carries the dark values

- **WHEN** a test reads the base `:root` values in the emitted stylesheet, outside any media query and any `data-theme` selector
- **THEN** those values are the dark-mode surface, foreground, and base tokens

#### Scenario: The dark base is the fallback when no light query matches

- **WHEN** no `data-theme` choice is set and the `prefers-color-scheme: light` query does not match
- **THEN** the sheet renders the dark-mode values from the base `:root`

### Requirement: Manual mode toggle

The system SHALL show a control that switches the sheet between light and dark by hand. The control SHALL be present on every route, including a route that renders no character. Activating the control SHALL switch the sheet to the other mode at once, with no reload. A chosen mode SHALL override the device preference until the player chooses again.

The control SHALL be a button with an accessible name that states its action. The control SHALL be operable by keyboard. The control SHALL expose its current state to assistive technology, so a player using a screen reader can tell which mode is active.

#### Scenario: Toggling switches the mode

- **WHEN** a player views the sheet in dark mode and activates the toggle
- **THEN** the sheet switches to light mode at once, with no reload

#### Scenario: A choice overrides the device preference

- **WHEN** a player on a dark-preferring device chooses light
- **THEN** the sheet renders in light mode
- **AND** it stays in light mode though the device prefers dark

#### Scenario: The toggle is present without a character

- **WHEN** a player opens a route that renders no character
- **THEN** the mode toggle is present and switches the mode

#### Scenario: The toggle is a labeled, keyboard-operable button

- **WHEN** a test inspects the toggle control
- **THEN** the control is a button with an accessible name
- **AND** it is reachable and operable by keyboard
- **AND** it exposes whether light or dark is active

### Requirement: The chosen mode persists per device

The system SHALL store a player's chosen mode and reuse it on the next load. It SHALL store the mode as one value shared across every route and character, not a per-character value. A read after a reload SHALL return the last chosen mode. This value is per device, in the same sense as other per-device state: it is scoped to the browser origin and profile, and does not sync across devices this release.

The system SHALL accept a stored mode only when it is exactly `light` or `dark`. The inline pre-paint script and the preference module SHALL use this same allowlist. Any other stored value SHALL be treated as no choice, so the sheet follows the device preference.

#### Scenario: A choice survives a reload

- **WHEN** a player chooses light, then reloads the page
- **THEN** the sheet loads in light mode

#### Scenario: The choice is shared across characters

- **WHEN** a player chooses dark on one character's sheet, then opens another character
- **THEN** the second sheet also loads in dark mode

#### Scenario: A malformed stored value is ignored

- **WHEN** the stored mode is any value other than `light` or `dark`, such as an empty string or `system`
- **THEN** the sheet treats it as no choice and follows the device preference
- **AND** no error is raised

#### Scenario: Cleared storage returns to the device preference on next load

- **WHEN** a player has chosen a mode, then storage is cleared, then the page loads again
- **THEN** the sheet follows the device preference
- **AND** this release provides no on-screen control to reset a choice within an open tab

### Requirement: Storage failure never blocks the sheet

The system SHALL render the sheet even when device storage cannot be read or written. When a read throws or is blocked, the system SHALL treat the mode as no choice. It SHALL then follow the device preference. When a write throws or is blocked, the sheet SHALL still switch mode for the current view. The choice does not persist in that case, and that is accepted.

#### Scenario: Unreadable storage falls back to the device

- **WHEN** reading the stored mode throws, such as in a browser that blocks storage
- **THEN** the sheet renders following the device preference
- **AND** no error reaches the player

#### Scenario: An unwritable choice still switches the view

- **WHEN** a player toggles the mode and writing to storage throws
- **THEN** the sheet still switches to the chosen mode for the current view
- **AND** no error reaches the player

### Requirement: No flash of the wrong mode

The system SHALL apply the resolved mode before the first paint. The sheet SHALL NOT show one mode and then switch to another on load. The prerendered shell SHALL set the mode from the stored choice, or from the device preference when no valid choice is stored, before it paints content.

#### Scenario: A stored light choice paints light first

- **WHEN** a player who chose light opens the sheet on a dark-preferring device
- **THEN** the first paint is in light mode
- **AND** the sheet does not flash dark before switching

### Requirement: Contrast holds on the chosen-mode path

The emitted stylesheet renders each mode two ways: a device path and a `data-theme` choice path. For dark, the device path is the base `:root`; for light, it is the `@media (prefers-color-scheme: light)` block. The choice path for each mode is a `:root[data-theme="<mode>"]` selector.

For each mode, the device path and the choice path SHALL carry identical color values. So a chosen mode can never reach a color pairing the device path did not carry. Every contrast rule this capability states for a mode SHALL therefore hold on the choice path too. A test SHALL read the emitted stylesheet and confirm the two paths carry the same values for each mode.

#### Scenario: Both paths carry the same values for a mode

- **WHEN** a test reads the dark values from the base `:root` and from the `:root[data-theme="dark"]` selector
- **THEN** the two sets of values are identical
- **AND** the same holds for the light `@media` values and the `:root[data-theme="light"]` values

#### Scenario: Contrast passes on a chosen mode

- **WHEN** a test computes the contrast pairings this capability requires from the values emitted under a `data-theme` selector
- **THEN** every pairing meets the same ratio it meets on the device path
