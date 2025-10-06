export default {
  testEnvironment: "node",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  transform: {},
  moduleFileExtensions: ["js", "mjs", "cjs", "json"],
  roots: ["<rootDir>/__tests__", "<rootDir>/server", "<rootDir>/services"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
    "^@shared/(.*)$": "<rootDir>/../shared/$1"
  },
  collectCoverageFrom: [
    "server/**/*.{js,jsx}",
    "services/**/*.{js,jsx}",
    "inngest/**/*.{js,jsx}",
    "configs/**/*.{js,jsx}",
    "!**/node_modules/**"
  ],
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 50,
      lines: 50,
      statements: 50
    }
  }
}