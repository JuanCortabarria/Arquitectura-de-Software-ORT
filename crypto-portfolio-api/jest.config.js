/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/*.test.ts'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { isolatedModules: true }],
  },
  // Conectar a MySQL y MongoDB antes de los tests
  globalSetup: '<rootDir>/tests/setup.ts',
  // Cerrar conexiones al terminar
  globalTeardown: '<rootDir>/tests/teardown.ts',
  forceExit: true,
};
