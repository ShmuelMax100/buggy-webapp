/**
 * Regression test for Jira ticket SRE-36
 * Verifies that GET /api/products no longer fails with 500 Internal Server Error.
 */

const assert = require('node:assert/strict');
const test = require('node:test');
const http = require('http');
const app = require('../../server');

test('GET /api/products should return 200 and a non-empty array', async (t) => {
  await t.test('API response validation', async () => {
    const server = http.createServer(app);

    const response = await new Promise((resolve) => {
      const req = http.request({
        hostname: 'localhost',
        port: 4000,
        path: '/api/products',
        method: 'GET',
      }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(data) }));
      });
      req.end();
    });

    assert.equal(response.status, 200, 'Expected status 200');
    assert.ok(Array.isArray(response.body.products), 'Expected products to be an array');
    assert.ok(response.body.products.length > 0, 'Expected products array to be non-empty');

    server.close();
  });
});