# async-state eval research (feature-first)

## category overview

This document is the reference for the async-state category eval pack under `evals/async-state/`.

## library baseline and naming

- Server-state and caching baseline: `@tanstack/react-query`
- Client async orchestration baseline: `zustand`
- Atom-based async state baseline: `jotai` (including async atoms)
- Built-in React concurrency baseline: `Suspense`, `startTransition`, `useTransition`, `useDeferredValue`

## best practices

### official best-practice sources

#### TanStack Query

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

#### Zustand

- [Zustand: docs introduction](https://zustand.docs.pmnd.rs/getting-started/introduction)
- [Zustand: updating state](https://zustand.docs.pmnd.rs/guides/updating-state)
- [Zustand: immutable state and merging](https://zustand.docs.pmnd.rs/guides/immutable-state-and-merging)
- [Zustand: persist middleware](https://zustand.docs.pmnd.rs/integrations/persisting-store-data)
- [Zustand: migrating to v5](https://zustand.docs.pmnd.rs/migrations/migrating-to-v5)
- [Zustand README (async actions)](https://github.com/pmndrs/zustand#async-actions)
- [Zustand releases](https://github.com/pmndrs/zustand/releases)

#### Jotai

- [Jotai docs home](https://jotai.org/)
- [Jotai docs: v2 API migration](https://jotai.org/docs/guides/migrating-to-v2-api)
- [Jotai tutorial: async read atoms](https://tutorial.jotai.org/quick-start/async-read-atoms)
- [Jotai tutorial: async write atoms](https://tutorial.jotai.org/quick-start/async-write-atoms)
- [Jotai README](https://github.com/pmndrs/jotai)
- [Jotai releases](https://github.com/pmndrs/jotai/releases)

#### React built-ins

- [React docs: Suspense](https://react.dev/reference/react/Suspense)
- [React docs: startTransition](https://react.dev/reference/react/startTransition)
- [React docs: useTransition](https://react.dev/reference/react/useTransition)
- [React docs: useDeferredValue](https://react.dev/reference/react/useDeferredValue)

### best-practice inventory

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
