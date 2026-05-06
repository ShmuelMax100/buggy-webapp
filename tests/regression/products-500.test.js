/**
 * Regression test for SRE-35: Fix TypeError in /api/products handler.
 *
 * Bug summary: GET /api/products attempted to access `db.catalog.items`,
 * but `db.catalog` was null, causing a TypeError → 500 Internal Server Error.
 *
 * This test ensures the endpoint returns HTTP 200 and a non-empty array.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import http from 'node:http';
import { app } from '../../server.js';

test('GET /api/products should return 200 and a non-empty array', async (t) => {
  await t.test('API responds correctly', (done) => {
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
        assert.strictEqual(res.statusCode, 200, 'Expected HTTP 200');

        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          const body = JSON.parse(data);
          assert(Array.isArray(body.products), 'Response should contain a products array');
          assert(body.products.length > 0, 'Products array should not be empty');

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