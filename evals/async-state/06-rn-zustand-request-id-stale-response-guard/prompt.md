Using Zustand, build a Search screen where overlapping requests can race and only the last request wins.

Use this endpoint pattern:
- Search results `https://dummyjson.com/products/search?q=<query>&limit=<limit>`

Use this response shape:
- `{ "products": [{ "id": number, "title": string }] }`
- Build display result from product `title` values

Example URL:
- `https://dummyjson.com/products/search?q=phone&limit=3`
