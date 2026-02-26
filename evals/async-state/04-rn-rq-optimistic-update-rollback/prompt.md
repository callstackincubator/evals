Build a Todo List screen with TanStack Query where tapping a row toggles completion optimistically and rolls back if the update request fails.

Use these endpoint patterns:
- Todos list: `https://dummyjson.com/todos?limit=<limit>&skip=<skip>`
- Todo update: `https://dummyjson.com/todos/<id>`

Use this update payload:
- `{ "completed": <nextDone> }`

Example URLs:
- `https://dummyjson.com/todos?limit=10&skip=0`
- `https://dummyjson.com/todos/1`
