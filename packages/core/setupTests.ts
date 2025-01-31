import { loadEnvConfig } from '@next/env';

import { server } from './test/node';

beforeAll(() => {
  // Enable API mocking before all the tests.
  server.listen();
});

afterEach(() => {
  // Reset the request handlers between each test.
  // This way the handlers we add on a per-test basis
  // do not leak to other, irrelevant tests.
  server.resetHandlers();
});

afterAll(() => {
  // Finally, disable API mocking after the tests are done.
  server.close();
});

export default async () => {
  const projectDir = process.cwd();
  loadEnvConfig(projectDir);
};
