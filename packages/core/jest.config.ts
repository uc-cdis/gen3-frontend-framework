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
  },
  transformIgnorePatterns: [
    'node_modules/(?!flat|jsonpath-plus)/'
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
