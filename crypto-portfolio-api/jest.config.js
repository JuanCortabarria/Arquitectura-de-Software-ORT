/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/*.test.ts'],
  // isolatedModules acelera mucho la transpilación de TypeScript en los
  // tests porque ts-jest no hace el chequeo de tipos completo (eso ya lo
  // hace `npm run build`). Sin esto, la primera corrida tarda minutos.
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { isolatedModules: true }],
  },
  // forceExit asegura que Jest termine aunque queden handles abiertos
  // (por ejemplo el FileTransport de Winston).
  forceExit: true,
};
