Build a Preferences screen with Legend State persisted settings.
Persist the preferences observable to AsyncStorage through Legend State's persist plugin, track hydration through the observable sync state, and only render preference dependent content after persisted data has loaded.
After hydration, load and show a profile preview from the API.

Use this endpoint pattern after hydration:

- Profile preview `https://dummyjson.com/users/1`

Use these response fields:

- `{ "firstName": string, "lastName": string }`
- Build profile preview text from `firstName` and `lastName`

Example URL:

- `https://dummyjson.com/users/1`
