import { Agent as HTTPSAgent } from 'https';
import { Agent as HTTPAgent } from 'http';
import { buildClientSchema, printSchema } from 'graphql';
import { writeFileSync } from 'node:fs';
import { parseArgs } from 'node:util';
import { default as fetchRetry } from 'fetch-retry';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import * as process from 'node:process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const fetchWithRetry = fetchRetry(fetch);

interface SubPath {
  valid: string;
  commonsSubPath?: string;
}

const getSubPath = (argPath = ''): SubPath => {
  const addSlash = (path: string) => `${path}/`.replace(/\/+$/, '/');

  if (!argPath) {
    let commonsDefaultPath = 'http://localhost:5000/v0/submission/';

    if (process.env.NEXT_PUBLIC_GEN3_API) {
      commonsDefaultPath = `${process.env.NEXT_PUBLIC_GEN3_API}/api/v0/submission/`;
      if (process.env.NEXT_PUBLIC_GEN3_API.startsWith('revproxy')) {
        // running thur a revproxy like nginx
        commonsDefaultPath = `http://${'revproxy-service'}/api/v0/submission/`;
      }
    }
    return {
      valid: 'ok',
      commonsSubPath: addSlash(
        process.env.GEN3_SUBMISSION_URL || commonsDefaultPath,
      ),
    };
  }
  const arg1 = argPath;
  if (!arg1.match(/^https?:\/\//)) {
    console.log(`
    getSchema downloads data/schema.json and data/dictionary.json from the environment's
    gen-api for later use configuring gql queries

    Use: node getSchema.js [submissionApiPath]
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
        .catch((err: Error) => console.error(`failed json parse - ${err}`));
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
        default: `config/${process.env.NEXT_PUBLIC_GEN3_COMMONS_NAME}`,
      },
    },
  });

  const { valid, commonsSubPath } = getSubPath(url);
  if (valid !== 'ok') {
    process.exit(1);
  }

  const schemaUrl = `${commonsSubPath}getschema`;
  const dictUrl = `${commonsSubPath}_dictionary/_all`;
  const actionList: ActionList = [];

  actionList.push(
    // Save JSON of full schema introspection for Babel Relay Plugin to use
    fetchJson(schemaUrl).then((schema) => {
      if (!schema) {
        throw new Error('Failed to fetch schema.json');
      }
      console.log(`writing schema to ${out}/schema.json`);
      writeFileSync(`${out}/schema.json`, JSON.stringify(schema, null, 2));

      // Save user readable type system shorthand of schema
      console.log(`writing graphql schema to ${out}/schema.schema`);
      const graphQLSchema = buildClientSchema(schema.data);
      writeFileSync(`${out}/schema.graphql`, printSchema(graphQLSchema));
    }),
  );

  actionList.push(
    fetchJson(dictUrl).then((dict) => {
      if (!dict) {
        throw new Error('Failed to fetch dictionary.json');
      }
      console.log(`writing dictionary to ${out}/dictionary.json`);
      writeFileSync(`${out}/dictionary.json`, JSON.stringify(dict, null, 2));
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
