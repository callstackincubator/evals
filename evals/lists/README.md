# lists eval research (feature-first)

## category overview

This document is the reference for the lists category eval pack under `evals/lists/`.

## library baseline and naming

- React Native core list baseline: `FlatList` from `react-native`
- High-performance recycled list baseline: `FlashList` from `@shopify/flash-list`
- Advanced virtualized list baseline: `LegendList` from `@legendapp/list`
- Current documentation baseline for this research pass: React Native `0.84`, FlashList `2.x`, Legend List `v2`
- Naming convention: standardize on `FlatList`, `FlashList`, and `LegendList` in prompts, requirements, and reference implementations

## best practices

### official best-practice sources

#### FlatList

- [React Native: FlatList](https://reactnative.dev/docs/flatlist)
- [React Native: Optimizing FlatList Configuration](https://reactnative.dev/docs/optimizing-flatlist-configuration)

#### FlashList

- [FlashList: Usage](https://shopify.github.io/flash-list/docs/usage/)
- [FlashList: Performance](https://shopify.github.io/flash-list/docs/fundamentals/performance/)
- [FlashList: Recycling](https://shopify.github.io/flash-list/docs/fundamentals/recycling/)
- [FlashList: Known issues](https://shopify.github.io/flash-list/docs/known-issues/)
- [FlashList: Migrating to v2](https://shopify.github.io/flash-list/docs/v2-migration/)

#### LegendList

- [Legend List: Getting Started](https://legendapp.com/open-source/list/v2/getting-started/)
- [Legend List: Props](https://legendapp.com/open-source/list/api/props/)
- [Legend List: Performance](https://legendapp.com/open-source/list/api/performance/)
- [Legend List: Version 2](https://legendapp.com/open-source/list/api/version-2/)
- [Legend List: Chat Interfaces](https://legendapp.com/open-source/list/examples/chatinterfaces/)
- [Legend List: Infinite Scrolling](https://legendapp.com/open-source/list/examples/infinitescrolling/)
