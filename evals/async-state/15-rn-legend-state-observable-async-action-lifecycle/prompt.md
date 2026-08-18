Using Legend State, build a feed screen with an async action lifecycle state.
Keep feed state in a Legend State observable store and read it in components through tracked hooks.

Use this endpoint pattern:

- Feed items `https://dummyjson.com/todos?limit=<limit>&skip=<skip>`

Use this response shape:

- `{ "todos": [{ "id": number, "todo": string, "completed": boolean }] }`
- Map feed entries from `todo`

Example URL:

- `https://dummyjson.com/todos?limit=3&skip=0`
