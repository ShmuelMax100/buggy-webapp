/**
 * Regression test for SRE-49
 * Bug Summary: Fixed TypeError caused by accessing `db.catalog.items` when `db.catalog` is null.
 */

const assert = require('node:assert/strict');
const test = require('node:test');
const http = require('http');
const app = require('../../server');

// Wrap the app in a one-shot HTTP request to simulate the endpoint
const makeRequest = async (method, path) => {
  return new Promise((resolve, reject) => {
    const req = http.request({
      method,
      host: 'localhost',
      port: 4000,
      path,
    }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(data) }));
    });

    req.on('error', reject);
    req.end();
  });
};

// Test GET /api/products
test('GET /api/products should return 200 and a non-empty array', async (t) => {
  const response = await makeRequest('GET', '/api/products');
  assert.equal(response.status, 200, 'Response status should be 200');
  assert(Array.isArray(response.body.products), 'Response should contain a products array');
  assert(response.body.products.length > 0, 'Products array should not be empty');
});