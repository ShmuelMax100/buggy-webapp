/**
 * Regression Test — Jira Ticket: SRE-51
 * Summary: GET /api/products returned 500 due to db.catalog being null.
 */

const assert = require('node:assert/strict');
const { test } = require('node:test');
const http = require('node:http');
const app = require('../../server');

test('GET /api/products should return 200 and a non-empty array', async (t) => {
  const server = http.createServer(app);

  await t.test('Fetch products', async () => {
    const req = http.request({
      hostname: 'localhost',
      port: 4000,
      path: '/api/products',
      method: 'GET',
    }, (res) => {
      assert.strictEqual(res.statusCode, 200);

      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const body = JSON.parse(data);
        assert(Array.isArray(body.products));
        assert(body.products.length > 0);
      });
    });

    req.on('error', (err) => {
      assert.fail(`Request failed: ${err.message}`);
    });

    req.end();
  });

  server.close();
});