# Testing your evals

Use this checklist before opening a PR for new or changed evals.

## Success criteria

An eval update is considered verified when:

- The eval is discovered by the runner (has `requirements.yaml`).
- A focused run completes with `evalsErrored = 0`.
- Per-eval artifacts are written under `results/<run-id>/evals/`.
- If you enabled judging, requirement verdicts are returned for all declared requirements.

## 1) Fast structural smoke test

Run a focused eval with no solver and no judge. This validates discovery, file loading, artifact writing, and basic runner flow.

```bash
bun runner/index.ts --pattern "evals/<category>/<eval-id>/**" --fail-fast
```

Expected outcome:

- One eval is processed.
- `results/<run-id>/summary.json` exists.
- Score fields are `0` when `--model` is not provided.

## 2) Oracle-mode judge check (reference files as generated output)

Run with a judge model but without `--solver-model`. The runner will materialize `reference/` as generated output and judge that output.

```bash
bun runner/index.ts \
  --pattern "evals/<category>/<eval-id>/**" \
  --model "<judge-model>" \
  --debug \
  --fail-fast
```

Expected outcome:

- `evalsErrored = 0`.
- `llmJudgeRequirements` is populated in the per-eval JSON.
- Debug artifacts are written to `results/<run-id>/debug/<eval-id>/`.

Note: judge outcomes are model-dependent. Use this run mainly to validate requirement clarity and mapping behavior.

## 3) End-to-end solver + judge check

Run the eval with both solver and judge configured.

```bash
bun runner/index.ts \
  --pattern "evals/<category>/<eval-id>/**" \
  --solver-model "<solver-model>" \
  --model "<judge-model>" \
  --debug \
  --fail-fast
```

Expected outcome:

- `results/<run-id>/generated/<eval-id>/` contains solver output.
- `results/<run-id>/evals/<eval-id>.json` contains requirement verdicts and score ratio.
- `summary.json` reflects processed/error counts for the run.

## 4) Repo-level checks

For eval/content changes:

```bash
bun lint
```

If you changed runner logic, also run:

```bash
bun test runner
```

## Artifact quick-reference

Runner outputs are written to:

- `results/<run-id>/generated/` generated files under evaluation
- `results/<run-id>/evals/<eval-id>.json` per-eval results
- `results/<run-id>/summary.json` aggregate metrics for the run
- `results/<run-id>/debug/` prompt/output debug files when `--debug` is enabled

## Common pitfalls

- Missing `requirements.yaml` means the eval is invisible to discovery.
- If `--model` is omitted, judge stage is skipped and scores remain `0`.
- If `--solver-model` is omitted, solver stage uses `reference/` files (oracle mode).
- `testbench/` is not part of the active benchmark runner path.
