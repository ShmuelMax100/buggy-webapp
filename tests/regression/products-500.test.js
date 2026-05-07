/**
 * Regression test for SRE-39
 * Bug summary: GET /api/products returned 500 due to a null db.catalog.
 */

const assert = require('node:assert/strict');
const test = require('node:test');
const http = require('http');
const app = require('../../server');

test('GET /api/products should return 200 and a non-empty array', async (t) => {
  await t.test('Response validation', (done) => {
    const req = http.request({
      hostname: 'localhost',
      port: 4000,
      path: '/api/products',
      method: 'GET',
    }, (res) => {
      assert.strictEqual(res.statusCode, 200, 'Expected status code 200');

      let data = '';
      res.on('data', chunk => data += chunk);
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
});