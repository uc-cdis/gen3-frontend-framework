// Kernel lifecycle proxy — billing gate + Fence credential injection.
// Browser never sees JEG URL or raw kernel spec names.
// POST /kernels calls Fence /credentials/cdis first — if it fails, no kernel is launched.
// getToken reuses this app's cookie extraction — no JWT reinvention.
import { createKernelLifecycleProxyHandler } from '@gen3/workspaces/server';
import { getAccessToken } from '@/lib/auth/getLoginStatus';
import type { NextApiRequest, NextApiResponse } from 'next';

const inCluster = Boolean(process.env.KUBERNETES_SERVICE_HOST);
const defaultGen3Endpoint = inCluster
  ? 'http://jupyter-enterprise-gateway.jupyter-pods.svc.cluster.local:8888'
  : undefined;
const defaultFenceUrl = inCluster
  ? 'http://fence-service.gen3.svc.cluster.local'
  : undefined;

const policy = process.env.KERNEL_SPEC_POLICY
  ? JSON.parse(process.env.KERNEL_SPEC_POLICY)
  : {};

const upstreamHandler = createKernelLifecycleProxyHandler({
  gen3Endpoint: process.env.GEN3_ENDPOINT ?? defaultGen3Endpoint,
  fenceUrl: process.env.FENCE_URL ?? defaultFenceUrl,
  kernelSpecPolicy: policy,
  jegEnabled: process.env.ENABLE_JEG === 'true',
  getToken: (req) => getAccessToken(req.headers['cookie'] ?? '') ?? null,
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  await upstreamHandler(req, res);

  const action = (req.query.action as string[] | undefined) ?? [];
  if (action[0] === 'api' && action[1] === 'status') {
    console.log(
      `[workspace-kernel] status HTTP=${res.statusCode} path=/${action.join('/')}`,
    );
  }
}

export const config = { api: { bodyParser: false } };
