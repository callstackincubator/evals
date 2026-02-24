# Adding new eval

## Steps

1. Create a folder under a category path like `evals/<category>/<eval-id>`
2. Add `app/App.tsx` as the starter implementation
3. Add `prompt.md` with the task prompt
4. Add `requirements.yaml` that describe requirements
5. Add `reference/App.tsx` as the reference implementation

## `requirements.yaml` format

### V1

```yaml
version: 1
requirements:
  - id: uses-reanimated-library
    description: Must use react-native-reanimated for button animation.
    weight: 1
  - id: must-use-specific-api
    description: Must use a deterministic API usage pattern that can be judged from files.
    weight: 2
```

You can also provide `weight` parameter to prioritize certain requirements. By default, each requirement has same importance.

### Deterministic `must-` convention

Use the `must-` prefix for deterministic requirements that can be verified directly from source files (for example required imports, API usage, or specific wiring). Set these to `weight: 2` to emphasize them in scoring.

## Notes

- Keep evals self-contained
- Keep requirement descriptions concrete and verifiable
- Keep requirement descriptions atomic (single check per requirement)
- Include only files that are needed for judging
- Prefer small input file sets to control judge token usage
- Prompts must be forward-looking implementation asks, as if requested by a regular app develope
