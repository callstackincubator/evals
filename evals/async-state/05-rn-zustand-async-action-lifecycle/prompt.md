Using Zustand, build a feed screen with an async action lifecycle state.

Use this endpoint pattern:
- Feed items `https://dummyjson.com/todos?limit=<limit>&skip=<skip>`

Use this response shape:
- `{ "todos": [{ "id": number, "todo": string, "completed": boolean }] }`
- Map feed entries from `todo`

Example URL:
- `https://dummyjson.com/todos?limit=3&skip=0`
