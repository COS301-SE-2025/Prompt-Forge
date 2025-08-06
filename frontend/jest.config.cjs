module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^../config/api$': '<rootDir>/src/config/api.jest.ts',
    '^../../config/api$': '<rootDir>/src/config/api.jest.ts',
    '^../../../config/api$': '<rootDir>/src/config/api.jest.ts',
    '^@/config/api$': '<rootDir>/src/config/api.jest.ts',
    '^src/config/api$': '<rootDir>/src/config/api.jest.ts',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|webp|svg)$': '<rootDir>/src/__mocks__/fileMock.ts'
  },
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: 'tsconfig.jest.json',
      isolatedModules: true
    }]
  },
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/main.tsx',
    '!src/vite-env.d.ts',
    '!src/**/*.cy.{ts,tsx}',
    '!src/cypress/**/*'
  ],
  testMatch: ['<rootDir>/tests/**/*.[jt]s?(x)'],
  testEnvironmentOptions: {
    customExportConditions: ['node', 'node-addons']
  },
  setupFiles: ['<rootDir>/jest.setup.js'],
  silent: true
};
