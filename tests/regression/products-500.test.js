/**
 * Regression test for SRE-41: Fix 500 error on GET /api/products.
 *
 * Summary: This test verifies that the /api/products endpoint returns
 * a 200 status code and a non-empty array of products.
 */

const assert = require('node:assert/strict');
const test = require('node:test');
const http = require('http');
const app = require('../../server');

test('GET /api/products should return 200 and a non-empty array', async (t) => {
  const server = http.createServer(app);

  await t.test('Request /api/products', (done) => {
    const req = http.request({
      hostname: 'localhost',
      port: 4000,
      path: '/api/products',
      method: 'GET',
    }, (res) => {
      assert.equal(res.statusCode, 200, 'Expected status code 200');

      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        const body = JSON.parse(data);
        assert(Array.isArray(body.products), 'Expected products to be an array');
        assert(body.products.length > 0, 'Expected products array to be non-empty');
        done();
      });
    });

    req.on('error', (err) => {
      done(err);
    });

    req.end();
  });

  server.close();
});