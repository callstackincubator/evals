# RN Evals Dashboard

This app renders React Native eval results from JSON files stored in [`data/official-results`](/Users/damian/Documents/GitHub/rn-evals/data/official-results).

## Current Data Flow

1. The page calls [`loadDashboardData()`](/Users/damian/Documents/GitHub/rn-evals/lib/data/load-data.ts).
2. That loader scans every `*.json` file in [`data/official-results`](/Users/damian/Documents/GitHub/rn-evals/data/official-results).
3. Each file is validated with the Zod schema in [`lib/types/evals.ts`](/Users/damian/Documents/GitHub/rn-evals/lib/types/evals.ts).
4. The validated data is normalized in [`normalizeDashboardData()`](/Users/damian/Documents/GitHub/rn-evals/lib/data/normalize.ts).
5. The normalized dataset is passed into the dashboard UI in [`app/page.tsx`](/Users/damian/Documents/GitHub/rn-evals/app/page.tsx).

## What Happens When You Add Data

- A new JSON file in [`data/official-results`](/Users/damian/Documents/GitHub/rn-evals/data/official-results) is treated as a new model automatically.
- The model id comes from the filename. Example: `gpt-5.3-codex.json` becomes `gpt-5.3-codex`.
- Replacing an existing JSON file updates that model automatically.
- New categories are discovered from `per_eval[].category`.
- Unknown categories still render, but they use fallback ordering, icon, and chart color unless you add explicit UI mappings.

## Deployment Behavior

This app is intended to use a Git-driven deployment flow on Vercel.

That means:

- In local development, editing or adding JSON files under [`data/official-results`](/Users/damian/Documents/GitHub/rn-evals/data/official-results) is picked up by the local dev server.
- In production on Vercel, the JSON files are read during build/deploy from the contents of the repository.
- To publish new results, add or update the JSON files in Git and push the change so Vercel creates a new deployment.
- Runtime uploads to the app filesystem are not the right model on Vercel because deployed functions do not persist those file changes.

## Recommended Update Workflow

1. Add a new model file or update an existing file in [`data/official-results`](/Users/damian/Documents/GitHub/rn-evals/data/official-results).
2. Run tests locally.
3. Commit and push.
4. Let Vercel build a fresh deployment.

This keeps the site fast for visitors because the data is prepared once per deployment rather than reloaded on every request.

## Commands

```bash
npm run dev
npm test
npm run build
```
