// Kernel lifecycle proxy — billing gate + Fence credential injection.
// Browser never sees JEG URL or raw kernel spec names.
// POST /kernels calls Fence /credentials/cdis first — if it fails, no kernel is launched.
// getToken reuses this app's cookie extraction — no JWT reinvention.
import type { NextApiRequest, NextApiResponse } from 'next';
import { createKernelProxyHandler } from '../server/kernelLifecycleProxy';
import { getAccessToken } from '@gen3/frontend/server';
import { GEN3_FENCE_API } from '@gen3/core/server';
import { JEG_SERVICE_API } from '../constants';
import { GEN3_API } from '@gen3/core';

const inCluster = Boolean(process.env.KUBERNETES_SERVICE_HOST);
const defaultGen3Endpoint = inCluster ? JEG_SERVICE_API : GEN3_API;
const defaultFenceUrl = inCluster
  ? 'http://fence-service.gen3.svc.cluster.local'
  : GEN3_FENCE_API;

const gen3Endpoint = process.env.JEG_SERVICE_API ?? defaultGen3Endpoint;
const fenceUrl = process.env.FENCE_URL ?? defaultFenceUrl;

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
  const action = Array.isArray(req.query.action) ? req.query.action : [];
  const isStatusPath = action[0] === 'api' && action[1] === 'status';
  try {
    await upstreamHandler(req, res);
  } catch (err) {
    console.error('[workspace-kernel] Upstream handler threw:', err);
    if (!res.headersSent) {
      res.status(502).json({ error: 'Bad gateway' });
    }
    return;
  }

  if (isStatusPath) {
    console.log(
      `[workspace-kernel] status HTTP=${res.statusCode} path=/${action.join('/')}`,
    );
  }
}

export const config = { api: { bodyParser: false } };
