# storage eval research (feature-first)

## scope

This document is the reference for the offline, storage, and sync resilience category under `evals/storage/`.

## library baseline and naming

- Key-value persistence: `@react-native-async-storage/async-storage`
- JSI key-value persistence: `react-native-mmkv`
- Relational/local queue persistence: `expo-sqlite`

## official best-practice sources

### @react-native-async-storage/async-storage

- [AsyncStorage API](https://react-native-async-storage.github.io/async-storage/docs/api/)
- [Known limits](https://react-native-async-storage.github.io/async-storage/docs/limits/)
- [Where data is stored](https://react-native-async-storage.github.io/async-storage/docs/advanced/where_data_stored/)
- [Next storage implementation](https://react-native-async-storage.github.io/async-storage/docs/advanced/next/)
- [Async Storage releases](https://github.com/react-native-async-storage/async-storage/releases)
- [React Native docs: AsyncStorage removed from core](https://reactnative.dev/docs/next/asyncstorage)

### react-native-mmkv

- [MMKV README](https://github.com/mrousavy/react-native-mmkv)
- [MMKV docs](https://mrousavy.com/react-native-mmkv/)
- [MMKV releases](https://github.com/mrousavy/react-native-mmkv/releases)

### expo-sqlite

- [Expo SQLite SDK docs](https://docs.expo.dev/versions/latest/sdk/sqlite/)
- [SQLite with React and Expo Router](https://docs.expo.dev/router/reference/sqlite/)
- [Expo SDK 51 changelog](https://expo.dev/changelog/2024-05-07-sdk-51)
- [Expo SDK 52 changelog](https://expo.dev/changelog/2024-11-12-sdk-52)

## recent api shifts to encode in eval requirements (as of 2026-02-25)

### @react-native-async-storage/async-storage

- `v3.0.0` (2026-02-23) introduced major breaking changes, including:
  - callback API dropped
  - scoped storages introduced
  - batch method API renamed in v3 track
- `v3.0.1` (2026-02-23) is the immediate patch after a `v3.0.0` artifact issue.
- React Native core `AsyncStorage` remains removed; evals must require the community package import path.
- Eval policy for this repo's storage set:
  - enforce package import and promise-first usage
  - do not force scoped-storage migration yet, because these evals still intentionally exercise `multi*` patterns in current references.

### react-native-mmkv

- `v4.0.0` (2025-10-20) is a major release (Nitro rewrite, API behavior updates).
- `v4.1.2` (2026-01-28) is the latest listed release at audit time.
- Current README examples use `createMMKV(...)` and explicit instance options (`id`, `path`, `encryptionKey`, `mode`).
- Eval policy:
  - require `createMMKV` style initialization with explicit instance IDs for scoped storage evals
  - disallow legacy constructor-style patterns from older examples.

### expo-sqlite

- SDK 51 (2024-05-07) made the rewritten API the default and documented that legacy imports were transitional.
- SDK 52 (2024-11-12) removed `expo-sqlite/legacy`.
- Current docs explicitly note `withTransactionAsync` is not exclusive; ordering-sensitive flows should use `withExclusiveTransactionAsync`.
- Eval policy:
  - require modern `expo-sqlite` API path (no legacy imports)
  - require parameterized SQL (`runAsync` / prepared statements) over dynamic SQL strings for user-controlled values
  - for ordering-critical write evals, require `withExclusiveTransactionAsync` and disallow relying on `withTransactionAsync` for strict serialization.

## best-practice inventory

- `S1`: gate startup UI until persisted state rehydration is complete.
- `S2`: keep persisted payloads serializable, versioned, and guarded against parse/corruption errors.
- `S3`: prefer batched key operations (`multiGet`, `multiSet`, `multiRemove`) for related state.
- `S4`: respect AsyncStorage size constraints by sharding large payloads and storing manifests.
- `S5`: model offline actions as a durable outbox with idempotent mutation IDs.
- `S6`: define deterministic merge/conflict strategy (`updatedAt`/version) for reconnect sync.
- `S7`: separate global and user-scoped persisted data, with scoped clear-on-signout behavior.
- `S8`: in MMKV, configure explicit instance IDs/options (path, encryption, mode) and keep them stable.
- `S9`: use MMKV change listeners and unsubscribe correctly to avoid stale UI or leaks.
- `S10`: use SQLite migrations with explicit schema versioning and transactional safety.
- `S11`: use prepared statements and finalize them deterministically.
- `S12`: use exclusive transaction boundaries for write ordering when concurrency can race.
- `S13`: initialize SQLite with explicit PRAGMAs (for example WAL, foreign keys) when required by data semantics.
- `S14`: for reactive SQLite UIs, use change listeners with explicit enablement and cleanup.

## issue intelligence (top recurring pain points)

These threads are used as robustness validation signals, not prompt wording.

### setup

- [react-native-mmkv#776](https://github.com/mrousavy/react-native-mmkv/issues/776)
  - recurring symptom: failed MMKV instance creation after install/config drift.
  - answer pattern: verify native integration/new-architecture compatibility and rebuild after dependency changes.
- [react-native-mmkv#945](https://github.com/mrousavy/react-native-mmkv/issues/945)
  - recurring symptom: Jest failures around Nitro/native module resolution.
  - answer pattern: enforce explicit test mocks/setup for native storage modules.
- [async-storage#768](https://github.com/react-native-async-storage/async-storage/issues/768)
  - recurring symptom: AsyncStorage native module appears null in app/test setup.
  - answer pattern: align platform setup and test mocking with official install/testing guidance.

### api misuse

- [async-storage#1096](https://github.com/react-native-async-storage/async-storage/issues/1096)
  - recurring symptom: unsupported environment assumptions (`window` usage) in non-web contexts.
  - answer pattern: use platform-safe storage access and avoid browser-only assumptions in shared code.
- [expo#28176](https://github.com/expo/expo/issues/28176)
  - recurring symptom: crashes around SQLite prepared statement paths.
  - answer pattern: use `prepareAsync`/`executeAsync` carefully and always finalize statement handles.
- [expo#30492](https://github.com/expo/expo/issues/30492)
  - recurring symptom: SQL edge cases with special characters and unsafe query composition.
  - answer pattern: use parameterized statements and avoid interpolation-based SQL.

### performance

- [expo#33754](https://github.com/expo/expo/issues/33754)
  - recurring symptom: race behavior in SQLite-backed key-value flows under concurrent first access.
  - answer pattern: initialize DB and connection lifecycle deterministically before broad concurrent writes.
- [expo#33677](https://github.com/expo/expo/issues/33677)
  - recurring symptom: lock/close contention with pooled async connection handling.
  - answer pattern: avoid premature close behavior and keep connection pooling semantics stable.
- [react-native-mmkv#542](https://github.com/mrousavy/react-native-mmkv/issues/542)
  - recurring symptom: perceived persistence loss after background/foreground transitions.
  - answer pattern: verify instance/key scoping and lifecycle assumptions instead of ad hoc cache mirrors.

### edge case

- [async-storage#521](https://github.com/react-native-async-storage/async-storage/issues/521)
  - recurring symptom: data not retained as expected after restart due flow/usage mistakes.
  - answer pattern: add explicit bootstrap rehydration + key ownership strategy.
- [react-native-mmkv#911](https://github.com/mrousavy/react-native-mmkv/issues/911)
  - recurring symptom: custom storage path usage causes unexpected persistence behavior.
  - answer pattern: keep path config stable and verify real writable location assumptions.
- [expo#26866](https://github.com/expo/expo/issues/26866)
  - recurring symptom: SQL dialect feature regressions (FTS variants) across versions.
  - answer pattern: validate DB feature usage against runtime capabilities and upgrade notes.

### tooling

- [expo#33754](https://github.com/expo/expo/issues/33754) -> [expo#33834](https://github.com/expo/expo/pull/33834)
  - maintainer fix pattern: serialize open-path behavior and remove race-prone initialization logic.
- [expo#33677](https://github.com/expo/expo/issues/33677) -> [expo#35818](https://github.com/expo/expo/pull/35818)
  - maintainer fix pattern: connection pooling and close semantics adjusted to prevent lock-timeout paths.
- [expo#33754](https://github.com/expo/expo/issues/33754) -> [expo#36669](https://github.com/expo/expo/pull/36669)
  - maintainer follow-up pattern: async API guardrails and serialized init paths for kv-store/web parity.
- [expo#30492](https://github.com/expo/expo/issues/30492) -> [expo#30579](https://github.com/expo/expo/pull/30579)
  - maintainer fix pattern: robust statement handling for escaped/special-character values.

## coverage matrix (library to evals)

- `@react-native-async-storage/async-storage`: `01, 02, 03, 04, 05, 06, 07`
- `react-native-mmkv`: `08, 09, 10, 11, 12`
- `expo-sqlite`: `13, 14, 15, 16, 17, 18`
- cross-library offline queue and reconciliation semantics: `05, 06, 16`

## storage eval set (18)

### easy (6)

1. [`01-rn-storage-asyncstorage-rehydrate-bootstrap-guard`](./01-rn-storage-asyncstorage-rehydrate-bootstrap-guard)
2. [`02-rn-storage-asyncstorage-namespaced-keys-clear-scope`](./02-rn-storage-asyncstorage-namespaced-keys-clear-scope)
3. [`03-rn-storage-asyncstorage-batch-multiget-multiset`](./03-rn-storage-asyncstorage-batch-multiget-multiset)
4. [`08-rn-storage-mmkv-split-global-user-instances`](./08-rn-storage-mmkv-split-global-user-instances)
5. [`10-rn-storage-mmkv-value-change-listener-sync`](./10-rn-storage-mmkv-value-change-listener-sync)
6. [`14-rn-storage-sqlite-prepared-statements-finalize`](./14-rn-storage-sqlite-prepared-statements-finalize)

### medium (8)

7. [`04-rn-storage-asyncstorage-large-payload-sharding`](./04-rn-storage-asyncstorage-large-payload-sharding)
8. [`05-rn-storage-asyncstorage-offline-outbox-retry`](./05-rn-storage-asyncstorage-offline-outbox-retry)
9. [`06-rn-storage-asyncstorage-reconnect-conflict-merge`](./06-rn-storage-asyncstorage-reconnect-conflict-merge)
10. [`07-rn-storage-asyncstorage-schema-version-migration`](./07-rn-storage-asyncstorage-schema-version-migration)
11. [`09-rn-storage-mmkv-encryption-recrypt-rotation`](./09-rn-storage-mmkv-encryption-recrypt-rotation)
12. [`11-rn-storage-mmkv-multi-process-app-group`](./11-rn-storage-mmkv-multi-process-app-group)
13. [`13-rn-storage-sqlite-idempotent-migrations`](./13-rn-storage-sqlite-idempotent-migrations)
14. [`18-rn-storage-sqlite-wal-foreign-keys-init`](./18-rn-storage-sqlite-wal-foreign-keys-init)

### hard (4)

15. [`12-rn-storage-mmkv-custom-path-persistence-guard`](./12-rn-storage-mmkv-custom-path-persistence-guard)
16. [`15-rn-storage-sqlite-exclusive-transaction-ordering`](./15-rn-storage-sqlite-exclusive-transaction-ordering)
17. [`16-rn-storage-sqlite-offline-outbox-replay`](./16-rn-storage-sqlite-offline-outbox-replay)
18. [`17-rn-storage-sqlite-change-listener-reactivity`](./17-rn-storage-sqlite-change-listener-reactivity)

## status

- navigation category: complete at 50 evals.
- animation category: structured pilot complete at 16 text-only evals.
- lists category: structured pilot complete at 18 text-only evals.
- storage category: new feature-first pilot added at 18 text-only evals for offline, persistence, and sync resilience.
