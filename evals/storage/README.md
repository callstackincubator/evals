# storage eval research (feature-first)

## category overview

This document is the reference for the offline, storage, and sync resilience category under `evals/storage/`.

## library baseline and naming

- Key-value persistence: `@react-native-async-storage/async-storage`
- JSI key-value persistence: `react-native-mmkv`
- Relational/local queue persistence: `expo-sqlite`

## best practices

### official best-practice sources

#### @react-native-async-storage/async-storage

- [AsyncStorage API](https://react-native-async-storage.github.io/async-storage/docs/api/)
- [Known limits](https://react-native-async-storage.github.io/async-storage/docs/limits/)
- [Where data is stored](https://react-native-async-storage.github.io/async-storage/docs/advanced/where_data_stored/)
- [Next storage implementation](https://react-native-async-storage.github.io/async-storage/docs/advanced/next/)
- [Async Storage releases](https://github.com/react-native-async-storage/async-storage/releases)
- [React Native docs: AsyncStorage removed from core](https://reactnative.dev/docs/next/asyncstorage)

#### react-native-mmkv

- [MMKV README](https://github.com/mrousavy/react-native-mmkv)
- [MMKV docs](https://mrousavy.com/react-native-mmkv/)
- [MMKV releases](https://github.com/mrousavy/react-native-mmkv/releases)

#### expo-sqlite

- [Expo SQLite SDK docs](https://docs.expo.dev/versions/latest/sdk/sqlite/)
- [SQLite with React and Expo Router](https://docs.expo.dev/router/reference/sqlite/)
- [Expo SDK 51 changelog](https://expo.dev/changelog/2024-05-07-sdk-51)
- [Expo SDK 52 changelog](https://expo.dev/changelog/2024-11-12-sdk-52)

### best-practice inventory

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
