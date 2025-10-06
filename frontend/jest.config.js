const path = require('path')
const nextJest = require('next/jest')

const projectRoot = path.resolve(__dirname, '..')

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  dir: './',
})

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/backend/(.*)$': '<rootDir>/../backend/$1',
    '^@/shared/(.*)$': '<rootDir>/../shared/$1',
    '^@/(.*)$': '<rootDir>/$1',
  },
  // Look for tests in __tests__ directories or files with .test/.spec suffixes
  testMatch: [
    '<rootDir>/**/__tests__/**/*.(js|jsx|ts|tsx)',
    '<rootDir>/**/*.(test|spec).(js|jsx|ts|tsx)'
  ],
  collectCoverageFrom: [
    'configs/**/*.{js,jsx}',
    'lib/**/*.{js,jsx}',
    'components/**/*.{js,jsx}',
    'app/**/*.{js,jsx}',
    '!app/**/route.js',
    '!app/**/layout.js',
    '!**/*.d.ts',
    '!**/node_modules/**',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
    './components/**/*.{js,jsx}': {
      branches: 60,
      functions: 60,
      lines: 60,
      statements: 60,
    },
    './app/**/*.{js,jsx}': {
      branches: 50,
      functions: 50,
      lines: 50,
      statements: 50,
    },
  },
  testTimeout: 10000,
  verbose: true,
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = async () => {
  const config = await createJestConfig(customJestConfig)()

  // Ignore setup files from coverage to keep reports focused
  config.coveragePathIgnorePatterns = [
    ...(config.coveragePathIgnorePatterns || []),
    '<rootDir>/jest.setup.js',
    '<rootDir>/jest.config.js'
  ]

  config.moduleNameMapper = {
    '^@/backend/(.*)$': '<rootDir>/../backend/$1',
    '^@/shared/(.*)$': '<rootDir>/../shared/$1',
    '^@/(.*)$': '<rootDir>/$1',
    ...(config.moduleNameMapper || {}),
  }

  return config
}
