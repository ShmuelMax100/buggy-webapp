/**
 * Regression Test for SRE-31: Fix 500 error on GET /api/products
 *
 * Summary: This test ensures that the /api/products endpoint returns a 200
 * status and a non-empty array of products.
 */

const assert = require('node:assert/strict');
const test = require('node:test');
const http = require('http');
const app = require('../../server');

test('GET /api/products should return 200 and a non-empty array', async (t) => {
  await t.test('Response validation', (done) => {
    const server = http.createServer(app);

    server.listen(() => {
      const { port } = server.address();
      const options = {
        hostname: 'localhost',
        port,
        path: '/api/products',
        method: 'GET',
      };

      const req = http.request(options, (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          assert.strictEqual(res.statusCode, 200, 'Expected status code 200');
          const body = JSON.parse(data);
          assert(Array.isArray(body.products), 'Expected products to be an array');
          assert(body.products.length > 0, 'Expected products array to be non-empty');
          server.close(done);
        });
      });

      req.on('error', (err) => {
        server.close(() => done(err));
      });

      req.end();
    });
  });
});