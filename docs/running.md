# running

## prerequisites

- install dependencies: `bun install`
- install and authenticate `opencode` for judge access

## execute benchmark

- run all discovered evals: `bun runner/index.ts`
- run with bounded concurrency: `bun runner/index.ts --limit-concurrency 2`
- run a subset by pattern: `bun runner/index.ts --pattern 'animation/**/requirements.yaml'`
- run with a specific model: `bun runner/index.ts --model openai/gpt-5.3-codex`
- run with timeout/port override: `bun runner/index.ts --timeout 120000 --port 4096`
- run with debug artifacts: `bun runner/index.ts --debug`

## defaults

Fixed defaults in code:

- discovery root: `evals`
- discovery pattern: `**/requirements.yaml` (override via `--pattern`)
- output directory: `results`
- per-eval artifacts: always written
- default concurrency: `4` (override via `--limit-concurrency`)
- default model: `openai/gpt-5.3-codex` (override via `--model`)
- default timeout: `120000` (override via `--timeout`)
- default port: `4096` (override via `--port`)
- debug artifacts: off by default (enable via `--debug`)

## open code sdk flow

The judge runner uses AI SDK v6 with the Open Code provider:

1. create provider with `createOpencode`
2. auto-start local Open Code server
3. call `generateText` with `Output.object` schema
4. map structured requirement results into weighted per-eval score

## outputs

Per run:

- `results/<run-id>/summary.json`
- `results/<run-id>/evals/<eval-id>.json` (when enabled)
- `results/<run-id>/debug/<eval-id>/judge-prompt.txt` (debug mode)
- `results/<run-id>/debug/<eval-id>/judge-output.json` (debug mode)
