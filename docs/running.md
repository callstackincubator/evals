# running

## prerequisites

- install dependencies: `bun install`
- install and authenticate `opencode` if using `llm-judge`

## execute benchmark

- run all evals: `bun runner/index.ts --all`
- run one eval: `bun runner/index.ts --eval <eval-id>`
- run with config: `bun runner/index.ts --config bench.config.json --all`
- run local noop benchmark: `bun run bench:local`

## runner selection

Enable runners in config using `runners`:

```json
{
  "runners": ["llm-judge"]
}
```

Supported values:

- `unit` (optional per eval; skipped when `eval.test.ts` is missing)
- `llm-judge` (primary)

## llm judge configuration

- `LLM_JUDGE_MODEL`: judge model id (`provider/model`), default `openai/gpt-5.3-codex`
- `LLM_JUDGE_TIMEOUT_MS`: SDK server startup/judge timeout in milliseconds
- `LLM_JUDGE_PORT`: server port used by Open Code SDK (default `4096`)

## open code sdk flow

The judge runner uses AI SDK v6 with the Open Code provider:

1. create provider with `createOpencode`
2. auto-start local Open Code server
3. call `generateText` with `Output.object` schema
4. map structured requirement results into `runner_results`

## outputs

Per workspace (`runs/<run-id>/<model-id>/<eval-id>/`):

- `diff.patch`
- `model-output.json`
- `run-results.json`
- `eval-results.json` (from bun tests, only when unit tests are present and executed)
- `judge-prompt.txt` (llm-judge)
- `judge-output.txt` (llm-judge)

Aggregate report:

- `results/<run-id>.json`
