/**
 * @type {import('jest').Config}
 */
const config = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: [
    './scripts/jest-setup.ts'
  ],
  globals: {},
  coverageDirectory: 'coverage',
  coverageReporters: ['html', 'lcov', 'text'],

  rootDir: __dirname,
  // moduleDirectories: ['node_modules', 'packages'],
  watchPathIgnorePatterns: ['/node_modules/', '/dist/', '/.git/'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'json'],
  moduleNameMapper: {
    '^@viewjs/(.*?)$': '<rootDir>/packages/$1/src',
    'viewjs': '<rootDir>/packages/viewjs/src',
  },
  testMatch: [
    '<rootDir>/packages/**/__tests__/**/*spec.[jt]s?(x)'
  ],
  testPathIgnorePatterns: process.env.SKIP_E2E
    ? // ignore example tests on netlify builds since they don't contribute
    // to coverage and can cause netlify builds to fail
    ['/node_modules/', '/examples/__tests__']
    : ['/node_modules/']
}

module.exports = config
