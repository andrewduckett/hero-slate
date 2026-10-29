## 1. Shared motion timing

- [x] 1.1 [easy] The app's stylesheets define a shared motion duration of 200 ms and a shared motion easing of `ease-out`, read by a test from `src/lib/theme/base.css` (verify: npx vitest run src/lib/theme/motion.test.ts) (✓ npx vitest run src/lib/theme/motion.test.ts passed)
- [x] 1.2 [easy] A `prefers-reduced-motion: reduce` media query in the stylesheets sets the shared motion duration to 0 (verify: npx vitest run src/lib/theme/motion.test.ts) (✓ npx vitest run src/lib/theme/motion.test.ts passed)

## 2. Hit points tracker

- [x] 2.1 [easy] The hit points bar's fill transitions its width with the shared motion duration and easing (verify: npx vitest run src/lib/character/HitPointsBlock.test.ts) (✓ npx vitest run src/lib/character/HitPointsBlock.test.ts passed)
- [x] 2.2 [easy] The hit points tracker's down-state opacity transitions with the shared motion duration and easing, replacing the literal 300 ms (verify: npx vitest run src/lib/character/HitPointsBlock.test.ts) (✓ npx vitest run src/lib/character/HitPointsBlock.test.ts passed)
- [x] 2.3 [easy] After a -1 tap on 30 of 45 hit points, the readout shows "29 / 45" straight away, with no count-up (verify: npx vitest run src/lib/character/HitPointsBlock.test.ts) (✓ npx vitest run src/lib/character/HitPointsBlock.test.ts passed; guard test, fails when the readout lags)

## 3. Resource pools

- [x] 3.1 [easy] A pool dot transitions its background colour and border colour with the shared motion duration and easing (verify: npx vitest run src/lib/character/ResourcePoolsBlock.test.ts) (✓ npx vitest run src/lib/character/ResourcePoolsBlock.test.ts passed)
- [x] 3.2 [easy] A counter pool's bar fill transitions its width with the shared motion duration and easing (verify: npx vitest run src/lib/character/ResourcePoolsBlock.test.ts) (✓ npx vitest run src/lib/character/ResourcePoolsBlock.test.ts passed)
- [x] 3.3 [easy] After a -1 tap on a counter pool at 35 of 35, the readout shows `34 / 35` straight away, with no count-up (verify: npx vitest run src/lib/character/ResourcePoolsBlock.test.ts) (✓ npx vitest run src/lib/character/ResourcePoolsBlock.test.ts passed; guard test, fails when the readout lags)

## 4. Integration

- [x] 4.1 [easy] No transition in any component or stylesheet under `src/` names a literal duration; each takes the shared motion timing (verify: npx vitest run src/lib/theme/motion.test.ts) (✓ npx vitest run src/lib/theme/motion.test.ts passed; guard test, fails on a literal 300ms)
- [ ] 4.2 [medium] The full suite and the static build pass, and a visual review in the running app confirms each tracker eases calmly, nothing eases on first load, and changes are instant with reduced motion emulated (verify: npm test && npm run build)
