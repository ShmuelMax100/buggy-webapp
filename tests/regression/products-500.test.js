/**
 * Regression test for SRE-47: Fix 500 error on GET /api/products.
 *
 * Verifies that the /api/products endpoint returns status 200 and a non-empty
 * array of products after the bug fix.
 */

const assert = require('node:assert/strict');
const test = require('node:test');
const http = require('http');
const app = require('../../server');

test('GET /api/products returns 200 and a non-empty array', async (t) => {
  const req = http.request({
    hostname: 'localhost',
    port: 4000,
    path: '/api/products',
    method: 'GET',
  }, (res) => {
    let body = '';

    res.on('data', (chunk) => {
      body += chunk;
    });

    res.on('end', () => {
      assert.strictEqual(res.statusCode, 200, 'Expected status code 200');

      const jsonResponse = JSON.parse(body);
      assert(Array.isArray(jsonResponse.products), 'Expected products to be an array');
      assert(jsonResponse.products.length > 0, 'Expected products array to be non-empty');
    });
  });

  req.on('error', (err) => {
    t.fail(`Request failed: ${err.message}`);
  });

  req.end();
});