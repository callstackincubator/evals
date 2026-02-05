# running and mocking

## run the runner

- install deps: `bun install`
- run all evals: `bun runner/index.ts --all`
- run one eval: `bun runner/index.ts --eval <eval-id>`
- use a config: `bun runner/index.ts --config bench.config.json`

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
  "files": [
    { "path": "app/App.tsx", "content": "..." }
  ]
}
```

If both are present, files are written first and the patch is applied after.

Example:

```
MODEL_OUTPUT_JSON="/absolute/path/to/model-output.json" bun runner/index.ts --eval <eval-id>
```

### Patch payload

Set `MODEL_OUTPUT_PATH` to a patch file.

```
MODEL_OUTPUT_PATH="/absolute/path/to/patch.diff" bun runner/index.ts --eval <eval-id>
```

## outputs

- workspaces: `runs/<timestamp>/<eval-id>/<model-id>/` (temporary)
- diff: `diff.patch` in the workspace
- eval results: `eval-results.json` in the workspace
- report: `reports/<timestamp>.json`
