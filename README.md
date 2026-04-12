# buggy-webapp

A minimal e-commerce demo app with an **intentional production bug** — designed to simulate an SRE incident response workflow.

## The Fix

`GET /api/products` previously returned **500 Internal Server Error**.

**Root cause:** `server.js` was reading `db.catalog.items` but `db.catalog` was `null`, throwing:

```
TypeError: Cannot read properties of null (reading 'items')
```

**Fix applied:** Changed `db.catalog.items` to `db.products` so the endpoint reads directly from the products array.

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
| `GET /` | ✅ 200 | Main page — shows error banner when products fail to load |
| `GET /health` | ✅ 200 | `{ status: "ok" }` |
| `GET /api/products` | ✅ 200 | Returns products list |
| `GET /api/products/:id` | ✅ 200 | Individual product lookup works fine |
| `GET /api/cart` | ✅ 200 | Empty cart |

## Simulating the Incident

1. Start the app → open `http://localhost:4000`
2. Main page shows a red banner: **"500 Internal Server Error"**
3. Post in your Slack channel: `500 Error on main page`
4. The SRE agent responds, asks for details, then:
   - Calls `GET /api/products` to verify the 500
   - Calls `GET /health` to confirm the server is up
   - Opens a Jira ticket with reproduction steps
   - Creates a GitHub branch with the fix and opens a PR

## The Fix

In `server.js`, change line 44:

```js
// Before (broken):
const items = db.catalog.items;

// After (fixed):
const items = db.products;
```
