# plan

This plan captures the intended repo structure and eval design. If implementation needs to diverge, note the change explicitly before applying it.

## repository structure

```
evals/
  rn-anim-animated-button-behavior/
    prompt.md
    eval.test.ts
    package.json
    tsconfig.json
    app/
  rn-anim-animated-button-prefer-reanimated/
  rn-anim-animated-button-reanimated/
runner/
  index.ts
  config.ts
  discover.ts
  workspace.ts
  model/
  report/
bench.config.json
results/
runs/
docs/
  methodology.md
  adding-an-eval.md
```

## eval folder contract

- each eval is a self-contained rn app under `evals/<eval-id>/`
- required files: `prompt.md`, `package.json`, `app/`
- tests live in `eval.test.ts` and run via bun
- evals are isolated; runner never mutates originals

## animation eval group

### eval a: behavior
- name: `rn-anim-animated-button-behavior`
- prompt: implement an animated button
- goal: measure end-user behavior only
- tests: behavior checks for animation + press feedback

### eval b: preference
- name: `rn-anim-animated-button-prefer-reanimated`
- prompt: implement an animated button
- tests: behavior checks plus preference scoring for reanimated
- reporting fields: `behavior_pass`, `preference_pass`

### eval c: constraint
- name: `rn-anim-animated-button-reanimated`
- prompt: implement an animated button using reanimated
- tests: behavior checks plus required reanimated usage
- reporting fields: `behavior_pass`, `constraint_pass`, `overall_pass`

## runner spec

- discover `evals/*/eval.test.ts`
- for each eval and model:
  - create workspace: `runs/<timestamp>/<eval-id>/<model-id>/`
  - load `prompt.md`
  - call model provider
  - apply output to workspace (patch or files)
  - generate `diff.patch`
  - run bun tests
  - collect results into `results/<timestamp>.json`

## bench config

```json
{
  "models": [
    { "id": "openai/gpt-4.1", "provider": "openai", "params": { "temperature": 0.2, "max_output_tokens": 4000 } }
  ],
  "evals": [
    "evals/rn-anim-animated-button-behavior",
    "evals/rn-anim-animated-button-prefer-reanimated",
    "evals/rn-anim-animated-button-reanimated"
  ],
  "prompt_source": "prompt.md",
  "workspace_root": "runs",
  "report": "results"
}
```
