Build a products screen with TanStack Query where users can change filter tabs (`all`, `smartphones`, `laptops`) and paginate results.

Use these endpoint patterns:
- All products: `https://dummyjson.com/products?limit=<pageSize>&skip=<skip>`
- Category products: `https://dummyjson.com/products/category/<category>?limit=<pageSize>&skip=<skip>`

Use these response fields:
- `{ "products": [{ "id": number, "title": string, "price": number }], "total": number, "skip": number, "limit": number }`
- Map rows from `products` and derive page metadata from `total` `skip` and `limit`

Example URLs:
- `https://dummyjson.com/products?limit=10&skip=0`
- `https://dummyjson.com/products/category/smartphones?limit=10&skip=0`
