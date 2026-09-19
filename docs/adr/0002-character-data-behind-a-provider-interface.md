# 0002. Character data behind a provider interface

- Status: accepted
- Date: 2026-09-18
- Supersedes: none
- Superseded by: none

## Context

The app renders character sheets from data that today lives in hand-edited files. A later phase may move that data to a hosted database served over an API. We want that move to swap one component, not to ripple through every screen.

If the user interface reads files directly, the data source is welded into the whole app. Every screen that loads a character would need rewriting to move to an API. That is the trap we want to avoid.

A character is identified by a stable logical id, such as `sunny`. The id must not be a file name. A file name binds the app to file storage; a logical id can resolve to a file today and a database record tomorrow.

## Decision

We put all character loading behind a single data-provider interface. The interface exposes an operation that returns a character definition for a logical id. The user interface depends only on this interface, never on a storage location or a file path.

This release ships one implementation that fetches and parses a file at runtime. A later phase can add a second implementation that calls an API, behind the same interface, without changing any screen.

We chose the interface over reading files directly because the interface is cheap to define now and removes the data trap. We use a logical id rather than a file name so the same id survives the move to a database.

We fix the identity fields as the stable part of the shape now. This release renders and validates only identity, so identity is the only part we can pin with confidence. We carry the other fields as provisional: abilities, combat metrics, pools, and sections. Later changes own their meaning and will define them when they render them. This avoids pinning a contract we cannot yet justify.

## Consequences

- Moving to a hosted backend swaps the provider implementation; screens stay unchanged.
- Logical ids stay stable across the move from files to a database, so URLs and stored keys keep working.
- We accept one layer of indirection that a file-only app would not need. It is small and it is the point.
- The live-tracking state store, added in a later change, will follow this same interface pattern for the same reason.
