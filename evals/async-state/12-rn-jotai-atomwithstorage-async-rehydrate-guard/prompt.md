Build a Preferences screen with Jotai `atomWithStorage` for persisted settings.
Track hydration completion in atom state and only render preference dependent content after hydration finishes.
After hydration, load and show a profile preview from the API.

Use this endpoint pattern after hydration:
- Profile preview `https://dummyjson.com/users/1`

Use these response fields:
- `{ "firstName": string, "lastName": string }`
- Build profile preview text from `firstName` and `lastName`

Example URL:
- `https://dummyjson.com/users/1`
