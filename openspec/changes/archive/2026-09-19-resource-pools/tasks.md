## 1. Resolve authored pools and stored counts

- [x] 1.1 Add failing resolver tests for valid ordered pools, invalid entries, duplicate ids, unknown colors, and the one-through-twelve maximum; verify the focused test file fails first.
- [x] 1.2 Implement the pure pool resolver and its render-ready types; verify the resolver tests pass.
- [x] 1.3 Add failing resolver tests for missing, invalid, clamped, retired, and inherited-looking map keys; verify the focused test file fails first.
- [x] 1.4 Implement own-key-safe state resolution and correction projections; verify the resolver tests pass.

## 2. Build the pool tracker

- [x] 2.1 Add failing component tests for labels, filled and empty dots, direct selection, and absent reset or rest controls; verify the focused test file fails first.
- [x] 2.2 Implement accessible, contiguous dot rows with named operable controls; verify the component tests pass.
- [x] 2.3 Add failing component tests for rapid changes across pools, failed correction writes, and correction-before-tap ordering; verify the focused test file fails first.
- [x] 2.4 Implement one reactive pool map and ordered state writes; verify the component tests pass.

## 3. Connect pools to the sheet

- [x] 3.1 Add failing route-container tests for loading `pools` with character and HP state, including late route results; verify the focused test file fails first.
- [x] 3.2 Load and pass pool state only for the current character route; verify the route-container tests pass.
- [x] 3.3 Add failing sheet-view tests for pool rendering, palette fallback, and hidden invalid pools; verify the focused test file fails first.
- [x] 3.4 Render the pool tracker in the character view and update Sunny's sample YAML to the defined pool list; verify the sheet-view and YAML integration tests pass.

## 4. Verify the completed story

- [x] 4.1 Run `npm test`; verify every test passes.
- [x] 4.2 Run `npm run build`; verify palette generation and the static build complete successfully.
