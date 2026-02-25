# App/Reference Label Alignment Report (PR 345)

Date: 2026-02-25

## Scope

- Compare `evals/**/app/App.tsx` against `evals/**/reference/App.tsx`.
- Treat labels as:
  - `title="..."` (button labels)
  - `<Text style={styles.title}>...</Text>` (screen title labels)

## Changes Applied

- Synchronized single-CTA button labels from app to reference where reference did not already include the app label.
- Synchronized single category titles for `async-state`, `device-permissions`, and `storage` evals.
- For 9 navigation baselines where `Open` had no matching static reference label, switched baseline CTA label to an existing screen label in the same file.
- Parsing and leakage checks remained clean after alignment:
  - YAML parse: `total 140 bad 0`
  - Requirement duplication: `duplicatedRequirementSignals: 0`

## Result Summary

- Total evals: **140**
- Evals with label drift after pass: **48**
- Prior label drift baseline (before this pass): **107**
- Current label drift: **48**
- Modified-label reuse check (labels added in app vs reference labels): **0 missing** across **98** evals with added labels

## Remaining Drift (Needs Manual Review)

These are mostly navigation cases where app title labels do not map 1:1 to static labels in reference (often dynamic header/title behavior).

### navigation/23-rn-nav-deeplink-nested-thread

- button: `Open`
- title: `Feed`
- title: `FeedDetails`
- title: `Messages`
- title: `Thread`

### navigation/47-rn-nav-drawer-tab-stack-deeplink-map

- button: `Open`
- title: `HomeFeed`
- title: `HomeDetails`
- title: `Settings`
- title: `NotFound`

### navigation/05-rn-nav-tabs-three-sections

- button: `Open`
- title: `Home`
- title: `Search`
- title: `Profile`

### navigation/19-rn-nav-tabs-lazy-first-render

- button: `Open`
- title: `Home`
- title: `Search`
- title: `Profile`

### navigation/22-rn-nav-tab-stacks-independent-history

- title: `Feed`
- title: `FeedDetails`
- title: `Settings`
- title: `SettingsDetails`

### navigation/28-rn-nav-notification-routing-service

- title: `Feed`
- title: `Messages`
- title: `Profile`
- title: `NotificationTarget`

### navigation/06-rn-nav-home-tab-nested-details

- title: `HomeFeed`
- title: `ArticleDetails`
- title: `Settings`

### navigation/07-rn-nav-drawer-account-help

- button: `Open`
- title: `Account`
- title: `Help`

### navigation/18-rn-nav-nested-notification-target

- title: `NotificationsList`
- title: `NotificationDetails`
- title: `Feed`

### navigation/20-rn-nav-hide-tabbar-on-details

- title: `Feed`
- title: `FullScreenDetails`
- title: `Settings`

### navigation/21-rn-nav-checkout-reset-success

- title: `Cart`
- title: `Shipping`
- title: `Success`

### navigation/24-rn-nav-deeplink-parse-number

- button: `Open`
- title: `Orders`
- title: `OrderDetails`

### navigation/27-rn-nav-header-action-stateful

- button: `Open`
- title: `Items`
- title: `ItemDetails`

### navigation/29-rn-nav-drawer-back-priority

- title: `Dashboard`
- title: `ConversationDetails`
- title: `Help`

### navigation/34-rn-nav-signout-clears-history

- title: `SignIn`
- title: `PrivateHome`
- title: `AccountDetails`

### navigation/35-rn-nav-multistep-form-flow

- title: `StepOne`
- title: `StepTwo`
- title: `StepThree`

### navigation/36-rn-nav-deeplink-query-filters

- button: `Open`
- title: `Feed`
- title: `FilterPreview`

### navigation/39-rn-nav-tabs-with-modal-layer

- title: `Feed`
- title: `Profile`
- title: `ComposeModal`

### navigation/41-rn-screens-detach-tabs-draft-retention

- button: `Open`
- title: `Inbox`
- title: `Compose`

### navigation/43-rn-nav-auth-deeplink-resume-target

- title: `Landing`
- title: `SignIn`
- title: `ProtectedDetails`

### navigation/48-rn-nav-main-modal-group-architecture

- title: `MainBoard`
- title: `MainDetails`
- title: `ComposeModal`

### navigation/03-rn-nav-stack-header-from-param

- title: `People`
- title: `PersonDetails`

### navigation/08-rn-nav-picker-result-return

- title: `Form`
- title: `ColorPicker`

### navigation/11-rn-nav-deeplink-invalid-fallback

- title: `Entry`
- title: `Profile`

### navigation/12-rn-nav-android-back-selection-mode

- title: `SelectionEntry`
- title: `SelectableList`

### navigation/13-rn-nav-unsaved-edit-confirm

- title: `ProfileOverview`
- title: `EditProfile`

### navigation/14-rn-nav-focus-refresh-inbox

- title: `Inbox`
- title: `MessageDetails`

### navigation/15-rn-nav-blur-cleanup-interval

- title: `Polling`
- title: `Other`

### navigation/16-rn-nav-persist-last-route

- title: `LibraryHome`
- title: `LibraryDetails`

### navigation/17-rn-nav-auth-switch-stacks

- title: `SignIn`
- title: `AppHome`

### navigation/25-rn-nav-chat-push-multiple-threads

- title: `Threads`
- title: `ThreadDetails`

### navigation/26-rn-nav-live-filter-setparams

- title: `Feed`
- title: `FeedDetails`

### navigation/30-rn-nav-root-double-back-exit

- title: `RootEntry`
- title: `ExitPreview`

### navigation/31-rn-nav-persistence-url-precedence

- title: `Landing`
- title: `Promo`

### navigation/32-rn-nav-screen-analytics-tracking

- title: `Feed`
- title: `FeedDetails`

### navigation/33-rn-nav-onboarding-gated-main

- title: `Onboarding`
- title: `MainHome`

### navigation/37-rn-nav-focus-fetch-abort

- title: `Feed`
- title: `RequestStatus`

### navigation/38-rn-nav-avoid-duplicate-current-route

- title: `ItemList`
- title: `ItemDetails`

### navigation/42-rn-nav-android-transparent-modal-back

- title: `OverlayEntry`
- title: `TransparentModal`

### navigation/44-rn-nav-persisted-state-migration

- title: `StateHome`
- title: `StateDetails`

### navigation/45-rn-nav-rapid-push-pop-cancel-safe

- title: `RequestQueue`
- title: `RequestDetails`

### navigation/46-rn-nav-gesture-back-parity

- title: `FlowStart`
- title: `CriticalStep`

### navigation/49-rn-nav-predictive-back-before-remove

- title: `DraftList`
- title: `EditDraft`

### navigation/50-rn-nav-static-typesafe-route-contract

- title: `Catalog`
- title: `CatalogDetails`

### navigation/01-rn-nav-stack-product-details

- title: `ProductDetails`

### navigation/02-rn-nav-stack-filter-default

- title: `NotificationsHome`

### navigation/04-rn-nav-modal-compose-note

- title: `ComposeNote`

### navigation/10-rn-nav-deeplink-profile-basic

- title: `Entry`

## Recommended Next Refactor Step

1. For remaining navigation evals, align route/screen title contracts between baseline and reference at the route-definition level (not by copy-only replacements).
2. Where reference titles are intentionally dynamic, reduce static title text in baseline app to avoid non-actionable drift.
3. Keep alignment checks focused on reusable UI labels, not helper paragraphs.
