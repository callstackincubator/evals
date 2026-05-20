Build a Reports screen using Jotai without `Suspense`.
Keep reports in an async atom, then expose a UI-safe state atom so the screen can render explicit loading data and error branches.

Use this endpoint pattern:
- Reports list `https://dummyjson.com/todos?limit=<limit>&skip=<skip>`

Use these response fields:
- Success response `{ "todos": [{ "id": number, "todo": string, "completed": boolean }] }`
- Map report rows from `id` and `todo`
- Non 2xx response should produce the error branch in UI

Example URL:
- `https://dummyjson.com/todos?limit=3&skip=0`
