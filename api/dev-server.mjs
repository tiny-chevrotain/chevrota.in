/**
 * Local development server that mirrors the Lambda functions.
 * Run: node api/dev-server.mjs
 * Requires api/.env with all environment variables set.
 */

import { createServer } from 'http';
import { readFileSync } from 'fs';

// Load .env
try {
  const env = readFileSync(new URL('.env', import.meta.url), 'utf8');
  for (const line of env.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    const val = trimmed.slice(idx + 1).trim();
    process.env[key] = val;
  }
  console.log('Loaded api/.env');
} catch {
  console.log('No api/.env found — using existing environment variables');
}

// Override allowed origin for local dev
process.env.ALLOWED_ORIGIN = 'http://localhost:5173';

const { handler: getAvailability } = await import('./getAvailability/index.mjs');
const { handler: createBooking } = await import('./createBooking/index.mjs');

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', chunk => { data += chunk; });
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:3001`);
  const method = req.method.toUpperCase();

  // CORS preflight
  if (method === 'OPTIONS') {
    res.writeHead(200, {
      'Access-Control-Allow-Origin': 'http://localhost:5173',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    });
    res.end();
    return;
  }

  let handler = null;

  if (url.pathname === '/api/availability' && method === 'GET') {
    handler = getAvailability;
  } else if (url.pathname === '/api/booking' && method === 'POST') {
    handler = createBooking;
  }

  if (!handler) {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
    return;
  }

  const body = await parseBody(req);

  const queryStringParameters = {};
  for (const [k, v] of url.searchParams) {
    queryStringParameters[k] = v;
  }

  const lambdaEvent = {
    requestContext: { http: { method } },
    queryStringParameters,
    body,
    headers: Object.fromEntries(
      Object.entries(req.headers).map(([k, v]) => [k, Array.isArray(v) ? v[0] : v]),
    ),
  };

  try {
    const result = await handler(lambdaEvent);
    res.writeHead(result.statusCode, result.headers ?? {});
    res.end(result.body ?? '');
  } catch (err) {
    console.error(err);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Internal server error' }));
  }
});

server.listen(3001, () => {
  console.log('API dev server running at http://localhost:3001');
  console.log('  GET  /api/availability?year=YYYY&month=MM&durationMinutes=N');
  console.log('  POST /api/booking');
});
