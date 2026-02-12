# Running

## Index of documents

- `README.md` (this file) - general setup, configuration & running instructions
- [`eval-spec.md`](eval-spec.md) - test case format spec & instruction on how to create a benchmark test case
- [`llm/llm-benchmark-authoring-spec-v1.md`](./llm/llm-benchmark-authoring-spec-v1.md) - instructions

## Prerequisites

- install dependencies: `bun install`
- create local config: `cp config.json.example config.json`
- set `apiKey` in `config.json` (required unless `mockTestedLLM` is `true`)
- optional `baseURL` (keep `null` for default endpoint)
- install and authenticate `opencode`

## Execute benchmark

- run all discovered evals: `bun runner/index.ts`
- run with debug artifacts: `bun runner/index.ts --debug`
- run just one eval: `bun runner/index.ts --just-one`

Configuration values are in root `config.json`:

- `concurrency`
- `model`
- `solverModel`
- `mockTestedLLM` (use mocked tested-model output)
- `mockJudgeLLM` (use mocked judge decisions)
- `apiKey`
- `baseURL` (`null` to use default OpenAI endpoint)
- `pattern`
- `timeout`
- `port`
- `solverTimeout`

## Defaults

Configured defaults in `config.json`:

- discovery root: `evals`
- discovery pattern: `**/requirements.yaml`
- output directory: `results`
- per-eval artifacts: always written
- default concurrency: `4`
- default model: `openai/gpt-5.3-codex`
- default timeout: `120000`
- default port: `4096`
- default solver model: `gpt-4.1-mini`
- mockTestedLLM: `false`
- mockJudgeLLM: `false`
- default solver timeout: `120000`
- baseURL: `null` (default OpenAI endpoint)
- debug artifacts: off by default (enable via `--debug`)

## OpenCode SDK flow

The judge runner uses AI SDK v6 with the Open Code provider:

1. create provider with `createOpencode`
2. auto-start local Open Code server
3. call `generateText` with `Output.object` schema
4. map structured requirement results into weighted eval score

## Runtime execution flow

The benchmark pipeline runs in clear phases:

1. Discovery phase
   - discover evals by `pattern` from `config.json`
   - optionally trim to one eval with `--just-one`
2. Run setup phase
   - create run output directories
   - create generated workspace for solver outputs
3. Concurrent eval phase
   - process evals with bounded concurrency (`concurrency`)
4. Solver phase (per eval, multi-step)
   - load requirements + declared input files + optional `example/`
   - copy solver template files into generated eval directory
   - iterate up to max steps (currently `10`):
     - run tested model solver
     - run static checks (`eslint`, `tsc`, `CC`)
     - store per-step metrics in `solver.steps`
   - terminate early on:
     - no code issues, or
     - `mockTestedLLM=true`
5. Judge phase (per eval)
   - run requirement-based LLM judge on final generated files
   - or use mocked judge output when `mockJudgeLLM=true`
6. Aggregation phase
   - compute weighted requirement score per eval
   - write per-eval artifact and run summary
   - print progress logs and final results table

Concurrency semantics:

- across evals: concurrent, bounded by `concurrency`
- within one eval: solver steps are sequential
- judge call: one call after the final solver step for that eval

## Outputs

Per run:

- `results/<run-id>/summary.json`
- `results/<run-id>/evals/<eval-id>.json` (when enabled)
- `results/<run-id>/debug/<eval-id>/judge-prompt.txt` (debug mode)
- `results/<run-id>/debug/<eval-id>/judge-output.json` (debug mode)

### `solver.steps` format

Each eval result includes `solver.steps` as an array of step metrics:

```json
[
  {
    "step": 1,
    "outputFileCount": 2,
    "eslint": { "errorCount": 0, "warningCount": 1 },
    "tsc": { "errorCount": 0, "warningCount": 0 },
    "CC": 3,
    "summary": "optional model summary",
    "errors": []
  }
]
```

Field meanings:

- `step`: 1-based solver iteration number
- `outputFileCount`: number of files generated at this step
- `eslint.errorCount` / `eslint.warningCount`: ESLint issue counts for generated output
- `tsc.errorCount` / `tsc.warningCount`: TypeScript check issue counts for generated output
- `CC`: total cyclomatic complexity (uppercase key by design)
- `summary`: optional solver summary text for that step
- `errors`: solver errors captured during that step

Console results table shows a compact `steps` column using:

- `#<step>(E<eslintErrors>/W<eslintWarnings>,T<tscErrors>/W<tscWarnings>,CC<cc>)`
- example: `#1(E0/W1,T0/W0,CC3) #2(E0/W0,T1/W0,CC4)`
