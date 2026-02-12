# Eval test case specification

## Steps

1. create a folder under a category path like `evals/<category>/<eval-id>`
2. add `prompt.md` with the task prompt
3. add `app/` with the RN scaffold
4. add `app/App.base.tsx` as the starter implementation
5. add `requirements.yaml` with structured LLM-judge requirements
6. optionally add `eval.test.ts` only when deterministic unit checks are needed
7. align `expo`, `react`, and `react-native` versions with the target Expo SDK
8. optionally add `example/` directory, from which all files (regardless of extension, e.g. `.tsx`, `.md`) will be appended to the system prompt of the model with a prefix message that informs it that these are examples of the right approach

## `requirements.yaml` format

### V1

Minimal example:

```yaml
version: 1
inputs:
  files:
    - app/App.base.tsx
requirements: # specifies LLM-judged requirements
  - id: uses-reanimated-library
    description: Must use react-native-reanimated for button animation.
    weight: 1 # optional, specifies relative weight of requirement criteria
```

## Notes

- keep evals self-contained
- keep requirement descriptions concrete and verifiable
- keep requirement descriptions atomic (single check per requirement)
- include only files that are needed for judging
- prefer small input file sets to control judge token usage
