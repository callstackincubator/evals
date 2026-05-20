Using Zustand, build a Session screen with persisted auth and hydration handling.

Persist only the auth token and track a hydration flag.
Treat login as a token request call to the auth endpoint, then store the returned token.
After token is available, fetch profile name with the bearer token.

When persisted token is restored during rehydration, fetch profile name again.

Show dedicated loading states for session hydration and profile fetch.
Show an error message when token or profile fetch fails.

Use these endpoint patterns:
- Token `https://dummyjson.com/auth/login`
- Profile `https://dummyjson.com/auth/me`

Use this token payload:
- `{ "username": "emilys", "password": "emilyspass", "expiresInMins": 30 }`

Use these response fields:
- Token response includes `{ "accessToken": string }` and may also include `{ "token": string }`
- Profile response includes `{ "firstName": string, "lastName": string }`
- Persist token value and build display name from `firstName` and `lastName`

Example URLs:
- `https://dummyjson.com/auth/login`
- `https://dummyjson.com/auth/me`
