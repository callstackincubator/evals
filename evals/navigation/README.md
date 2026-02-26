# navigation eval research (feature-first)

## category overview

This document is the reference for the navigation category eval pack under `evals/navigation/`.

## library baseline and naming

- Navigation baseline: `@react-navigation/native`
- Primary navigator baseline: `@react-navigation/native-stack`
- Nested navigator baseline: `@react-navigation/bottom-tabs`, `@react-navigation/drawer`
- Screen lifecycle/performance baseline: `react-native-screens`

## best practices

### official best-practice sources

- [React Navigation: params](https://reactnavigation.org/docs/params/)
- [React Navigation: nesting navigators](https://reactnavigation.org/docs/nesting-navigators/)
- [React Navigation: navigation lifecycle](https://reactnavigation.org/docs/navigation-lifecycle)
- [React Navigation: useFocusEffect](https://reactnavigation.org/docs/use-focus-effect/)
- [React Navigation: custom Android back handling](https://reactnavigation.org/docs/custom-android-back-button-handling/)
- [React Navigation: preventing going back](https://reactnavigation.org/docs/preventing-going-back/)
- [React Navigation: deep linking](https://reactnavigation.org/docs/deep-linking/)
- [React Navigation: configuring links](https://reactnavigation.org/docs/configuring-links/)
- [React Navigation: state persistence](https://reactnavigation.org/docs/state-persistence/)
- [React Navigation: auth flow](https://reactnavigation.org/docs/auth-flow/)
- [React Navigation: screen tracking for analytics](https://reactnavigation.org/docs/screen-tracking/)
- [React Navigation: navigating without the navigation prop](https://reactnavigation.org/docs/navigating-without-navigation-prop/)
- [React Navigation: static and dynamic APIs](https://reactnavigation.org/docs/static-and-dynamic-apis/)
- [React Navigation: TypeScript](https://reactnavigation.org/docs/typescript/)
- [React Navigation: upgrading from 6.x](https://reactnavigation.org/docs/upgrading-from-6.x/)
- [React Navigation: navigation object reference](https://reactnavigation.org/docs/navigation-object/)
- [React Navigation blog: React Navigation 7.0](https://reactnavigation.org/blog/2024/11/06/react-navigation-7.0/)
- [React Navigation: troubleshooting](https://reactnavigation.org/docs/troubleshooting/)
- [React Navigation: native stack navigator](https://reactnavigation.org/docs/native-stack-navigator/)
- [React Navigation: CommonActions.reset](https://reactnavigation.org/docs/navigation-actions/#reset)
- [React Navigation GitHub releases](https://github.com/react-navigation/react-navigation/releases)
- [react-native-screens README](https://github.com/software-mansion/react-native-screens#readme)
- [Expo docs: react-native-screens](https://docs.expo.dev/versions/latest/sdk/screens/)

### best-practice inventory

- `B1`: keep route params minimal and JSON-serializable.
- `B2`: navigate nested routes with explicit `{ screen, params }` contracts.
- `B3`: use focus-aware effects and cleanup (`useFocusEffect`).
- `B4`: handle Android hardware back with scoped subscriptions and cleanup.
- `B5`: guard unsaved changes with leave-prevention patterns.
- `B6`: configure deep links with explicit path mapping and invalid-input fallback.
- `B7`: persist/rehydrate nav state safely, with initial URL precedence on cold start.
- `B8`: implement auth flow by conditional navigator structure (`navigationKey` patterns), not ad hoc redirects.
- `B9`: use native stack and `react-native-screens` options intentionally (`enableScreens`, freeze/detach policies).
- `B10`: keep tab/drawer performance predictable with lazy/detach options where appropriate.
- `B11`: model modal presentation and dismiss semantics explicitly per platform.
- `B12`: keep route-derived UI state explicit (`setParams`, fallback defaults) to avoid stale views.
- `B13`: keep navigation state serializable and avoid passing callback functions in route params.
- `B14`: use a root navigation ref with readiness guards for out-of-screen navigation triggers.
- `B15`: use TypeScript param list contracts for route names and route param shapes.
- `B16`: prefer React Navigation static object API plus `createStaticNavigation` for predictable tree/config typing in v7+.
- `B17`: do not use deprecated `navigateDeprecated`; use `navigate`/`push`/`replace`/`popTo` semantics explicitly.
- `B18`: do not rely on legacy `navigationInChildEnabled`; nested navigation must use explicit parent-child targeting.
- `B19`: prefer `usePreventRemove` for unsaved-change interception in native-stack flows.
- `B20`: prefer `@react-navigation/native-stack` over deprecated `@react-navigation/stack` v5.
