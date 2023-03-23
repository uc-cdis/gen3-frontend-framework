module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  globalSetup: "<rootDir>/setupTests.ts",
  moduleNameMapper: {
    "^@/components/(.*)$": "<rootDir>/src/components/$1",
  },
  modulePaths: ["<rootDir>"],
};
