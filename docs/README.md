# Running

## Index of documents

- `README.md` (this file) - general setup, configuration & running instructions
- [`eval-spec.md`](eval-spec.md) - test case format spec & instruction on how to create a benchmark test case
- [`llm/benchmark-authoring-spec-v1.md`](./llm/benchmark-authoring-spec-v1.md) - instructions

## Prerequisites

- install dependencies: `bun install`
- install and authenticate `opencode` if using the `llm-judge` runner (see `runner selection` section)

## Execute benchmark

- run all evals: `bun runner/index.ts --all`
- run one eval: `bun runner/index.ts --eval <eval-id>`
- run with config: `bun runner/index.ts --config bench.config.json --all`
- run local noop benchmark: `bun run bench:local`

## Runner selection

Enable runners in config using `runners`:

```json
{
  "runners": ["llm-judge", ...]
}
```

Supported values:

- `unit` (optional per eval; skipped when `eval.test.ts` is missing)
- `llm-judge` (primary)
- `harness` (e2e via [react-native-harness](https://github.com/callstackincubator/react-native-harness); enables agent loop and metrics)

## Harness and agent loop

When `harness` is in `runners`, the bench:

1. Uses a single **testbench** Expo app under `testbench/` that runs all e2e test cases via react-native-harness.
2. Runs an **agent loop** (up to `MAX_AGENT_ITERATIONS`, default 10): for each iteration, runs the model, applies output, syncs the workspace app into the testbench, runs harness, static analysis, and unstructured-requirements evaluation; stops when all harness tests pass or max iterations are reached.
3. Collects **per-iteration metrics**: render time (from harness test duration), static code analysis (warnings, block nesting complexity, LOC, component count), and numeric scores from evaluating `unstructured_requirements.md` with the LLM.
4. Prints a **metrics table** at the end.

Servers are started automatically when harness is used:

- **Metro**: started before the first harness run; the runner waits for `http://localhost:8081` then runs harness; stopped when the benchmark finishes. Status is logged with `[metro]` prefix.
- **Open Code** (llm-judge / unstructured): started on demand; status logged with `[llm-judge]` and `[unstructured]` prefixes.

Prerequisites for harness:

- Install testbench deps: run `bun run testbench:merge-deps` from repo root, then `cd testbench && bun install`.
- For web runner no extra setup. For iOS/Android, configure devices in `testbench/rn-harness.config.mjs`.

## LLM judge configuration

- `LLM_JUDGE_MODEL`: judge model id (`provider/model`), default `openai/gpt-5.3-codex`
- `LLM_JUDGE_TIMEOUT_MS`: SDK server startup/judge timeout in milliseconds
- `LLM_JUDGE_PORT`: server port used by Open Code SDK (default `4096`)

## OpenCode SDK flow

The judge runner uses AI SDK v6 with the Open Code provider:

1. create provider with `createOpencode`
2. auto-start local Open Code server
3. call `generateText` with `Output.object` schema
4. map structured requirement results into `runner_results`

## Outputs

Per workspace (`runs/<run-id>/<model-id>/<eval-id>/`):

- `diff.patch`
- `model-output.json`
- `run-results.json`
- `eval-results.json` (from bun tests, only when unit tests are present and executed)
- `judge-prompt.txt` (llm-judge)
- `judge-output.txt` (llm-judge)
- `harness-results.json` (when harness runner is used; Jest JSON output)

Aggregate report:

- `results/<run-id>.json`
