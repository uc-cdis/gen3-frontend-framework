import { Agent as HTTPSAgent } from 'https';
import { Agent as HTTPAgent } from 'http';
import { buildClientSchema, printSchema } from 'graphql';
import { writeFileSync } from 'node:fs';
import { parseArgs } from 'node:util';
import { default as fetchRetry } from 'fetch-retry';

import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const fetchWithRetry = fetchRetry(fetch);

interface SubPath {
  valid: string;
  commonsSubPath?: string;
}

const getSubPath = (argPath: string = undefined): SubPath => {
  const addSlash = (path: string) => `${path}/`.replace(/\/+$/, '/');

  if (!argPath) {
    let commonsDefaultPath = 'http://localhost:5000/v0/submission/';

    if (process.env.HOSTNAME) {
      commonsDefaultPath = `https://${process.env.HOSTNAME}/api/v0/submission/`;
      if (process.env.HOSTNAME.startsWith('revproxy')) {
        // running thur a revproxy like nginx
        commonsDefaultPath = `http://${process.env.HOSTNAME}/api/v0/submission/`;
      }
    }
    return {
      valid: 'ok',
      commonsSubPath: addSlash(process.env.GEN3_SUBMISSION_URL || commonsDefaultPath),
    };
  }
  const arg1 = argPath;
  if (!arg1.match(/^https?:\/\//)) {
    console.log(`
    getSchema downloads data/schema.json and data/dictionary.json from the environment's
    gen-api for later use configuring gql queries

    Use: node pullDictionary.js [submissionApiPath]
        - where gdcSubmissionApiPath defaults to: process.env.GEN3_SUBPATH || 'http://localhost:5000/v0/submission/'
        - example - if gdcSubmissionApiPath = https://dev.bionimbus.org/api/vo/submission/,
            then the script loads:
            * https://dev.bionimbus.org/api/v0/submission/_dictionary/_all
            * https://dev.bionimbus.org/api/v0/submission/getschema
    `);
    return { valid: 'exit' };
  }
  return { valid: 'ok', commonsSubPath: addSlash(arg1) };
};


const httpAgent = new HTTPAgent();
const httpsAgent = new HTTPSAgent({
  rejectUnauthorized: false,
});

const fetchJson = async (url: string) => {
  console.log(`Fetching ${url}`);


  return fetchWithRetry(url, {
    // TODO: fix the typing to remove the ts-ignore
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
        .catch((err: Error) => console.log(`failed json parse - ${err}`));
    }
  });
};

type ActionList = Array<Promise<void>>;

const main = () => {
  const {
    values: { url, out },

  } = parseArgs({
    options: {
      url: {
        type: 'string',
        default: undefined,
      },
      out: {
        type: 'string',
        short: 'o',
        default: `${__dirname}`,
      },
    }
  });

  const { valid, commonsSubPath } = getSubPath(url);
  if (valid !== 'ok') {
    process.exit(1);
  }

  const schemaUrl = `${commonsSubPath}getschema`;
  const schemaPath = `${out}/schema.json`;
  const dictUrl = `${commonsSubPath}_dictionary/_all`;
  const dictPath = `${out}/dictionary.json`;

  const actionList: ActionList = [];

  actionList.push(
    // Save JSON of full schema introspection for Babel Relay Plugin to use
    fetchJson(schemaUrl).then((schema) => {
      if (!schema) {
        throw new Error('Failed to fetch schema.json');
      }
      writeFileSync(schemaPath, JSON.stringify(schema, null, 2));

      // Save user readable type system shorthand of schema
      const graphQLSchema = buildClientSchema(schema.data);
      writeFileSync(`${__dirname}/schema.graphql`, printSchema(graphQLSchema));
    }),
  );

  actionList.push(
    fetchJson(dictUrl).then((dict) => {
      if (!dict) {
        throw new Error('Failed to fetch dictionary.json');
      }
      writeFileSync(dictPath, JSON.stringify(dict, null, 2));
    }),
  );

  Promise.all(actionList).then(
    () => {
      console.log('All done!');
      process.exit(0);
    },
    (err) => {
      console.error('Error: ', err);
      process.exit(2);
    },
  );
};

export default main;

main();
