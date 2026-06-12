import crypto from 'node:crypto';
import { GEN3_FENCE_API } from '@gen3/core/server';

export const fenceConfig = {
  baseUrl: process.env.FENCE_BASE_URL!,
  clientId: process.env.FENCE_CLIENT_ID!,
  clientSecret: process.env.FENCE_CLIENT_SECRET!,
  redirectUri: process.env.FENCE_REDIRECT_URI!,
  // openid+user are the basics; add offline_access to get a refresh_token
  scope: 'openid user credentials profile',
};

export const authorizeUrl = `${GEN3_FENCE_API}/oauth2/authorize`;
export const tokenUrl = `${GEN3_FENCE_API}/oauth2/token`;

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
