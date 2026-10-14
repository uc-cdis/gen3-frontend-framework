import type { NextApiRequest, NextApiResponse } from 'next';
import type { Readable } from 'stream';

async function readBody(readable: Readable): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of readable) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

const S3_HOSTNAME_PATTERN = /^(?:[a-z0-9][a-z0-9.-]*\.)?s3[a-z0-9.-]*\.amazonaws\.com$/;

const parseS3PresignedUrl = (rawUrl: string): URL | undefined => {
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(rawUrl);
  } catch {
    return undefined;
  }
  const isPlainHttpsS3Url =
    parsedUrl.protocol === 'https:' &&
    !parsedUrl.username &&
    !parsedUrl.password &&
    !parsedUrl.port &&
    S3_HOSTNAME_PATTERN.test(parsedUrl.hostname);
  return isPlainHttpsS3Url ? parsedUrl : undefined;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { presignedUrl } = req.query;
  if (!presignedUrl || typeof presignedUrl !== 'string') {
    return res.status(400).json({ error: 'Missing presignedUrl' });
  }

  const s3Url = parseS3PresignedUrl(presignedUrl);
  if (!s3Url) {
    return res.status(400).json({ error: 'Invalid presignedUrl' });
  }

  const body = await readBody(req);

  const s3Response = await fetch(s3Url.href, {
    method: 'PUT',
    redirect: 'error',
    body: body as unknown as BodyInit,
    headers: {
      'Content-Type': req.headers['content-type'] ?? 'application/octet-stream',
    },
  });

  if (!s3Response.ok) {
    return res.status(s3Response.status).json({ error: 'S3 upload failed' });
  }

  return res.status(200).json({ success: true });
}
