/**
 * Regression test for SRE-42: Fix GET /api/products 500 error.
 * Bug summary: db.catalog.items was null, causing TypeError.
 */

const assert = require('node:assert/strict');
const test = require('node:test');
const http = require('http');
const app = require('../../server');

test('GET /api/products should return 200 and non-empty array', async (t) => {
  await t.test('Verify response status and body', (done) => {
    const server = http.createServer(app);

    server.listen(() => {
      const port = server.address().port;
      const options = {
        hostname: 'localhost',
        port,
        path: '/api/products',
        method: 'GET',
      };

      const req = http.request(options, (res) => {
        assert.strictEqual(res.statusCode, 200, 'Expected status code 200');

        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          const json = JSON.parse(data);
          assert(Array.isArray(json.products), 'Expected products to be an array');
          assert(json.products.length > 0, 'Expected products array to be non-empty');
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