const request = require('supertest');
const app = require('./server');

describe('GET /api/products', () => {
  it('returns 200 with a products array (regression: was 500 due to db.catalog.items)', async () => {
    const res = await request(app).get('/api/products');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.products)).toBe(true);
    expect(res.body.products.length).toBeGreaterThan(0);
  });

  it('each product has id, name, price, and stock fields', async () => {
    const res = await request(app).get('/api/products');
    for (const product of res.body.products) {
      expect(product).toHaveProperty('id');
      expect(product).toHaveProperty('name');
      expect(product).toHaveProperty('price');
      expect(product).toHaveProperty('stock');
    }
  });
});
