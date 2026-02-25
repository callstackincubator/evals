# Eval Scaffolding Audit - PR 345 (2026-02-25)

## Scope

- Branch/commit analyzed: `pr-345` @ `b1dc1aa`
- Eval count: 140 (`requirements.yaml` discovered under `evals/**`)
- Per-eval artifacts reviewed:
  - `prompt.md`
  - `requirements.yaml`
  - `app/App.tsx`

## Assumptions

- "Requirement duplicated in app" means baseline `app/App.tsx` already satisfies all or part of a judged requirement.
- Stage 1 checks prompt clarity against actual baseline context in `app/`.
- Stage 2 checks requirement leakage into baseline (the scaffold already doing judged work).

## Executive summary

1. **PR 345 is a large improvement over blank scaffolds.**
   - The previous global `Hello World` baseline is replaced with category/domain-specific starter apps.
2. **Prompts are now generally understandable in context of `app/`.**
   - App scaffolds seed domain data and include explicit TODO placeholders tied to eval intent.
3. **New issue introduced: partial over-scaffolding in some evals.**
   - A subset of requirements is already satisfied by baseline setup (especially navigation structure and list implementation-choice requirements).
4. **YAML parsing defects remain in 4 requirement files.**

## Quantitative findings

### A. App scaffold quality

- 140/140 evals have exactly one app file (`app/App.tsx`), but now with meaningful starter content.
- LOC distribution for `app/App.tsx`:
  - min 48, p50 71, p75 81, max 121
- Scaffold template diversity improved materially:
  - 127 unique app templates across 140 evals
  - largest shared template appears in 13 evals (animation family)
- Placeholder hooks are consistently present:
  - `TODO: implement` found in 140/140 app files
- Legacy placeholder patterns removed:
  - `Hello World`: 0
  - `Implement:` banner text: 0

### B. Prompt clarity vs app context

- Prompt length (140 evals): min 5, p50 17, p75 21, max 35
- Lists remain terse:
  - 11/18 list prompts are under 12 words
- Prompt->app lexical coupling is now much stronger:
  - 29 evals have >=0.40 overlap
  - 87 evals have >=0.20 overlap
- Prompts still do not explicitly anchor to file context:
  - references to `App.tsx`/`app/` inside prompts: 0

Interpretation:
- Contextual understanding is better because scaffolds now carry domain intent.
- Several prompts are still very short relative to requirement strictness.

### C. Stage 2 - requirement duplication in baseline app

#### High-confidence leakage (baseline already satisfies judged requirement intent)

1. `evals/navigation/22-rn-nav-tab-stacks-independent-history`
   - Baseline already defines one stack per tab (`FeedStack`, `SettingsStack`) and wires them into tabs.
   - This appears to satisfy most/all structural requirements before model work.

2. `evals/navigation/07-rn-nav-drawer-account-help`
   - Baseline already defines explicit drawer `Account` + `Help` routes in config.
   - Requirement scope is nearly fully pre-implemented.

3. `evals/navigation/05-rn-nav-tabs-three-sections`
   - Baseline already defines `Home`, `Search`, `Profile` tab routes.
   - One requirement remains (explicit initial tab), but core route-definition requirement is already done.

4. `evals/navigation/39-rn-nav-tabs-with-modal-layer`
   - Baseline already places `ComposeModal` above tab navigator (`RootStack` wrapping `Tabs`).
   - Architecture requirement is largely pre-satisfied.

#### Broad partial leakage (implementation-choice requirements pre-satisfied)

Using strict token-based matching of requirement intent vs actual imported/used APIs in `app/App.tsx`:

- 22 duplicated requirement signals across 20 evals.
- Concentrated in:
  - **Lists:** 15 evals
  - **Navigation:** 5 evals

Common pattern:
- Requirements say "Must use X technology/API", but baseline already imports/uses X.
- Example: `implementation-rn-core-virtualizedlist-contract` while scaffold already renders `<FlatList>` or `<SectionList>`.
- Example: FlashList/LegendList adoption constraints already met in some scaffolds.

