/**
 * Regression test for Jira ticket SRE-32.
 * Bug summary: GET /api/products returned 500 due to a TypeError when accessing
 * `db.catalog.items`. The fix replaced `db.catalog.items` with `db.products`.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import http from 'node:http';
import { app } from '../../server.js';

const server = http.createServer(app);

server.listen(() => {
  const address = server.address();
  const baseUrl = `http://localhost:${address.port}`;

  test('GET /api/products should return 200 and a non-empty array', async (t) => {
    const res = await fetch(`${baseUrl}/api/products`);
    assert.strictEqual(res.status, 200, 'Expected HTTP status 200');

    const body = await res.json();
    assert(Array.isArray(body.products), 'Expected `products` to be an array');
    assert(body.products.length > 0, 'Expected `products` array to be non-empty');
  });

  server.close();
});