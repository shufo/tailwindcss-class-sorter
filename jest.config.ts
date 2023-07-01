import type { Config } from "@jest/types";

const config: Config.InitialOptions = {
  globals: {
    "ts-jest": {
      tsconfig: "./tsconfig.json",
      useESM: true,
    },
  },
  testMatch: ["**/__tests__/**/?(*.)+(spec|test).[jt]s?(x)"],
  transform: {
    "^.+\\.(js|jsx)$": "babel-jest",
    "^.+\\.(ts|tsx)$": "ts-jest",
    "node_modules/variables/.+\\.(j|t)sx?$": "ts-jest",
  },
  transformIgnorePatterns: ["node_modules/(?!variables/.*)"],
  moduleNameMapper: {
    "src(.*)$": "<rootDir>/src/$1",
  },
  extensionsToTreatAsEsm: [".ts"],
  testTimeout: 10000,
  verbose: true,
  cache: false,
  testEnvironment: "node",
  setupFiles: ["<rootDir>/jest.setup.ts"],
  collectCoverage: true,
};

export default config;
