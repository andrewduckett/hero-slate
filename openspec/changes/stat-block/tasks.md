## 1. Domain layer: modifier and resolvers

- [ ] 1.1 Write failing tests for the ability modifier function in `src/lib/character/`: value 14 → "+2", value 10 → "+0", value 8 → "-1", value 0 → "-5", value -1 → "-6", and value 9.5 → "-1" (the negative fractional case proves `floor`, not `trunc`). Also cover a usable string modifier "+5" winning over the computed value, and an ignored modifier (number 3, empty string, or whitespace) falling back to the computed "+2", and a missing/non-finite value with no usable modifier → "—". Verify the tests fail.
- [ ] 1.2 Implement the modifier function so the tests from 1.1 pass. Verify the modifier tests pass.
- [ ] 1.3 Write failing tests for the abilities resolver: it keeps valid entries in authored order; it drops `null`, a bare number, an array, a boolean, an object with no label, and an object with an empty or whitespace-only label; it keeps two entries with the same label; it never recurses into nested objects/arrays; and it returns an empty result when `abilities` is absent, not a list, or a list whose members are all invalid. Verify the tests fail.
- [ ] 1.4 Implement the abilities resolver so the tests from 1.3 pass. Verify the abilities resolver tests pass.
- [ ] 1.5 Write failing tests for the combat resolver: a string value renders verbatim; a finite number renders as its parsed value; a missing value, `null`, boolean, `NaN`, `Infinity`, array, or object → "—"; any `modifier` field is ignored; an entry with no usable label is dropped; and a non-list input returns an empty result. Verify the tests fail.
- [ ] 1.6 Implement the combat resolver so the tests from 1.5 pass. Verify the combat resolver tests pass.

## 2. Stat-block components

- [ ] 2.1 Write a failing component test for the abilities block: it renders entries in order with the modifier and the raw score as separate, identifiable elements; it shows no raw score when the value is not a finite number; and it renders nothing when the resolved list is empty. Prove the escaping boundary through the always-rendered text paths: given a label `<b>x</b>` and a usable authored modifier `<img src=x>`, assert each literal string is visible and query the DOM to confirm no `<b>` or `<img>` element was created. Verify the test fails.
- [ ] 2.2 Implement the abilities block component, styled as a distinct treatment per design.md (the abilities and combat blocks must render under separately identifiable containers). Verify the test from 2.1 passes.
- [ ] 2.3 Write a failing component test for the combat block: it renders each label with its value (string verbatim, finite number as its value), shows "—" for a non-renderable value, and renders nothing when the resolved list is empty. Prove the escaping boundary: given a value `<img src=x>`, assert the literal string is visible and no `<img>` element exists. Verify the test fails.
- [ ] 2.4 Implement the combat block component, styled as a distinct treatment per design.md. Verify the test from 2.3 passes.

## 3. Sheet integration

- [ ] 3.1 Extend the `CharacterView` test: a found character renders the identity header, then the abilities block, then the combat block; a character with malformed `abilities`/`combat` (for example a list of only invalid members) renders the header with neither block and raises no error. Verify the test fails.
- [ ] 3.2 Wire both blocks into `CharacterView.svelte` under the header, sourced through the resolvers. Verify the test from 3.1 passes.

## 4. Sample data migration

- [ ] 4.1 Migrate `static/characters/sunny.yaml` from its `abilities`/`combat` maps to two authored lists of `{ label, value }` entries, using full D&D label strings in the sample (Strength, Dexterity, …; Armor Class, Speed, Initiative) — sample content only, no runtime default labels. Extend the Sunny integration test to assert both fields resolve to arrays, in authored order, with the expected labels and values. Verify the test passes.

## 5. Verification

- [ ] 5.1 Run `npm test` and `npm run build`. Confirm the full suite passes and the static build succeeds.
