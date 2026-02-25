# async-state eval research (feature-first)

## scope

This document is the reference for the async-state category eval pack under `evals/async-state/`.

## library baseline and naming

- Server-state and caching baseline: `@tanstack/react-query`
- Client async orchestration baseline: `zustand`
- Atom-based async state baseline: `jotai` (including async atoms)
- Built-in React concurrency baseline: `Suspense`, `startTransition`, `useTransition`, `useDeferredValue`

Note: this pilot intentionally focuses on data fetching and async state fundamentals for the libraries above. Additional libraries can be layered later.

## official best-practice sources

### TanStack Query

- [TanStack Query: overview](https://tanstack.com/query/latest/docs/framework/react/overview)
- [TanStack Query: important defaults](https://tanstack.com/query/latest/docs/react/guides/important-defaults)
- [TanStack Query: query keys](https://tanstack.com/query/latest/docs/framework/react/guides/query-keys)
- [TanStack Query: dependent queries](https://tanstack.com/query/latest/docs/framework/react/guides/dependent-queries)
- [TanStack Query: query cancellation](https://tanstack.com/query/latest/docs/react/guides/query-cancellation)
- [TanStack Query: invalidations from mutations](https://tanstack.com/query/latest/docs/framework/react/guides/invalidations-from-mutations)
- [TanStack Query: optimistic updates](https://tanstack.com/query/latest/docs/react/guides/optimistic-updates)
- [TanStack Query: React Native](https://tanstack.com/query/latest/docs/framework/react/react-native)
- [TanStack Query: migrating to v5](https://tanstack.com/query/latest/docs/react/guides/migrating-to-v5)
- [TanStack Query releases](https://github.com/TanStack/query/releases)

### Zustand

- [Zustand: docs introduction](https://zustand.docs.pmnd.rs/getting-started/introduction)
- [Zustand: updating state](https://zustand.docs.pmnd.rs/guides/updating-state)
- [Zustand: immutable state and merging](https://zustand.docs.pmnd.rs/guides/immutable-state-and-merging)
- [Zustand: persist middleware](https://zustand.docs.pmnd.rs/integrations/persisting-store-data)
- [Zustand: migrating to v5](https://zustand.docs.pmnd.rs/migrations/migrating-to-v5)
- [Zustand README (async actions)](https://github.com/pmndrs/zustand#async-actions)
- [Zustand releases](https://github.com/pmndrs/zustand/releases)

### Jotai

- [Jotai docs home](https://jotai.org/)
- [Jotai docs: v2 API migration](https://jotai.org/docs/guides/migrating-to-v2-api)
- [Jotai tutorial: async read atoms](https://tutorial.jotai.org/quick-start/async-read-atoms)
- [Jotai tutorial: async write atoms](https://tutorial.jotai.org/quick-start/async-write-atoms)
- [Jotai README](https://github.com/pmndrs/jotai)
- [Jotai releases](https://github.com/pmndrs/jotai/releases)

### React built-ins

- [React docs: Suspense](https://react.dev/reference/react/Suspense)
- [React docs: startTransition](https://react.dev/reference/react/startTransition)
- [React docs: useTransition](https://react.dev/reference/react/useTransition)
- [React docs: useDeferredValue](https://react.dev/reference/react/useDeferredValue)

## recent api shifts to encode in eval requirements (as of 2026-02-25)

### TanStack Query

- v5 migration guidance confirms query APIs moved to object-signature usage.
- v5 removed `onSuccess`/`onError`/`onSettled` callbacks on queries.
- v5 removed `keepPreviousData` in favor of `placeholderData` identity patterns and renamed `cacheTime` to `gcTime`.
- Eval policy:
  - require v5 object-signature usage
  - disallow removed query callbacks
  - enforce `placeholderData` identity pattern where previous-page continuity is required.

### Zustand

- v5 migration guidance requires named `create` import and changes selector-equality patterns.
- v5 migration guidance advises `useShallow` or `createWithEqualityFn` when equality control is needed.
- Eval policy:
  - require named `create` import from `zustand`
  - disallow legacy selector equality argument on `create` hook usage.

### Jotai

- v2 API migration remains the baseline for current atom/read/write patterns.
- `v2.17.0` release notes mark `loadable` utility as deprecated in favor of `derive`.
- `v2.18.0` release notes move Babel plugin package from `jotai/babel` to `jotai-babel`.
- Eval policy:
  - require v2 entrypoints and disallow removed v1 APIs
  - keep one loadable-focused eval for non-Suspense state-branching coverage while docs and migration usage overlap in v2.

### React built-ins

- React docs for `startTransition` and `useTransition` document a known limitation: state updates after `await` require another transition wrap.
- `useDeferredValue` remains the core API for keeping input urgent while expensive derived rendering lags.
- Eval policy:
  - enforce transition-aware post-await update handling for race-sensitive flows
  - enforce explicit stale indicator for deferred-render paths.

## best-practice inventory

- `D1`: model server data as server state with stable, serializable query keys.
- `D2`: derive fetch inputs from query-key contracts instead of hidden mutable closures.
- `D3`: use dependent-query gating (`enabled`) for multi-step fetches.
- `D4`: perform targeted mutation invalidation for affected query families.
- `D5`: use optimistic updates with snapshot-and-rollback semantics.
- `D6`: wire cancellation and stale-request safety for async races.
- `D7`: tune stale, retry, and cache defaults intentionally for UX and correctness.
- `D8`: on React Native, connect Query focus/online managers to AppState/connectivity.
- `D9`: model async lifecycle state explicitly in client stores.
- `D10`: enforce latest-intent-wins ordering in async store writes.
- `D11`: keep Zustand subscriptions narrow and equality-aware to limit avoidable rerenders.
- `D12`: guard persisted async rehydration before protected UI decisions.
- `D13`: treat Jotai async read atoms as Suspense-first by default.
- `D14`: when avoiding Suspense, use explicit loadable state branches.
- `D15`: isolate async write side effects in write atoms with deterministic pending/error handling.
- `D16`: use transitions for non-urgent updates that may suspend.
- `D17`: preserve urgent input responsiveness with deferred rendering.
- `D18`: guard transition-driven async ordering so stale completions do not overwrite newer intent.

## issue intelligence (top recurring pain points)

These issue threads are used as robustness validation signals and not as prompt wording.

### setup

- [TanStack/query#3492](https://github.com/TanStack/query/issues/3492)
  - recurring symptom: confusion around cache behavior after `cacheTime` -> `gcTime` naming changes.
  - answer pattern: align terminology with current docs defaults and migration guidance.
- [pmndrs/zustand#1377](https://github.com/pmndrs/zustand/issues/1377)
  - recurring symptom: persistence behavior differs from expectations.
  - answer pattern: configure persist middleware deliberately and understand hydration lifecycle.
- [pmndrs/jotai#211](https://github.com/pmndrs/jotai/issues/211)
  - recurring symptom: async API expectations not obvious for newcomers.
  - answer pattern: follow async atom patterns documented and evolved from RFC discussion.

### API misuse

- [TanStack/query#6116](https://github.com/TanStack/query/issues/6116)
  - recurring symptom: lifecycle callback usage assumptions changed in v5.
  - answer pattern: move side effects to recommended v5 mutation/query patterns.
- [TanStack/query#2559](https://github.com/TanStack/query/issues/2559)
  - recurring symptom: infinite refetch loops from unstable keys/effects.
  - answer pattern: stabilize query keys and avoid refetch-trigger cycles.
- [pmndrs/zustand#458](https://github.com/pmndrs/zustand/issues/458)
  - recurring symptom: confusion around selector rerenders.
  - answer pattern: use narrow selectors and equality/shallow helpers.
- [pmndrs/jotai#1190](https://github.com/pmndrs/jotai/issues/1190)
  - recurring symptom: uncertainty about fallback value patterns with async atoms.
  - answer pattern: choose explicit Suspense or loadable strategy per screen.

### performance

- [TanStack/query#4456](https://github.com/TanStack/query/issues/4456)
  - recurring symptom: retry semantics and cache defaults can cause unexpected repeated work.
  - answer pattern: tune retries/defaults for request type and failure mode.
- [pmndrs/zustand#394](https://github.com/pmndrs/zustand/issues/394)
  - recurring symptom: broad subscriptions create avoidable rerenders.
  - answer pattern: subscribe to minimal slices and preserve reference stability.
- [facebook/react#31819](https://github.com/facebook/react/issues/31819)
  - recurring symptom: transition behavior can feel unexpectedly delayed depending on update shape.
  - answer pattern: apply transitions only to non-urgent state and keep urgent state outside transitions.

### platform parity

- [TanStack/query#6323](https://github.com/TanStack/query/issues/6323)
  - recurring symptom: React Native focus/online semantics differ from web assumptions.
  - answer pattern: wire AppState/connectivity explicitly using Query managers in RN.
- [TanStack/query#6338](https://github.com/TanStack/query/issues/6338)
  - recurring symptom: stale state or refetch behavior diverges in RN contexts.
  - answer pattern: configure RN-specific defaults and lifecycle hooks intentionally.

### edge case

- [TanStack/query#5438](https://github.com/TanStack/query/issues/5438)
  - recurring symptom: stale pagination responses overwrite newer intent.
  - answer pattern: guard ordering and query identity around rapid param changes.
- [pmndrs/jotai#1158](https://github.com/pmndrs/jotai/issues/1158)
  - recurring symptom: initialization and async atom timing races.
  - answer pattern: centralize async initialization flow and deterministic fallbacks.
- [facebook/react#28914](https://github.com/facebook/react/issues/28914)
  - recurring symptom: out-of-order async completion behavior with transitions.
  - answer pattern: add latest-intent guards and transition-aware commit logic.

### tooling

- [facebook/react#22626](https://github.com/facebook/react/issues/22626)
  - recurring symptom: strict mode can expose duplicate async side effects and reveal fragile assumptions.
  - answer pattern: make effects idempotent and cleanup-safe.
- [facebook/react#24384](https://github.com/facebook/react/issues/24384)
  - recurring symptom: Suspense/hydration mismatch confusion in mixed rendering setups.
  - answer pattern: keep boundaries explicit and deterministic.
- [pmndrs/jotai#3041](https://github.com/pmndrs/jotai/issues/3041)
  - recurring symptom: compatibility and runtime assumptions vary across integrations.
  - answer pattern: pin known-good versions and validate integration paths.

## coverage matrix (library to evals)

- `@tanstack/react-query`: `01, 02, 03, 04, 16`
- `zustand`: `05, 06, 07, 08`
- `jotai`: `09, 10, 11, 12`
- `Suspense`: `09, 13`
- `transitions` (`startTransition`/`useTransition`): `13, 15`
- `useDeferredValue`: `14`

## pilot async-state eval set (16)

### easy (5)

1. [`01-rn-rq-stable-query-key-filters`](./01-rn-rq-stable-query-key-filters)
2. [`03-rn-rq-mutation-invalidate-on-success`](./03-rn-rq-mutation-invalidate-on-success)
3. [`05-rn-zustand-async-action-lifecycle`](./05-rn-zustand-async-action-lifecycle)
4. [`09-rn-jotai-async-read-atom-suspense`](./09-rn-jotai-async-read-atom-suspense)
5. [`14-rn-react-usedeferredvalue-search-stale-indicator`](./14-rn-react-usedeferredvalue-search-stale-indicator)

### medium (7)

6. [`02-rn-rq-dependent-query-enabled-gate`](./02-rn-rq-dependent-query-enabled-gate)
7. [`04-rn-rq-optimistic-update-rollback`](./04-rn-rq-optimistic-update-rollback)
8. [`06-rn-zustand-request-id-stale-response-guard`](./06-rn-zustand-request-id-stale-response-guard)
9. [`07-rn-zustand-persist-async-hydration-gate`](./07-rn-zustand-persist-async-hydration-gate)
10. [`10-rn-jotai-loadable-async-atom-no-suspense`](./10-rn-jotai-loadable-async-atom-no-suspense)
11. [`11-rn-jotai-async-write-atom-mutation`](./11-rn-jotai-async-write-atom-mutation)
12. [`13-rn-react-suspense-transition-no-fallback-flash`](./13-rn-react-suspense-transition-no-fallback-flash)

### hard (4)

13. [`08-rn-zustand-selector-shallow-stability`](./08-rn-zustand-selector-shallow-stability)
14. [`12-rn-jotai-atomwithstorage-async-rehydrate-guard`](./12-rn-jotai-atomwithstorage-async-rehydrate-guard)
15. [`15-rn-react-transition-race-safe-ordering`](./15-rn-react-transition-race-safe-ordering)
16. [`16-rn-rq-react-native-appstate-focus-online-managers`](./16-rn-rq-react-native-appstate-focus-online-managers)

## deterministic outcome map (new additions)

13. `13-rn-react-suspense-transition-no-fallback-flash`

- non-urgent update is transitioned while previously revealed content remains visible.
- traceability: `D16`, `D17`.

14. `14-rn-react-usedeferredvalue-search-stale-indicator`

- urgent typing remains responsive while deferred list lags with explicit stale indicator.
- traceability: `D17`.

15. `15-rn-react-transition-race-safe-ordering`

- latest user intent wins under rapid async transitions.
- traceability: `D18`, issue `#28914`.

16. `16-rn-rq-react-native-appstate-focus-online-managers`

- refetch policy follows RN foreground and connectivity lifecycle with controlled behavior.
- traceability: `D8`, issues `#6323`, `#6338`.

## status

- navigation category: complete at 50 evals.
- animation category: structured pilot at 16 text-only evals.
- async-state category: structured pilot added at 16 text-only evals with React Query + Zustand + Jotai + built-in Suspense and transition coverage.
