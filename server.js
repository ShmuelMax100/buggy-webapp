/**
 * buggy-webapp — simple e-commerce demo with an intentional production bug.
 *
 * BUG: GET /api/products reads from `db.catalog.items` but `db.catalog` is
 * null (simulates a failed DB initialisation).  Any request to the products
 * page causes an unhandled TypeError → 500 Internal Server Error.
 *
 * To fix: change `db.catalog` to `db` on line marked "BUG HERE".
 */

const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 4000;

// ── Simulated in-memory "database" ───────────────────────────────────────────
const db = {
  products: [
    { id: 1, name: 'Wireless Headphones', price: 79.99, stock: 42 },
    { id: 2, name: 'Mechanical Keyboard', price: 129.99, stock: 15 },
    { id: 3, name: 'USB-C Hub',           price: 49.99,  stock: 87 },
    { id: 4, name: 'Webcam HD',           price: 89.99,  stock: 0  },
  ],
  catalog: null,   // ← intentional bug: should reference `db` or be removed
};

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// ── Health check (works fine) ─────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── Fixed: /api/products ───────────────────────────────────────────────────────
app.get('/api/products', (_req, res) => {
  try {
    const items = db.products;   // ← Fixed: db.products instead of db.catalog.items
    res.json({ products: items });
  } catch (err) {
    console.error('[ERROR] /api/products failed:', err.message);
    res.status(500).json({
      error: 'Internal Server Error',
      message: err.message,
      path: '/api/products',
    });
  }
});

// ── Working endpoints ─────────────────────────────────────────────────────────
app.get('/api/products/:id', (req, res) => {
  const product = db.products.find(p => p.id === parseInt(req.params.id));
  if (!product) return res.status(404).json({ error: 'Product not found' });
  res.json(product);
});

app.get('/api/cart', (_req, res) => {
  res.json({ items: [], total: 0 });
});

// ── SPA fallback ──────────────────────────────────────────────────────────────
app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`buggy-webapp running at http://localhost:${PORT}`);
  console.log('  GET /             → main page (loads /api/products → will 500)');
  console.log('  GET /health       → health check (OK)');
  console.log('  GET /api/products → Fixed: OK');
});