module.exports = {
  preset: 'ts-jest',
  verbose: true,
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/setupTests.ts'],
  transform: {
    '^.+\\.(ts|tsx)?$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.test.json',
      },
    ],
    '<rootDir>/node_modules/(flat|jsonpath-plus)/.+\\.(j|t)s?$': [
      'ts-jest', {
      tsconfig: 'tsconfig.test.json',
      },
    ],
  },
  transformIgnorePatterns: [
    '/node_modules/(?!flat|jsonpath-plus)/',
  ],
  globalSetup: '<rootDir>/setupTests.ts',
  moduleNameMapper: {
    '^@/core/(.*)$': '<rootDir>/src/$1'
  },
  modulePaths: ['<rootDir>'],
  globals: {
    fetch: global.fetch,
  },
};
