# lists eval research (feature-first)

## scope

This document is the reference for the lists and performance-sensitive rendering category under `evals/lists/`.

## official best-practice sources

### react native core lists

- [React Native: FlatList](https://reactnative.dev/docs/flatlist)
- [React Native: SectionList](https://reactnative.dev/docs/sectionlist)
- [React Native: Optimizing FlatList Configuration](https://reactnative.dev/docs/optimizing-flatlist-configuration)
- [React Native: VirtualizedList](https://reactnative.dev/docs/virtualizedlist)

### @shopify/flash-list

- [FlashList docs: usage](https://shopify.github.io/flash-list/docs/usage)
- [FlashList docs: performance](https://shopify.github.io/flash-list/docs/fundamentals/performance)
- [FlashList docs: recycling](https://shopify.github.io/flash-list/docs/fundamentals/recycling)
- [FlashList docs: known issues](https://shopify.github.io/flash-list/docs/known-issues)
- [FlashList: section list guide](https://shopify.github.io/flash-list/docs/guides/section-list)
- [FlashList: migrating to v2](https://shopify.github.io/flash-list/docs/v2-migration)
- [FlashList: what's new in v2](https://shopify.github.io/flash-list/docs/v2-changes)
- [FlashList releases](https://github.com/Shopify/flash-list/releases)

### legend-list

- [Legend List docs](https://www.legendapp.com/open-source/list)
- [Legend List v2 props](https://www.legendapp.com/open-source/list/v2/props)
- [Legend List v2 overview](https://www.legendapp.com/open-source/list/api/version-2/)
- [Legend List README](https://github.com/LegendApp/legend-list#readme)
- [Legend List type contracts](https://github.com/LegendApp/legend-list/blob/main/src/types.ts)
- [Legend List package](https://www.npmjs.com/package/@legendapp/list)

## recent api shifts to encode in eval requirements (as of 2026-02-25)

### React Native core lists

- Current docs continue to position FlatList and SectionList as the primary virtualization APIs for long, changing lists.
- VirtualizedList docs continue to highlight PureComponent semantics and data/identity requirements for deterministic rendering.
- Eval policy:
  - require virtualization-appropriate list primitives
  - require stable identity keys and deterministic update signaling for mutable list data.

### FlashList v2

- v2 migration and change docs document major API shifts:
  - old architecture support removed
  - `maintainVisibleContentPosition` enabled by default
  - `MasonryFlashList` deprecated in favor of `FlashList` with `masonry` prop
  - deprecated props removed/unsupported (`estimatedItemSize`, `estimatedListSize`, `estimatedFirstItemOffset`, `inverted`, `onBlankArea`, `disableAutoLayout`, and others)
  - v2.1 warns when `maintainVisibleContentPosition` is used without `keyExtractor`
  - v2.1 fixes a nested horizontal-list infinite-loop edge case
- Eval policy:
  - require FlashList v2 component patterns
  - add explicit `MUST NOT` constraints for deprecated v2 props/components
  - keep identity/recycling contracts strict for mapped nested children and heterogeneous rows
  - encode explicit MVCP + keyExtractor and nested parent-child architecture contracts in chat/nested evals.

### Legend List v2

- Legend List v2 introduces a rewritten `maintainVisibleContentPosition` algorithm and enables it by default.
- v2 docs also emphasize improved accuracy for `initialScrollIndex`, `scrollToIndex`, and bidirectional infinite scroll behavior, with `estimatedItemSize` now optional.
- Eval policy:
  - require stable keyExtractor contracts for recycle/position correctness
  - require intentional maintain-visible-position and end-maintenance behavior for chat and bidirectional flows
  - keep recycled-row state reset semantics explicit when `recycleItems` is enabled.

## best-practice inventory

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

## issue intelligence (top recurring pain points)

These threads are used as robustness validation signals, not prompt wording.

### setup

- [flash-list#1352](https://github.com/Shopify/flash-list/issues/1352)
  - recurring symptom: new architecture runtime integration errors.
  - answer pattern: verify architecture/version compatibility and migration path.
- [flash-list#756](https://github.com/Shopify/flash-list/issues/756)
  - recurring symptom: Android build failures in specific RN versions.
  - answer pattern: align package and RN/Gradle/Kotlin versions.

### api misuse

- [react-native#16067](https://github.com/facebook/react-native/issues/16067)
  - recurring symptom: `onEndReached` firing earlier/more often than expected.
  - answer pattern: add explicit loading/dedupe guards and deterministic thresholds.
- [react-native#31697](https://github.com/facebook/react-native/issues/31697)
  - recurring symptom: nesting VirtualizedList inside ScrollView warnings and behavior mismatch.
  - answer pattern: avoid same-orientation nesting or formalize list architecture.
- [flash-list#547](https://github.com/Shopify/flash-list/issues/547)
  - recurring symptom: maintain-visible-content-position expectations not matching behavior.
  - answer pattern: configure MVCP intentionally and validate trigger conditions.
- [legend-list#231](https://github.com/LegendApp/legend-list/issues/231)
  - recurring symptom: overlapping/duplicate key errors causing incorrect reuse.
  - answer pattern: enforce globally unique, stable keys per logical item.

### performance

- [react-native#12884](https://github.com/facebook/react-native/issues/12884)
  - recurring symptom: JS thread stalls during list scroll causing delayed press response.
  - answer pattern: reduce row render cost and tune virtualization window/batching.
- [react-native#13413](https://github.com/facebook/react-native/issues/13413)
  - recurring symptom: lag after moderate row counts.
  - answer pattern: list-item simplification + virtualization tuning.
- [flash-list#618](https://github.com/Shopify/flash-list/issues/618)
  - recurring symptom: blank area while fast scrolling.
  - answer pattern: profile in release mode and ensure recycling-friendly item trees.
- [flash-list#1282](https://github.com/Shopify/flash-list/issues/1282)
  - recurring symptom: regression under new architecture transitions.
  - answer pattern: architecture-aware profiling and migration constraints.
- [legend-list#141](https://github.com/LegendApp/legend-list/issues/141)
  - recurring symptom: blank rows while scrolling quickly.
  - answer pattern: validate sizing hints and container pool/recycling behavior.

### platform parity

- [react-native#18945](https://github.com/facebook/react-native/issues/18945)
  - recurring symptom: inverted SectionList sticky-header parity bugs.
  - answer pattern: keep inverted/section behavior under explicit constraints.
- [react-native#19150](https://github.com/facebook/react-native/issues/19150)
  - recurring symptom: FlatList RTL behavior inconsistencies.
  - answer pattern: test RTL layout assumptions explicitly.
- [flash-list known issues: horizontal + RTL](https://shopify.github.io/flash-list/docs/known-issues)
  - recurring symptom: padding/precision behavior differences in horizontal RTL lists.
  - answer pattern: move certain spacing logic to headers/items for deterministic scroll math.

### edge case

- [react-native#25239](https://github.com/facebook/react-native/issues/25239)
  - recurring symptom: list unexpectedly scrolls after data insertions.
  - answer pattern: explicit prepend/append position-preservation strategy.
- [flash-list#1631](https://github.com/Shopify/flash-list/issues/1631)
  - recurring symptom: jumpy scroll position in v2 upgrade paths.
  - answer pattern: validate maintain-visible-position and key/type contracts.
- [flash-list#1844](https://github.com/Shopify/flash-list/issues/1844)
  - recurring symptom: chat pagination scroll instability.
  - answer pattern: deterministic chat MVCP contract with prepend pagination.
- [legend-list#83](https://github.com/LegendApp/legend-list/issues/83)
  - recurring symptom: scroll-to-end behavior clashes with MVCP.
  - answer pattern: combine end-maintenance and visibility-maintenance settings deliberately.
- [legend-list#221](https://github.com/LegendApp/legend-list/issues/221)
  - recurring symptom: unstable rendering when `numColumns` changes.
  - answer pattern: reset/recompute layout contracts when structural props change.

### tooling

- [flash-list docs: profiling guidance](https://shopify.github.io/flash-list/docs/guides/list-profiling)
  - recurring symptom: misleading dev-mode performance conclusions.
  - answer pattern: benchmark only in release-like conditions.
- [legend-list#193](https://github.com/LegendApp/legend-list/issues/193)
  - recurring symptom: environment/version-specific blank-list regressions.
  - answer pattern: verify runtime/version constraints and regression tests.

## coverage matrix (library to evals)

- core `FlatList`/`SectionList`: `01, 02, 03, 04, 05, 06, 07, 08, 09`
- `@shopify/flash-list`: `10, 11, 12, 13, 14`
- `legend-list`: `15, 16, 17, 18`
- cross-library performance and pagination semantics: `02, 04, 09, 13, 18`

## lists eval set (18)

### easy (6)

1. [`01-rn-list-flatlist-keys-extradata-selection`](./01-rn-list-flatlist-keys-extradata-selection)
2. [`02-rn-list-flatlist-onendreached-loading-guard`](./02-rn-list-flatlist-onendreached-loading-guard)
3. [`03-rn-list-flatlist-getitemlayout-initial-scroll-index`](./03-rn-list-flatlist-getitemlayout-initial-scroll-index)
4. [`06-rn-list-sectionlist-sticky-headers-and-keys`](./06-rn-list-sectionlist-sticky-headers-and-keys)
5. [`10-rn-list-flashlist-migration-remove-item-keys`](./10-rn-list-flashlist-migration-remove-item-keys)
6. [`15-rn-list-legend-keyextractor-layout-cache`](./15-rn-list-legend-keyextractor-layout-cache)

### medium (8)

7. [`04-rn-list-flatlist-prepend-maintain-position`](./04-rn-list-flatlist-prepend-maintain-position)
8. [`05-rn-list-flatlist-memoized-row-rerender-control`](./05-rn-list-flatlist-memoized-row-rerender-control)
9. [`07-rn-list-sectionlist-scrolltolocation-deterministic`](./07-rn-list-sectionlist-scrolltolocation-deterministic)
10. [`08-rn-list-sectionlist-filter-extra-data-stability`](./08-rn-list-sectionlist-filter-extra-data-stability)
11. [`11-rn-list-flashlist-getitemtype-heterogeneous-rows`](./11-rn-list-flashlist-getitemtype-heterogeneous-rows)
12. [`12-rn-list-flashlist-recyclingstate-reset`](./12-rn-list-flashlist-recyclingstate-reset)
13. [`16-rn-list-legend-recycleitems-state-safety`](./16-rn-list-legend-recycleitems-state-safety)
14. [`17-rn-list-legend-chat-align-end-maintain-scroll`](./17-rn-list-legend-chat-align-end-maintain-scroll)

### hard (4)

15. [`09-rn-list-flatlist-window-batch-tuning`](./09-rn-list-flatlist-window-batch-tuning)
16. [`13-rn-list-flashlist-chat-prepend-mvcp`](./13-rn-list-flashlist-chat-prepend-mvcp)
17. [`14-rn-list-flashlist-nested-horizontal-in-vertical`](./14-rn-list-flashlist-nested-horizontal-in-vertical)
18. [`18-rn-list-legend-bidirectional-pagination-thresholds`](./18-rn-list-legend-bidirectional-pagination-thresholds)

## status

- navigation category: complete at 50 evals.
- animation category: structured pilot complete at 16 text-only evals.
- lists category: initial feature-first pack added with 18 text-only evals spanning core lists, FlashList, and LegendList.
