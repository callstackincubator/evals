# Testbench

Local sandbox to inspect eval `app` and `reference` implementations side by side.

## Run

From repo root:

```bash
bun run testbench:web
```

## Hardcoded eval target

The active eval target is hardcoded in:

- `testbench/app/App.tsx` (`EVAL_ID` + imports)

Change those imports to any eval path with both:

- `evals/<category>/<eval-id>/app/App.tsx`
- `evals/<category>/<eval-id>/reference/App.tsx`
