/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["**/*.test.ts", "**/*.e2e.ts"],
  verbose: true,
  forceExit: true,
  clearMocks: true,
  // resetMocks: true,
  // restoreMocks: true,
  coverageDirectory: "coverage_e2e",
  testTimeout: 15000,
};
