# Adding new eval

## Steps

1. Create `evals/<category>/<eval-id>/`.
2. Add `app/App.tsx` as the starter implementation.
3. Add `prompt.md` with a forward-looking implementation ask.
4. Add `requirements.yaml` with atomic, judgeable requirements.
5. Add `reference/App.tsx` as the target implementation.

## `requirements.yaml` format

```yaml
version: 1
inputs:
  files:
    - app/App.tsx
requirements:
  - id: implementation-use-specific-api
    description: Must use a deterministic API usage pattern that can be judged from files.
    weight: 1
  - id: implementation-avoid-legacy-api
    description: Must NOT use deprecated API path X.
    weight: 1
```

Runtime schema enforcement currently validates only:

- `version` (positive integer)
- `requirements[]` with `id`, `description`, optional positive `weight`

Additional fields (for example `inputs`) are allowed as authoring metadata but are ignored by current runtime parsing.

## Authoring standards

- Keep evals self-contained.
- Keep requirements concrete, implementation-level, and file-verifiable.
- Keep requirements atomic: one requirement, one check.
- Use `implementation-` prefix for deterministic API/import/wiring checks.
- Use `MUST NOT` only when backed by primary-source deprecation/removal or correctness caveats.
- Do not reference eval names or numbers in requirement IDs or descriptions.
- Keep `inputs.files` limited to implementation files needed for judging metadata.

## Technical eval structure

- Follow starter baseline rules in [`starter-scaffold-contract.md`](./starter-scaffold-contract.md).
- Keep starter apps minimal: shells + named stubs, no eager behavior implementation.
- Include only files needed for judging.
- Prefer small input file sets to control judge token usage.
- Prompts must be forward-looking implementation asks, as if requested by a regular app developer.

For sibling evals inside one library subgroup:

- Keep shared baseline requirements small (target: at most 2 shared IDs).
- Add at least 3 eval-specific implementation requirements per eval.
- Treat prompt uniqueness as separate from technical uniqueness; uniqueness must come from requirement-level API constraints.
