# adding an eval

## steps

1) create a folder under `evals/<eval-id>`
2) add `prompt.md` with the task prompt
3) add `eval.test.ts` with bun tests
4) add `package.json` and `tsconfig.json` for the eval
5) add `app/` with the rn source scaffold
6) align `expo`, `react`, and `react-native` versions with the latest expo sdk

## notes

- evals are self-contained and should not rely on shared app code
