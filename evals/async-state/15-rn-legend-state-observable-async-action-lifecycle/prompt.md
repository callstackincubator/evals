Using Legend State v3, build a feed screen with an explicit async action lifecycle (idle, loading, success, error) driven by store actions.
Keep feed state in a Legend State observable store, write lifecycle transitions from the fetch action, and read state in components through tracked hooks.

Use this endpoint pattern:

- Feed items `https://dummyjson.com/todos?limit=<limit>&skip=<skip>`

Use this response shape:

- `{ "todos": [{ "id": number, "todo": string, "completed": boolean }] }`
- Map feed entries from `todo`

Example URL:

- `https://dummyjson.com/todos?limit=3&skip=0`
