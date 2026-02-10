# Runner

This runner evaluates tasks based on `requirements.yaml` and performs one LLM judge call per eval.

## How to run

```bash
bun runner/index.ts
```

Useful flags:

- `--limit-concurrency 4` - limits parallel eval execution
- `--debug` - writes additional artifacts (`judge-prompt.txt`, `judge-output.json`)
- `--model openai/gpt-5.3-codex` - judge model
- `--pattern 'animation/**/requirements.yaml'` - glob pattern under `evals/`
- `--timeout 120000` - OpenCode server timeout
- `--port 4096` - OpenCode server port

## How it works

1. The runner discovers all `evals/**/requirements.yaml` files.
2. For each eval, it loads declared input files.
3. It builds a prompt and calls the structured-output judge.
4. It computes a weighted score from requirement results.
5. It writes:
   - `results/<run-id>/summary.json`
   - `results/<run-id>/evals/<eval-id>.json`
   - optional debug artifacts when `--debug` is enabled

## Structure

- `runner/index.ts` - entrypoint
- `runner/llm/run.ts` - execution pipeline
- `runner/llm/discovery.ts` - eval discovery
- `runner/llm/requirements.ts` - `requirements.yaml` parsing
- `runner/llm/files.ts` - input file loading
- `runner/llm/prompt.ts` - prompt construction
- `runner/llm/judge-client.ts` - OpenCode / AI SDK client
- `runner/llm/utils.ts` - scoring and concurrency
- `runner/llm/output.ts` - artifact writing
