Build a Profile screen where remote data is sourced from a Jotai async read atom.
Render the atom consumer inside a React `Suspense` boundary with a loading fallback.

Use this endpoint pattern:
- Profile `https://dummyjson.com/users/1`

Use these response fields:
- `{ "id": number, "firstName": string, "lastName": string }`
- Build display name from `firstName` and `lastName`

Example URL:
- `https://dummyjson.com/users/1`
