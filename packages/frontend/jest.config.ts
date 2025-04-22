import type { JestConfigWithTsJest } from 'ts-jest';

const jestConfig: JestConfigWithTsJest = {
  roots: ['<rootDir>/src'],
  setupFilesAfterEnv: ['<rootDir>/setupTests.ts'],
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '^@/app(.*)$': '<rootDir>/src/app/$1',
    '^@/components(.*)$': '<rootDir>/src/components/$1',
    '^@/features/(.*)$': '<rootDir>/src/features/$1',
    '^@/utils/(.*)$': '<rootDir>/src/utils/$1',
    '^redux-persist/lib/storage/createWebStorage$':
      '<rootDir>/__mocks__/createWebStorageMock.js',
    'jsonpath-plus': '<rootDir>/../../node_modules/jsonpath-plus',
    flat: '<rootDir>/../../node_modules/flat',
  },
  transform: {
    '^.+\\.(ts|tsx)?$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.test.json',
      },
    ],
    '<rootDir>/../../node_modules/(flat|jsonpath-plus)/.+\\.(j|t)s?$':
      'ts-jest',
  },
  transformIgnorePatterns: [
    '<rootDir>/../../node_modules/(?!(flat|jsonpath-plus))',
  ],
};

export default jestConfig;
