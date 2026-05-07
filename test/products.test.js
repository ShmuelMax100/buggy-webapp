const test = require('node:test');
const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const net = require('node:net');

let serverProcess;
let baseUrl;

function getAvailablePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address();
      server.close(() => resolve(port));
    });
    server.on('error', reject);
  });
}

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
  const port = await getAvailablePort();
  baseUrl = `http://127.0.0.1:${port}`;

  serverProcess = spawn('node', ['server.js'], {
    cwd: process.cwd(),
    env: { ...process.env, PORT: String(port) },
    stdio: 'ignore',
  });

  await waitForServer(`${baseUrl}/health`);
});

test.after(async () => {
  if (serverProcess && !serverProcess.killed) {
    serverProcess.kill('SIGTERM');
    await new Promise(resolve => serverProcess.once('exit', resolve));
  }
});

test('GET /api/products returns 200 and a non-empty products array', async () => {
  const response = await fetch(`${baseUrl}/api/products`);
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.ok(Array.isArray(body.products));
  assert.ok(body.products.length > 0);
});
