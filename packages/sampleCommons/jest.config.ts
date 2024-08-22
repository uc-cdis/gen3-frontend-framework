import type { Config } from 'jest';
import nextJest from 'next/jest';
import path from 'path';

const createJestConfig = nextJest({
  dir: './',
});

const config: Config = {
  clearMocks: true,
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  coverageProvider: 'v8',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/setupTests.ts'],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
    [`${path.resolve(__dirname, '../core')}/(dist)/.+\\.(j|t)s?$`]: 'ts-jest', // Point to the root node_modules
  },
  transformIgnorePatterns: [
    `${path.resolve(__dirname, '../core')}/(?!(dist)/)`,
  ],
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.json',
      isolatedModules: true,
    },
  },
};

// Create and export the Jest config
export default createJestConfig(config);
