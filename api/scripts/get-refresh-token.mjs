/**
 * One-time script to obtain a Google OAuth2 refresh token for olliepgannon@gmail.com.
 * Run: node api/scripts/get-refresh-token.mjs
 *
 * Requires api/.env with GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET set.
 */

import { readFileSync } from 'fs';
import { createServer } from 'http';
import { google } from 'googleapis';

// Load .env manually (no dotenv dependency needed for this script)
try {
  const env = readFileSync(new URL('../.env', import.meta.url), 'utf8');
  for (const line of env.split('\n')) {
    const [key, ...rest] = line.split('=');
    if (key && rest.length) process.env[key.trim()] = rest.join('=').trim();
  }
} catch {
  // .env not found — rely on process.env already being set
}

const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } = process.env;

if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
  console.error('Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in api/.env first.');
  process.exit(1);
}

const REDIRECT_URI = 'http://localhost:3999/oauth2callback';

const oauth2Client = new google.auth.OAuth2(
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  REDIRECT_URI,
);

const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: ['https://www.googleapis.com/auth/calendar'],
  prompt: 'consent',
});

console.log('\nOpen this URL in your browser and sign in as olliepgannon@gmail.com:\n');
console.log(authUrl);
console.log('\nWaiting for OAuth callback on http://localhost:3999/oauth2callback …\n');

const server = createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost:3999');
  const code = url.searchParams.get('code');

  if (!code) {
    res.end('No code found. Please try again.');
    return;
  }

  try {
    const { tokens } = await oauth2Client.getToken(code);
    res.end('<html><body><h2>Success! You can close this tab.</h2><p>Check your terminal for the refresh token.</p></body></html>');
    console.log('\n✅ Refresh token obtained:\n');
    console.log(tokens.refresh_token);
    console.log('\nAdd this to api/.env as:\nGOOGLE_REFRESH_TOKEN=' + tokens.refresh_token + '\n');
  } catch (err) {
    res.end('Error: ' + err.message);
    console.error(err);
  } finally {
    server.close();
  }
});

server.listen(3999);
