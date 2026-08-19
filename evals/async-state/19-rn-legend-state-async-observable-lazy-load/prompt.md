Using Legend State v3, rebuild this product details screen around an async observable.
Model the product data as an observable created from an async fetch function so it activates lazily on first tracked read, and derive the loading and error UI from the observable sync state instead of manual status flags.
Do not drive the fetch with `useEffect` or mirror the response in `useState`.

Use this endpoint pattern:

- Product details `https://dummyjson.com/products/<id>`

Use these response fields:

- `{ "title": string, "price": number }`
- Show the product title and price

Example URL:

- `https://dummyjson.com/products/1`
