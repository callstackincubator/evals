Configure TanStack Query in React Native so feed data stays fresh across app lifecycle and network changes.

When the app returns to active state or regains internet connectivity (detected with React Native AppState and `@react-native-community/netinfo`), you must refetch stale feed.

Use this endpoint pattern:

- Activity feed `https://dummyjson.com/todos?limit=<limit>&skip=<skip>`

Use these response fields:

- `{ "todos": [{ "id": number, "todo": string, "completed": boolean }] }`
- Render feed rows from `todo`

Example URL:

- `https://dummyjson.com/todos?limit=3&skip=0`
