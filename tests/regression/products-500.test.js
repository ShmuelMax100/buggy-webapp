/**
 * Regression Test for Jira Ticket SRE-34
 * Bug Summary: GET /api/products failed with 500 due to accessing `db.catalog.items` when `db.catalog` was null.
 */

const assert = require('node:assert/strict');
const test = require('node:test');
const http = require('http');
const app = require('../../server');

test('GET /api/products should return 200 and a non-empty array', async (t) => {
  await t.test('Valid response from /api/products', async () => {
    const server = http.createServer(app);
    const req = new Promise((resolve, reject) => {
      const options = {
        hostname: 'localhost',
        port: 4000,
        path: '/api/products',
        method: 'GET',
      };

      const request = http.request(options, (response) => {
        let data = '';
        response.on('data', chunk => data += chunk);
        response.on('end', () => resolve({ status: response.statusCode, body: JSON.parse(data) }));
      });

      request.on('error', reject);
      request.end();
    });

    const response = await req;
    assert.equal(response.status, 200, 'Expected HTTP status 200');
    assert.ok(Array.isArray(response.body.products), 'Expected products to be an array');
    assert.ok(response.body.products.length > 0, 'Expected products array to be non-empty');
  });
});