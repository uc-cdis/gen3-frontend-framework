// Kernel lifecycle proxy — billing gate + Fence credential injection.
// Browser never sees JEG URL or raw kernel spec names.
// POST /kernels calls Fence /credentials/cdis first — if it fails, no kernel is launched.
// getToken reuses this app's cookie extraction — no JWT reinvention.
import type { NextApiRequest, NextApiResponse } from 'next';
import { createKernelProxyHandler } from '../server/kernelLifecycleProxy';
import { getAccessToken } from '@gen3/frontend/server';
import { GEN3_FENCE_API } from '@gen3/core/server';
import { JEG_SERVICE_API } from '../constants';
import { GEN3_FENCE_SERVICE } from '@gen3/core';

const inCluster = Boolean(process.env.KUBERNETES_SERVICE_HOST);
const defaultGen3Endpoint = inCluster
  ? JEG_SERVICE_API
  : '/lw-workspace/proxy/jeg-panel';
const defaultFenceUrl = inCluster ? GEN3_FENCE_SERVICE : GEN3_FENCE_API;

const gen3Endpoint = process.env.JEG_SERVICE_API ?? defaultGen3Endpoint;
const fenceUrl = defaultFenceUrl;

if (!gen3Endpoint) {
  console.warn(
    '[workspace-kernel] JEG_SERVICE_API is not set and not running in-cluster — kernel proxy will likely fail',
  );
}
if (!fenceUrl) {
  console.warn(
    '[workspace-kernel] FENCE_URL is not set and not running in-cluster — credential injection will likely fail',
  );
}

let policy: Record<string, unknown> = {};
if (process.env.KERNEL_SPEC_POLICY) {
  try {
    policy = JSON.parse(process.env.KERNEL_SPEC_POLICY);
  } catch (err) {
    throw new Error(
      `[workspace-kernel] KERNEL_SPEC_POLICY is not valid JSON: ${(err as Error).message}`,
    );
  }
}

const upstreamHandler = createKernelProxyHandler({
  gen3Endpoint,
  fenceUrl,
  kernelSpecPolicy: policy,
  jegEnabled: process.env.ENABLE_JEG === 'true',
  getToken: (req) => {
    const token = getAccessToken(req.headers['cookie'] ?? '') ?? null;
    if (!token) {
      console.warn(
        '[workspace-kernel] No access token found in request cookies',
      );
    }
    return token;
  },
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    await upstreamHandler(req, res);
  } catch (err) {
    console.error('[workspace-kernel] Upstream handler threw:', err);
    if (!res.headersSent) {
      res.status(502).json({ error: 'Bad gateway' });
    }
    return;
  }
}

export const config = { api: { bodyParser: false } };
