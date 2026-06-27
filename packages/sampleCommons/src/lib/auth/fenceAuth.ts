import crypto from 'node:crypto';
import { GEN3_FENCE_API } from '@gen3/core/server';

export const fenceConfig = {
  baseUrl: process.env.FENCE_BASE_URL,
  clientId: process.env.FENCE_CLIENT_ID,
  clientSecret: process.env.FENCE_CLIENT_SECRET,
  redirectUri: process.env.FENCE_REDIRECT_URI,
  // openid+user are the basics; data are required for hatchery/workspace access
  scope: 'openid user data credentials fence ga4gh_passport_v1',
};

// Use FENCE_BASE_URL for direct server-to-server and browser-to-fence URLs,
// bypassing the Next.js dev proxy (which would require Node.js to trust the
// upstream TLS cert). Falls back to the proxied GEN3_FENCE_API path.
const fenceBase = process.env.FENCE_BASE_URL || GEN3_FENCE_API;
export const authorizeUrl = `${fenceBase}/oauth2/authorize`;
export const tokenUrl = `${fenceBase}/oauth2/token`;

const base64url = (buf: Buffer) =>
  buf
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

export const randomString = (bytes = 32) =>
  base64url(crypto.randomBytes(bytes));

export const pkceChallenge = (verifier: string) =>
  base64url(crypto.createHash('sha256').update(verifier).digest());
