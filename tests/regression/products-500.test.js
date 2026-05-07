/**
 * Regression test for SRE-46: Fixed bug in GET /api/products.
 * Ensures route returns 200 OK with non-empty product list.
 */

const { test } = require('node:test');
const assert = require('node:assert/strict');
const http = require('http');
const app = require('../server');

test('GET /api/products should return 200 and non-empty array', async (t) => {
  const server = http.createServer(app);

  await new Promise((resolve) => server.listen(resolve));
  const address = server.address();
  const url = `http://localhost:${address.port}/api/products`;

  const req = http.request(url, (res) => {
    assert.strictEqual(res.statusCode, 200);

    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
      const body = JSON.parse(data);
      assert(Array.isArray(body.products), 'Response should contain products array');
      assert(body.products.length > 0, 'Products array should not be empty');
      server.close();
    });
  });

  req.end();
});
