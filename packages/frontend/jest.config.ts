import type { JestConfigWithTsJest } from 'ts-jest';

const jestConfig: JestConfigWithTsJest = {
  roots: ['<rootDir>/src'],
  setupFilesAfterEnv: ['<rootDir>/setupTests.ts'],
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.(ts|tsx)?$':[
      'ts-jest',
      {
        tsconfig: 'tsconfig.test.json',
        isolatedModules: true,
      },
    ],
    'node_modules/(flat|jsonpath-plus)/.+\\.(j|t)sx?$': ['ts-jest', {}],
  },
  'transformIgnorePatterns': ['/node_modules/(?!(flat|jsonpath-plus))']
};

export default jestConfig;
