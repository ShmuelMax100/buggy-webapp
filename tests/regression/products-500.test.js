/**
 * Regression test for SRE-50: Fix 500 error in GET /api/products.
 *
 * The bug was caused by accessing `db.catalog.items` instead of `db.products`.
 * This test ensures the endpoint returns 200 OK and a non-empty array.
 */

const assert = require('node:assert/strict');
const test = require('node:test');
const http = require('node:http');
const { app } = require('../../server');

// Helper function to perform one-shot HTTP requests
function oneShotRequest(app, method, path) {
  return new Promise((resolve, reject) => {
    const server = http.createServer(app);
    server.listen(0, () => {
      const port = server.address().port;
      const options = {
        hostname: 'localhost',
        port,
        path,
        method,
      };

      const req = http.request(options, res => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          server.close();
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        });
      });

      req.on('error', err => {
        server.close();
        reject(err);
      });

      req.end();
    });
  });
}

// Regression test
test('GET /api/products returns 200 OK and a non-empty array', async () => {
  const { status, body } = await oneShotRequest(app, 'GET', '/api/products');

  assert.equal(status, 200, 'Expected 200 OK');
  assert(Array.isArray(body.products), 'Expected `products` to be an array');
  assert(body.products.length > 0, 'Expected `products` array to be non-empty');
});