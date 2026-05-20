Using React `useDeferredValue`, build a searchable list with deferred rendering and a stale-results indicator.

Use this endpoint pattern:

- Default list `https://dummyjson.com/products?limit=<limit>&skip=<skip>`
- Search results `https://dummyjson.com/products/search?q=<query>&limit=<limit>`

Use these response fields:

- `{ "products": [{ "id": number, "title": string }] }`
- Render result rows from `title`

Example URLs:

- `https://dummyjson.com/products?limit=20&skip=0`
- `https://dummyjson.com/products/search?q=phone&limit=20`
