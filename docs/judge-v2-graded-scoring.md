# Judge methodology v2 — graded partial-credit scoring

`methodologyVersion: 2` changes how the LLM judge scores submissions. It is a
backward-incompatible scoring change: **v2 scores are not comparable to v1, and
any existing leaderboard must be re-judged before models are compared.**

## Why

v1 scored each requirement as binary pass/fail and graded largely on literal API
matching. In practice this **rejected functionally correct, idiomatic code** when
it reached a requirement's goal through a valid alternative API. For example, a
login flow that prevents back-navigation via `navigation.reset(...)` was failed
because the requirement named the declarative `if`-guard pattern; a velocity-aware
snap animation using `withSpring` was failed because the requirement named
`withTiming`. Both are correct, idiomatic React Native — the score should reflect
that, not penalize valid variety.

## What changed

1. **Graded partial credit.** Each requirement is scored `0..1`
   (`1 / 0.75 / 0.5 / 0.25 / 0`) instead of binary. Per-eval `scoreRatio` is the
   weighted mean of graded scores.
2. **Intent-based judging.** The judge grades each requirement on its underlying
   goal (a behavior, correctness property, or API constraint) and **awards full
   credit for valid idiomatic alternatives** that meet the intent. Low scores are
   reserved for genuinely unmet goals, incorrect/broken code, and explicit
   evidence-gated prohibitions (e.g. avoiding a deprecated/unsafe API).
3. **Code-quality dimension.** Each eval gets a `codeQuality` score `0..1` (with
   notes) measuring idiomatic, production-ready ("Callstack-quality") craft,
   independent of literal requirement matching. The run summary reports
   `averageCodeQuality`.
4. **File-path-aware prompts.** Submitted files are now tagged with their path in
   the judge prompt, so path-scoped and import-scoped criteria are checked against
   the correct file (previously the judge saw unlabeled file contents).
5. **Version marker.** Per-eval results and the run summary carry
   `methodologyVersion`, so v1 and v2 results are never silently mixed.

## Output schema

Per requirement: `id`, `score` (0..1), `passed` (derived: `score >= 0.5`),
`reason`, `evidence[]`, optional `confidence`. Per eval: `codeQuality { score,
notes }` and `methodologyVersion`. Summary adds `averageCodeQuality` and
`methodologyVersion`.

Backward compatible: judge rows that omit `score` fall back to the binary
`passed` flag (`1`/`0`), so v1 is the special case `score ∈ {0, 1}`.

## Re-judging existing results

The judge stage is independent of generation, so re-ranking only needs the stored
generation artifacts (`manifest.json` + solver outputs) — no regeneration:

```bash
bun runner/judge.ts \
  --model openrouter/anthropic/claude-sonnet-4.6 \
  --input generated/<model-run> \
  --output runs/<model-run>-v2
```

Where generation artifacts are unavailable, regenerate the model first, then
re-judge. **The published 18-model leaderboard predates v2 and must be re-judged
from the maintainers' archived generations (not stored in this repo) before any
v2 comparison or re-rank.**

## Seed result (proof)

`deepseek/deepseek-v4-flash` (solver) judged by `claude-sonnet-4.6`, 66/67 evals,
re-judged on the same generation under v1 and v2:

| Category          | v1 (binary) | v2 (graded) |   Δ    | codeQuality |
| ----------------- | :---------: | :---------: | :----: | :---------: |
| animation         |    0.614    |    0.679    | +0.065 |    0.713    |
| async-state       |    0.650    |    0.689    | +0.039 |    0.723    |
| lists             |    0.676    |    0.709    | +0.034 |    0.762    |
| navigation        |    0.872    |    0.895    | +0.023 |    0.828    |
| react-native-apis |    0.889    |    0.917    | +0.028 |    0.856    |
| expo-sdk          |    1.000    |    0.986    | −0.014 |    0.820    |
| **ALL**           |  **0.732**  |  **0.769**  | +0.037 |  **0.772**  |

The change is discriminating, not inflationary: gains concentrate in the
categories where valid-alternative penalties were common (animation, async-state),
while `expo-sdk` slightly **decreases** — graded scoring can also dock a
previously perfect eval for a minor quality gap. Verified on the cases above:
behavioral requirements the model genuinely satisfied gained partial credit, the
requirements that explicitly mandate a specific mechanism stayed at `0`, and
genuine errors (importing `FlashList` for a `LegendList` task, missing
`keyExtractor`) still score `0`.
