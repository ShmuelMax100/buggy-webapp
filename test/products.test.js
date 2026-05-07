const test = require('node:test');
const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');

const PORT = 4100;
const BASE_URL = `http://127.0.0.1:${PORT}`;
let serverProcess;

async function waitForServer(url, timeoutMs = 8000) {
  const start = Date.now();

  while (Date.now() - start < timeoutMs) {
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch (_err) {
      // server not ready yet
    }

    await new Promise(resolve => setTimeout(resolve, 200));
  }

  throw new Error('Server did not become ready in time');
}

test.before(async () => {
  serverProcess = spawn('node', ['server.js'], {
    cwd: process.cwd(),
    env: { ...process.env, PORT: String(PORT) },
    stdio: 'ignore',
  });

  await waitForServer(`${BASE_URL}/health`);
});

test.after(() => {
  if (serverProcess && !serverProcess.killed) {
    serverProcess.kill('SIGTERM');
  }
});

test('GET /api/products returns 200 and a non-empty products array', async () => {
  const response = await fetch(`${BASE_URL}/api/products`);
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.ok(Array.isArray(body.products));
  assert.ok(body.products.length > 0);
});
