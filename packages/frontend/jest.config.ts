// jest.config.ts
import { createDefaultPreset, type JestConfigWithTsJest } from 'ts-jest';

const jestConfig: JestConfigWithTsJest = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/setupTests.js'],
  transform: {
    ...createDefaultPreset().transform,
  },
};

export default jestConfig;
