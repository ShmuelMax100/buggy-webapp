# buggy-webapp

A minimal e-commerce demo app.

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
| `GET /` | ✅ 200 | Main page |
| `GET /health` | ✅ 200 | `{ status: "ok" }` |
| `GET /api/products` | ✅ 200 | Product listing |
| `GET /api/products/:id` | ✅ 200 | Individual product lookup |
| `GET /api/cart` | ✅ 200 | Empty cart |
