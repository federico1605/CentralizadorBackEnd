export default {
  testEnvironment: 'node',
  transform: {
    '^.+\\.js$': '@swc/jest',
  },
  moduleNameMapper: {
    '^(\\.\\./)+models/(.*)$': '<rootDir>/src/__mocks__/models/$2',
    '^(\\.\\./)+config/(.*)$': '<rootDir>/src/__mocks__/config/$2',
    '^(\\.\\./)+utils/(.*)$': '<rootDir>/src/utils/$2',
  },
  testMatch: [
    '**/__tests__/**/*.js',
    '**/?(*.)+(spec|test).js'
  ],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/index.js',
    '!src/export-swagger.cjs',
    '!**/node_modules/**'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  automock: false,
  resetMocks: false,
  restoreMocks: false,
}; 