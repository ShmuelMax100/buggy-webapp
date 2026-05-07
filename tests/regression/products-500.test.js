/**
 * Regression Test — Jira Ticket: SRE-45
 * Summary: Prevents regression of TypeError in GET /api/products endpoint.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import http from 'node:http';
import app from '../../server.js';

test('GET /api/products should return 200 and non-empty array', async (t) => {
  await t.test('Valid response for /api/products', (done) => {
    const server = http.createServer(app);
    server.listen(() => {
      const { port } = server.address();
      http.get(`http://localhost:${port}/api/products`, (res) => {
        assert.strictEqual(res.statusCode, 200);

        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          const body = JSON.parse(data);
          assert.ok(Array.isArray(body.products));
          assert.ok(body.products.length > 0);
          server.close(done);
        });
      });
    });
  });
});