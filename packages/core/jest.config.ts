module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  globalSetup: '<rootDir>/setupTests.ts',
  moduleNameMapper: {
    '^@/core/(.*)$': '<rootDir>/src/$1',
  },
  modulePaths: ['<rootDir>'],
  globals: {
    fetch: global.fetch,
  }
};
