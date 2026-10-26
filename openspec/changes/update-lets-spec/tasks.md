## 1. Move to Let's Spec 0.6.0

- [x] 1.1 [easy] `mise.toml` pins `"github:sidereal-io/lets-spec" = { version = "0.6.0" }` in place of the `andrewduckett/lets-spec` 0.3.0 line, keeps the OpenSpec CLI at 1.13.2, and `mise install` fetches it (verify: `mise exec -- lets --version | grep -qx 0.6.0`) (✓ `mise exec -- lets --version | grep -qx 0.6.0` passed)
- [x] 1.2 [easy] The committed Let's Spec files match 0.6.0: run `mise exec -- lets sync` and commit exactly what it writes, with no hand edits (verify: `mise exec -- lets sync --check`) (✓ `mise exec -- lets sync --check` passed)
- [ ] 1.3 [easy] The app's own checks still pass after the upgrade (verify: `npm test && npm run build`)
