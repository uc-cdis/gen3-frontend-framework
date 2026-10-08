import type { NextApiRequest, NextApiResponse } from 'next';
import { Readable } from 'stream';

export const config = {
  api: {
    bodyParser: false,
  },
};

async function readBody(readable: Readable): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of readable) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

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

  const body = await readBody(req);

  const s3Response = await fetch(presignedUrl, {
    method: 'PUT',
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
