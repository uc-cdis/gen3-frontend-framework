#!/usr/bin/env node
import { Agent as HTTPSAgent } from 'https';
import { Agent as HTTPAgent } from 'http';
import { writeFileSync } from 'node:fs';
import { parseArgs } from 'node:util';
import { default as fetchRetry } from 'fetch-retry';

import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const fetchWithRetry = fetchRetry(fetch);

interface DRSIndexEntry {
  host: string;
  name: string;
  type: string;
  hints: string[];
}

const httpAgent = new HTTPAgent();
const httpsAgent = new HTTPSAgent({
  rejectUnauthorized: false,
});

const fetchJson = async (url: string) => {
  console.log(`Fetching DRS ids from ${url}`);

  return fetchWithRetry(url, {
    // TODO: fix the typing to remove the ignore
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    agent: url.match(/^https:/) ? httpsAgent : httpAgent,
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    retries: 5,
    retryDelay: 800,
  }).then((res: Response) => {
    if (res.status === 200) {
      return res
        .json()
        .catch((err: Error) => console.error(`failed json parse - ${err}`));
    }
  });
};

const main = () => {
  let drsResolverURL = 'https://dataguids.org';
  if (process.env.DRS_RESOLVER_URL) {
    drsResolverURL = process.env.DRS_RESOLVER_URL;
  }

  const {
    values: { out },
  } = parseArgs({
    options: {
      out: {
        type: 'string',
        short: 'o',
        default: `${__dirname}`,
      },
    },
  });

  const drsCachePath = `${out}/drsHostnames.json`;
  fetchJson(`${drsResolverURL}/index/_dist`).then((drsIds: DRSIndexEntry[]) => {
    if (!drsIds) {
      throw new Error('Failed to fetch drsHostnames.json');
    }

    const drsCache = drsIds.reduce((acc: Record<string, string>, drsId) => {
      const ids = drsId.hints.map((hint) =>
        hint.replace('.*', '').replace('.*', '').replace('\\.', '.'),
      );
      ids.forEach((id) => {
        acc[id] = drsId.host.replace('https://', '').replace('/index/', '');
      });
      return acc;
    }, {});

    writeFileSync(drsCachePath, JSON.stringify(drsCache, null, 2));
  });
};

export default main;

main();
