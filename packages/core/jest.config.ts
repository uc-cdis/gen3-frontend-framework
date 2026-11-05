module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/setupTests.ts'],
  transform: {
    '^.+\\.(ts|tsx)?$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.test.json',
      },
    ],
    'node_modules/(flat|jsonpath-plus)/.+\\.(j|t)s?$': 'ts-jest',
    // msw and parts of its dependency tree (rettime, until-async,
    // @open-draft/*) ship ESM only, which Jest's CJS runtime cannot require.
    // swc rewrites them to CommonJS on the fly.
    '^.+\\.m?js$': ['@swc/jest', { module: { type: 'commonjs' } }],
  },
  transformIgnorePatterns: [
    'node_modules/(?!(flat|jsonpath-plus|msw|@mswjs|@open-draft|rettime|until-async|headers-polyfill|strict-event-emitter)/)',
  ],
  globalSetup: '<rootDir>/setupTests.ts',
  moduleNameMapper: {
    '^@/core/(.*)$': '<rootDir>/src/$1',
    'jsonpath-plus': '<rootDir>/../../node_modules/jsonpath-plus',
    'flat': '<rootDir>/../../node_modules/flat',
  },
  modulePaths: ['<rootDir>'],
  globals: {
    fetch: global.fetch,
  },
};
