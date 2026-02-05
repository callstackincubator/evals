# adding an eval

## steps

1. create a folder under `evals/<eval-id>`
2. add `prompt.md` with the task prompt
3. add `eval.test.ts` with bun tests
4. add `package.json` and `tsconfig.json` for the eval
5. add `app/` with the rn source scaffold
6. add `app/App.base.tsx` as the starter implementation used to seed `app/App.tsx` in run workspaces
7. align `expo`, `react`, and `react-native` versions with the latest expo sdk

## notes

- evals are self-contained and should not rely on shared app code
- keep `App.base.tsx` minimal and task-agnostic so models start from the same baseline
