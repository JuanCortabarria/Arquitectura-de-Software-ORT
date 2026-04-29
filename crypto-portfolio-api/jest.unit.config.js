/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/*.test.ts'],
  transform: {
    '^.+\\.tsx?$': ['@swc/jest'],
  },
  cache: false,
  watchman: false,
  haste: {
    forceNodeFilesystemAPI: true,
  },
  forceExit: true,
};
