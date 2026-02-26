Build a Profile and Projects screen with TanStack Query where profile data loads first and related rows load after the profile id is available.

Use these endpoint patterns:
- Profile: `https://dummyjson.com/users/1`
- Related rows: `https://dummyjson.com/todos/user/<userId>`

Use these response fields:
- Profile response includes `{ "id": number, "firstName": string, "lastName": string }`
- Related rows response includes `{ "todos": [{ "id": number, "todo": string, "completed": boolean, "userId": number }] }`
- Use profile `id` to request related rows and map row title from `todo`

Example URLs:
- `https://dummyjson.com/users/1`
- `https://dummyjson.com/todos/user/1`