This reduces discriminative power because the model can satisfy part of the rubric without implementing the target behavior.

### D. YAML validity (unchanged blocker)

These 4 files still fail strict YAML parse:

1. `evals/async-state/02-rn-rq-dependent-query-enabled-gate/requirements.yaml`
2. `evals/async-state/03-rn-rq-mutation-invalidate-on-success/requirements.yaml`
3. `evals/storage/11-rn-storage-mmkv-multi-process-app-group/requirements.yaml`
4. `evals/storage/17-rn-storage-sqlite-change-listener-reactivity/requirements.yaml`

Cause: unquoted YAML-special tokens in description strings (for example `enabled: !!profileId`, `queryKey: ITEMS_QUERY_KEY`, `mode: 'multi-process'`, `enableChangeListener: true`).

## Stage 1 verdict (prompt contextual clarity)

- **Mostly pass**: prompts are now contextually understandable against seeded scaffolds.
- **Remaining gap**: many prompts are short and do not explicitly communicate implementation constraints later enforced in requirements.

## Stage 2 verdict (requirements duplicated in app)

- **Fail for a subset**: some evals now start too far ahead, especially structural navigation requirements and "must use X API" requirements.
- The issue shifted from "too empty baseline" to "partially pre-satisfied rubric".

## Recommendations for next refactor pass

1. Keep the new seeded scaffolds, but remove judged requirement leakage.
2. For each eval, ensure baseline includes prerequisite context, not the scored behavior.
3. If scaffold intentionally fixes technology choice (e.g., FlatList vs ScrollView), do one:
   - remove that requirement from rubric, or
   - move it to non-scored assumptions.
4. For navigation evals, avoid fully wiring the exact required architecture in baseline.
   - leave one explicit missing step (route option, linking map, nested target resolution, etc.).
5. Add strict YAML validation in CI for `requirements.yaml`.

## Priority fix list

1. Fix 4 invalid YAML requirement files.
2. De-scope pre-satisfied navigation evals:
   - `navigation/22`, `navigation/07`, `navigation/05`, `navigation/39`, `navigation/06`.
3. Revisit list eval requirements that currently score already-present component usage in baseline.

## Update - app/reference label alignment pass (2026-02-25)

### Goal

- Ensure baseline `app/App.tsx` labels are reused by `reference/App.tsx` unless prompt behavior requires different copy.

### Assumption used for this pass

- "Labels" are treated as:
  - `<Text style={styles.title}>...</Text>` screen headings
  - `title="..."` button labels

### What was changed

1. Applied deterministic, conservative label alignment from `app` to `reference`:
   - synced single-CTA button labels (`title="..."`) where baseline had one action label
   - synced single category titles for `async-state`, `device-permissions`, and `storage` evals
   - changed files: **98** `reference/App.tsx`
   - title replacements: **58**
   - button title replacements: **40**
2. Kept requirement parsing/leakage fixes intact:
   - strict YAML parse: `total 140 bad 0`
   - strict duplication scan: `duplicatedRequirementSignals: 0`

### Current status after alignment

- Full text drift (all static copy, including helper paragraphs) is still high and expected:
  - `withDrift: 139/140`
- Label-only drift dropped materially:
  - before: `107/140`
  - after: `48/140`

### Remaining alignment gap

- Remaining mismatches are concentrated in navigation evals.
- Main causes:
  - app has more static title labels than reference exposes as static text (reference uses dynamic route/header params)
  - tabs/drawer patterns where baseline title set does not have 1:1 static equivalents in reference

### Next refactor target

1. For remaining navigation evals, prefer route-name/title contracts that can remain identical in both baseline and solved app.
2. Avoid baseline labels that cannot exist in solved app due to dynamic header/title requirements.
3. Keep helper paragraph copy out of alignment checks; focus on reusable UI labels only.
