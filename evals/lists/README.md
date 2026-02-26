# lists eval research (feature-first)

## category overview

This document is the reference for the lists and performance-sensitive rendering category under `evals/lists/`.

## library baseline and naming

- React Native list primitives baseline: `FlatList`, `SectionList`, `VirtualizedList`
- High-performance virtualization baseline: `@shopify/flash-list`
- Alternate virtualization baseline: `legend-list` (`@legendapp/list`)

## best practices

### official best-practice sources

#### react native core lists

- [React Native: FlatList](https://reactnative.dev/docs/flatlist)
- [React Native: SectionList](https://reactnative.dev/docs/sectionlist)
- [React Native: Optimizing FlatList Configuration](https://reactnative.dev/docs/optimizing-flatlist-configuration)
- [React Native: VirtualizedList](https://reactnative.dev/docs/virtualizedlist)

#### @shopify/flash-list

- [FlashList docs: usage](https://shopify.github.io/flash-list/docs/usage)
- [FlashList docs: performance](https://shopify.github.io/flash-list/docs/fundamentals/performance)
- [FlashList docs: recycling](https://shopify.github.io/flash-list/docs/fundamentals/recycling)
- [FlashList docs: known issues](https://shopify.github.io/flash-list/docs/known-issues)
- [FlashList: section list guide](https://shopify.github.io/flash-list/docs/guides/section-list)
- [FlashList: migrating to v2](https://shopify.github.io/flash-list/docs/v2-migration)
- [FlashList: what's new in v2](https://shopify.github.io/flash-list/docs/v2-changes)
- [FlashList releases](https://github.com/Shopify/flash-list/releases)

#### legend-list

- [Legend List docs](https://www.legendapp.com/open-source/list)
- [Legend List v2 props](https://www.legendapp.com/open-source/list/v2/props)
- [Legend List v2 overview](https://www.legendapp.com/open-source/list/api/version-2/)
- [Legend List README](https://github.com/LegendApp/legend-list#readme)
- [Legend List type contracts](https://github.com/LegendApp/legend-list/blob/main/src/types.ts)
- [Legend List package](https://www.npmjs.com/package/@legendapp/list)

### best-practice inventory

- `L1`: use stable `keyExtractor` identity; never rely on index keys for mutable/reordered data.
- `L2`: treat FlatList/SectionList as `PureComponent`; pass immutable `extraData` when render output depends on external state.
- `L3`: guard infinite pagination callbacks (`onEndReached`, `onStartReached`) against duplicate trigger loops while loading.
- `L4`: use deterministic sizing hooks (`getItemLayout`, fixed-size assumptions) when using `initialScrollIndex` / `scrollToIndex` / `scrollToLocation`.
- `L5`: keep row render paths cheap (`memo`, stable callbacks, no heavyweight work in `renderItem`).
- `L6`: tune virtualization props intentionally (`windowSize`, `maxToRenderPerBatch`, `updateCellsBatchingPeriod`) with explicit tradeoffs.
- `L7`: avoid problematic list nesting patterns (same-orientation VirtualizedList inside ScrollView) unless architecture is explicit and constrained.
- `L8`: for SectionList, keep section keys and item keys stable and render section headers deterministically.
- `L9`: in FlashList, remove explicit `key` props in item trees and use `useMappingHelper` for mapped children.
- `L10`: in FlashList, provide `getItemType` for heterogeneous row types to improve recycling pool reuse.
- `L11`: in FlashList, profile/tune in release mode (dev mode can mislead list-performance conclusions).
- `L12`: in FlashList/LegendList recycling modes, reset per-item local state correctly when a container is reused.
- `L13`: use maintain-visible-position features intentionally for chat/prepend flows to prevent jump/regression.
- `L14`: in LegendList, pair `keyExtractor` and layout hints (`getEstimatedItemSize`, `maintainVisibleContentPosition`) for stable initial positioning.
- `L15`: validate bidirectional pagination behavior with deterministic thresholds and duplicate-trigger guards.
