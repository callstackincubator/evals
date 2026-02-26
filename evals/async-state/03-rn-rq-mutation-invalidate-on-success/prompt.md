Build an Items screen with TanStack Query where users can load items and create a new item from the composer.

Use these endpoint patterns:
- Items list: `https://dummyjson.com/todos?limit=<limit>&skip=<skip>`
- Create item: `https://dummyjson.com/todos/add`

Use this create payload:
- `{ "todo": "<title>", "completed": false, "userId": 1 }`

Example URLs:
- `https://dummyjson.com/todos?limit=10&skip=0`
- `https://dummyjson.com/todos/add`
