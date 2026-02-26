Build a Post Composer with Jotai where submit is handled by an async write atom mutation.
Use atoms for draft text posts list and submit lifecycle state, and commit the created post back into atom state on success.

Use these endpoint patterns:
- Create post `https://dummyjson.com/posts/add`

Use this create payload:
- `{ "title": "<title>", "body": "<body>", "userId": 1 }`

Use these response fields:
- `{ "id": number, "title": string, "body": string, "userId": number }`
- Use `id` and `title` from response when appending created post to local state

Example URL:
- `https://dummyjson.com/posts/add`
