# running and mocking

## run the runner

- install deps: `bun install`
- run all evals: `bun runner/index.ts --all`
- run one eval: `bun runner/index.ts --eval <eval-id>`
- use a config: `bun runner/index.ts --config bench.config.json`
- run locally with noop model: `bun runner/index.ts --config bench.local.json --all`

If you run `bun test` directly, results are written under
`runs/<eval-id>/`. The runner sets `EVAL_RESULTS_DIR` so results land
in the workspace.

## mock model output

The runner reads model output from env vars. Use one of the following:

### JSON payload

Set `MODEL_OUTPUT_JSON` to a JSON file that matches the model output shape.

```json
{
  "patch": "diff --git a/app/App.tsx b/app/App.tsx\n..."
}
```

or

```json
{
  "files": [{ "path": "app/App.tsx", "content": "..." }]
}
```

If both are present, files are written first and the patch is applied after.

Example:

```
MODEL_OUTPUT_JSON="/absolute/path/to/model-output.json" bun runner/index.ts --eval <eval-id>
```

## local verification

Use the noop config when you just want to run the base evals without a model.

```
bun runner/index.ts --config bench.local.json --all
```

### Patch payload

Set `MODEL_OUTPUT_PATH` to a patch file.

```
MODEL_OUTPUT_PATH="/absolute/path/to/patch.diff" bun runner/index.ts --eval <eval-id>
```

## outputs

- workspaces: `runs/<timestamp>/<model-id>/<eval-id>/` (temporary)
- diff: `diff.patch` in the workspace
- model output cache: `model-output.json` in the workspace
- run results: `run-results.json` in the workspace
- eval results: `eval-results.json` in the workspace
- report: `results/<timestamp>.json`
