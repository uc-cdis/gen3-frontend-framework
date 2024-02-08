module.exports = {
  preset: 'ts-jest',
  testEnvironment: "node",
  transform: {
    'node_modules/(flat)/.+\\.(j|t)s?$': "ts-jest",
  },
  transformIgnorePatterns: [
    "node_modules/(?!flat)/"
  ],
  globalSetup: '<rootDir>/setupTests.ts',
  moduleNameMapper: {
    '^@/core/(.*)$': '<rootDir>/src/$1',
  },
  modulePaths: ['<rootDir>'],
  globals: {
    fetch: global.fetch,
  },
};
