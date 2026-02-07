# navigation eval research (feature-first)

## scope

This document is the reference for the navigation category eval pack under `evals/navigation/`.

## official best-practice sources

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
- [React Navigation: troubleshooting](https://reactnavigation.org/docs/troubleshooting/)
- [React Navigation: native stack navigator](https://reactnavigation.org/docs/native-stack-navigator/)
- [React Navigation: CommonActions.reset](https://reactnavigation.org/docs/navigation-actions/#reset)
- [react-native-screens README](https://github.com/software-mansion/react-native-screens#readme)
- [Expo docs: react-native-screens](https://docs.expo.dev/versions/latest/sdk/screens/)

## best-practice inventory

- `B1`: keep route params minimal and JSON-serializable
- `B2`: navigate nested routes with explicit `{ screen, params }` contracts
- `B3`: use focus-aware effects and cleanup (`useFocusEffect`)
- `B4`: handle Android hardware back with scoped subscriptions and cleanup
- `B5`: guard unsaved changes with leave-prevention patterns
- `B6`: configure deep links with explicit path mapping and invalid-input fallback
- `B7`: persist/rehydrate nav state safely, with initial URL precedence on cold start
- `B8`: implement auth flow by conditional navigator structure (`navigationKey` patterns), not ad hoc redirects
- `B9`: use native stack and `react-native-screens` options intentionally (`enableScreens`, freeze/detach policies)
- `B10`: keep tab/drawer performance predictable with lazy/detach options where appropriate
- `B11`: model modal presentation and dismiss semantics explicitly per platform
- `B12`: keep route-derived UI state explicit (`setParams`, fallback defaults) to avoid stale views
- `B13`: keep navigation state serializable and avoid passing callback functions in route params
- `B14`: use a root navigation ref with readiness guards for out-of-screen navigation triggers
- `B15`: use TypeScript param list contracts for route names and route param shapes

## coverage against key React Navigation docs

The eval pack covers the most important guides, troubleshooting topics, and APIs:

- params and param contracts: `01`, `02`, `08`, `26`, `35`, `50`
- headers and header actions: `03`, `27`
- nested navigators and nested targets: `06`, `18`, `22`, `47`
- deep linking and link config: `10`, `11`, `23`, `24`, `36`, `47`
- focus lifecycle and cleanup: `14`, `15`, `37`, `45`
- Android back and leave prevention: `12`, `13`, `29`, `30`, `42`, `46`, `49`
- auth gating and protected-route resume: `09`, `17`, `33`, `34`, `43`
- state persistence, URL precedence, and migration: `16`, `31`, `44`
- analytics tracking from root container: `32`
- reset/history control with navigation actions: `21`, `34`
- native stack and `react-native-screens` policies: `40`, `41`, `46`, `49`
- navigation ref API and readiness guard: `28`
- troubleshooting non-serializable params: `08`
- static API + TypeScript param list safety: `50`

## active navigation eval set (50)

### easy (20)

1. [`01-rn-nav-stack-product-details`](./01-rn-nav-stack-product-details)
2. [`02-rn-nav-stack-filter-default`](./02-rn-nav-stack-filter-default)
3. [`03-rn-nav-stack-header-from-param`](./03-rn-nav-stack-header-from-param)
4. [`04-rn-nav-modal-compose-note`](./04-rn-nav-modal-compose-note)
5. [`05-rn-nav-tabs-three-sections`](./05-rn-nav-tabs-three-sections)
6. [`06-rn-nav-home-tab-nested-details`](./06-rn-nav-home-tab-nested-details)
7. [`07-rn-nav-drawer-account-help`](./07-rn-nav-drawer-account-help)
8. [`08-rn-nav-picker-result-return`](./08-rn-nav-picker-result-return)
9. [`09-rn-nav-login-replace-home`](./09-rn-nav-login-replace-home)
10. [`10-rn-nav-deeplink-profile-basic`](./10-rn-nav-deeplink-profile-basic)
11. [`11-rn-nav-deeplink-invalid-fallback`](./11-rn-nav-deeplink-invalid-fallback)
12. [`12-rn-nav-android-back-selection-mode`](./12-rn-nav-android-back-selection-mode)
13. [`13-rn-nav-unsaved-edit-confirm`](./13-rn-nav-unsaved-edit-confirm)
14. [`14-rn-nav-focus-refresh-inbox`](./14-rn-nav-focus-refresh-inbox)
15. [`15-rn-nav-blur-cleanup-interval`](./15-rn-nav-blur-cleanup-interval)
16. [`16-rn-nav-persist-last-route`](./16-rn-nav-persist-last-route)
17. [`17-rn-nav-auth-switch-stacks`](./17-rn-nav-auth-switch-stacks)
18. [`18-rn-nav-nested-notification-target`](./18-rn-nav-nested-notification-target)
19. [`19-rn-nav-tabs-lazy-first-render`](./19-rn-nav-tabs-lazy-first-render)
20. [`20-rn-nav-hide-tabbar-on-details`](./20-rn-nav-hide-tabbar-on-details)
### medium (19)

21. [`21-rn-nav-checkout-reset-success`](./21-rn-nav-checkout-reset-success)
22. [`22-rn-nav-tab-stacks-independent-history`](./22-rn-nav-tab-stacks-independent-history)
23. [`23-rn-nav-deeplink-nested-thread`](./23-rn-nav-deeplink-nested-thread)
24. [`24-rn-nav-deeplink-parse-number`](./24-rn-nav-deeplink-parse-number)
25. [`25-rn-nav-chat-push-multiple-threads`](./25-rn-nav-chat-push-multiple-threads)
26. [`26-rn-nav-live-filter-setparams`](./26-rn-nav-live-filter-setparams)
27. [`27-rn-nav-header-action-stateful`](./27-rn-nav-header-action-stateful)
28. [`28-rn-nav-notification-routing-service`](./28-rn-nav-notification-routing-service)
29. [`29-rn-nav-drawer-back-priority`](./29-rn-nav-drawer-back-priority)
30. [`30-rn-nav-root-double-back-exit`](./30-rn-nav-root-double-back-exit)
31. [`31-rn-nav-persistence-url-precedence`](./31-rn-nav-persistence-url-precedence)
32. [`32-rn-nav-screen-analytics-tracking`](./32-rn-nav-screen-analytics-tracking)
33. [`33-rn-nav-onboarding-gated-main`](./33-rn-nav-onboarding-gated-main)
34. [`34-rn-nav-signout-clears-history`](./34-rn-nav-signout-clears-history)
35. [`35-rn-nav-multistep-form-flow`](./35-rn-nav-multistep-form-flow)
36. [`36-rn-nav-deeplink-query-filters`](./36-rn-nav-deeplink-query-filters)
37. [`37-rn-nav-focus-fetch-abort`](./37-rn-nav-focus-fetch-abort)
38. [`38-rn-nav-avoid-duplicate-current-route`](./38-rn-nav-avoid-duplicate-current-route)
39. [`39-rn-nav-tabs-with-modal-layer`](./39-rn-nav-tabs-with-modal-layer)
### hard (11)

40. [`40-rn-screens-native-stack-freeze-policy`](./40-rn-screens-native-stack-freeze-policy)
41. [`41-rn-screens-detach-tabs-draft-retention`](./41-rn-screens-detach-tabs-draft-retention)
42. [`42-rn-nav-android-transparent-modal-back`](./42-rn-nav-android-transparent-modal-back)
43. [`43-rn-nav-auth-deeplink-resume-target`](./43-rn-nav-auth-deeplink-resume-target)
44. [`44-rn-nav-persisted-state-migration`](./44-rn-nav-persisted-state-migration)
45. [`45-rn-nav-rapid-push-pop-cancel-safe`](./45-rn-nav-rapid-push-pop-cancel-safe)
46. [`46-rn-nav-gesture-back-parity`](./46-rn-nav-gesture-back-parity)
47. [`47-rn-nav-drawer-tab-stack-deeplink-map`](./47-rn-nav-drawer-tab-stack-deeplink-map)
48. [`48-rn-nav-main-modal-group-architecture`](./48-rn-nav-main-modal-group-architecture)
49. [`49-rn-nav-predictive-back-before-remove`](./49-rn-nav-predictive-back-before-remove)
50. [`50-rn-nav-static-typesafe-route-contract`](./50-rn-nav-static-typesafe-route-contract)
