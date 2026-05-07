/**
 * SRE-38: Regression test for /api/products 500 error
 *
 * This test verifies that GET /api/products returns status 200 and a non-empty
 * array of products after the bug fix.
 */

import { strict as assert } from 'node:assert';
import test from 'node:test';
import http from 'node:http';
import app from '../../server.js';

test('GET /api/products should return 200 and non-empty array', async (t) => {
  const server = http.createServer(app);

  await t.test('API responds correctly', (done) => {
    server.listen(() => {
      const port = server.address().port;
      http.get(`http://localhost:${port}/api/products`, (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          assert.equal(res.statusCode, 200, 'Expected status code 200');
          const body = JSON.parse(data);
          assert(Array.isArray(body.products), 'Expected products to be an array');
          assert(body.products.length > 0, 'Expected products array to be non-empty');
          server.close(done);
        });
      });
    });
  });
});