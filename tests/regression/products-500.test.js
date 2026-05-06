/**
 * Regression test for SRE-33
 * Verifies that GET /api/products returns 200 and a non-empty array.
 */

const assert = require('node:assert/strict');
const test = require('node:test');
const http = require('http');
const app = require('../../server'); // Import the Express app

test('GET /api/products should return 200 and non-empty array', async (t) => {
  await t.test('Verify response', (done) => {
    const server = http.createServer(app);

    server.listen(() => {
      const { port } = server.address();

      http.get(`http://localhost:${port}/api/products`, (res) => {
        assert.strictEqual(res.statusCode, 200, 'Expected status code 200');

        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          const json = JSON.parse(data);
          assert(Array.isArray(json.products), 'Expected products to be an array');
          assert(json.products.length > 0, 'Expected products array to be non-empty');

          server.close(done);
        });
      });
    });
  });
});