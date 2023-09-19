const config = {
  roots: ['<rootDir>/src'],
  verbose: true,
  testEnvironmentOptions: {
    url: 'http://localhost/',
  },
  setupFilesAfterEnv: [],
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx'],
  preset: 'ts-jest',
  transform: {
    '^.+\\.{ts|tsx}?$': ['ts-jest', {
      babel: true,
      tsConfig: 'tsconfig.json',
    }],

  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testMatch: [
    '<rootDir>/**/(*.)test.(js|jsx|ts|tsx)',
    '<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}',
    '<rootDir>/src/**/*.{spec,test}.{js,jsx,ts,tsx}',
  ],
}

module.exports = config;
