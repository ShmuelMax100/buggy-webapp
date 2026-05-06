# buggy-webapp

A minimal e-commerce demo app designed to simulate an SRE incident response workflow.

## The Fix

`GET /api/products` previously returned **500 Internal Server Error**.

**Root cause:** `server.js` was reading `db.catalog.items` but `db.catalog` was `null`, throwing:

```
TypeError: Cannot read properties of null (reading 'items')
```

**Fix applied:** The reference was updated to `db.products`, resolving the 500 error. The main page now correctly loads and displays the product list.

## Setup

```bash
npm install
npm start        # http://localhost:4000
```

Or with auto-reload:
```bash
npm run dev
```

## Endpoints

| Endpoint | Status | Notes |
|----------|--------|-------|
| `GET /` | ✅ 200 | Main page — shows product grid |
| `GET /health` | ✅ 200 | `{ status: "ok" }` |
| `GET /api/products` | ✅ 200 | Returns full product list |
| `GET /api/products/:id` | ✅ 200 | Individual product lookup works fine |
| `GET /api/cart` | ✅ 200 | Empty cart |

## Running the App

1. Start the app → open `http://localhost:4000`
2. Main page now shows the product grid correctly
