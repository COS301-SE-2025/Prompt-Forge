// // module.exports = {
// //   collectCoverage: true,
// //   coverageReporters: ['json-summary', 'lcov', 'text'],
// // };

// // frontend/jest.config.cjs
// module.exports = {
//   // Test environment (React needs jsdom)
//   testEnvironment: "jsdom",
//   preset: 'ts-jest',

//   // Where to find tests (matches your src/tests/ folder)
//   testMatch: [
//     "<rootDir>/src/tests/**/*.test.[jt]s?(x)",  // Targets your test folder
//     "<rootDir>/src/**/*.test.[jt]s?(x)"         // Fallback for other tests
//   ],

//   // File extensions Jest should recognize
//   moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json"],

//   // Path aliases (matches your tsconfig.json)
//   moduleNameMapper: {
//     "^@/(.*)$": "<rootDir>/src/$1"  // Resolves @/ imports
//   },

//   // Setup files (for global test utilities)
//   setupFilesAfterEnv: ["<rootDir>/src/tests.ts"],

//   // Coverage settings
//   collectCoverage: true,
//   coverageDirectory: "<rootDir>/coverage",
//   coverageReporters: ["json", "lcov", "text"],
// };

// frontend/jest.config.cjs
module.exports = {
  // Test environment (React needs jsdom)
  testEnvironment: "jsdom",
  preset: 'ts-jest',

  // Where to find tests
  testMatch: [
    "<rootDir>/src/tests/**/*.test.[jt]s?(x)",
    "<rootDir>/src/**/*.test.[jt]s?(x)"
  ],

  // File extensions Jest should recognize
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json"],

  // Path aliases (matches your tsconfig.json)
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1"  // Resolves @/ imports
  },

  // Setup files (for global test utilities)
  setupFilesAfterEnv: [
    "<rootDir>/src/setupTests.ts"  // Changed from tests.ts to setupTests.ts
  ],

  // Coverage settings
  collectCoverage: true,
  // coverageDirectory: "<rootDir>/coverage",
  coverageDirectory: "backend/coverage",
  coverageReporters: ["json", "lcov", "text"],

  // Transform settings for TypeScript
  transform: {
    "^.+\\.(ts|tsx)$": "ts-jest"
  }
};

////////////////////////////////////////
// module.exports = {
//   preset: 'ts-jest',
//   testEnvironment: 'jsdom',
  
//   // Where to find tests
//   testMatch: [
//     "<rootDir>/src/**/*.test.[jt]s?(x)",  // Looks for test files anywhere in src
//     "<rootDir>/tests/**/*.test.[jt]s?(x)"
//   ],

//   // Setup file location
//   setupFilesAfterEnv: ["<rootDir>/src/setupTests/setupTests.ts"], // Updated path

  
//   // Module handling
//   moduleNameMapper: {
//     "^@/(.*)$": "<rootDir>/src/$1"
//   },

//   // TypeScript support
//   transform: {
//     "^.+\\.(ts|tsx)$": [
//       'ts-jest',
//       {
//         tsconfig: {
//           esModuleInterop: true,
//           allowSyntheticDefaultImports: true
//         }
//       }
//     ]
//   }
// };