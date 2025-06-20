import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/src"],
  moduleFileExtensions: ["ts", "js", "json"],
  testMatch: ["**/*.spec.ts"],
  collectCoverageFrom: ["src/**/*.{ts,js}"],
  coverageDirectory: "coverage",
  transform: {
    "^.+\\.(ts|tsx)$": "ts-jest",
  },
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  verbose: false,
  collectCoverage: true,
  coveragePathIgnorePatterns: [
    "/node_modules/",
    "/dist/",
    "/test/",
    "generated",
    "http/server.ts",
    "routes/index.ts",
  ],
};

export default config;
