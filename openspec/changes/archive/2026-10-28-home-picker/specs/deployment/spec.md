## ADDED Requirements

### Requirement: Character manifest ships as a public asset

The system SHALL place the character manifest where the build serves it at `/characters/manifest.yaml`. The deployed site SHALL return the file at that path, and the single-page fallback SHALL NOT capture it.

#### Scenario: Deployed site serves the manifest

- **WHEN** a request is made to `/characters/manifest.yaml` on the built site
- **THEN** the response status is 200
- **AND** the body is the character manifest YAML, not the app shell
