# Starter scaffold contract

This contract defines what `app/App.tsx` should contain before the solver starts.

## Goal

Provide realistic scaffolding so prompts test target behavior, not blank-file bootstrapping.

## Global rules

- `app/` is a starter, not a solution.
- Include only the minimum wiring needed for the category task.
- Keep `reference/` as the complete target implementation.
- Do not pre-implement the requirement behavior in `app/`.
- If a prompt names a concrete operation (for example async fetch/polling, persistence load/save, migration, analytics tracking, or routing helper), add a placeholder function/object for that operation in `app/` so solvers extend existing primitives instead of inventing mocks.
- Prefer stubs over solutions: include named placeholders with `TODO` where behavior belongs.
- Keep starter text generic: provide structure, not a rewritten solution prompt.

## Lists category

`app/App.tsx` should include:

- The list primitive needed by the eval (`FlatList`, `SectionList`, `FlashList`, or `LegendList`).
- Typed seed constants (`ROWS`, `SECTIONS`, `FEED_ITEMS`, etc.) so data is deterministic.
- A minimal row renderer and stable `keyExtractor` baseline.

`app/App.tsx` should not include:

- The exact optimization or bug-fix behavior requested by the prompt (for example final pagination guards, recycle-state safety logic, or full memoization strategy).

## Animation category

`app/App.tsx` should include:

- Concrete UI structure and example data needed by the motion target (for example card sections, copy strings, rows).
- Named placeholders where motion behavior will be implemented.

`app/App.tsx` should not include:

- Pre-implemented animation behavior for implementation-first prompts (for example `useAnimatedStyle`, shared-value interpolation, gesture arbitration, or spring/timing wiring) unless the prompt explicitly asks to refactor existing animation code.

## Navigation category

`app/App.tsx` should include:

- A real React Navigation scaffold (`native-stack`, `tabs`, `drawer`, or nested shell depending on eval topology).
- Placeholder screens and route names sufficient to implement the prompt behavior.

`app/App.tsx` should not include:

- The exact behavioral requirement under test (for example final deep-link mapping, back-handler edge-case logic, analytics dedupe guarantees, or auth-resume flow correctness).

## Prompt wording guidance

- Keep prompts focused on behavioral outcomes.
- Remove setup wording only when setup is now scaffolded in `app/`.
- Retain constraints and edge-case expectations that the eval is meant to judge.
- Keep shells minimal and deterministic: include only category primitives (navigator/list/state/permission/storage/animation wiring) needed to start implementation.
- Avoid eager starters: do not pre-implement domain mappings, conflict logic, or edge-case branches from the prompt.
- Avoid inference pressure: if a prompt references a concrete operation, ensure that operation exists in `app/`.
