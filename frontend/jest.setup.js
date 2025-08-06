// Jest setup file to mock import.meta
// Define import.meta globally for Jest
Object.defineProperty(globalThis, 'import', {
  value: {
    meta: {
      env: {
        MODE: 'test',
        VITE_API_BASE_URL: 'http://localhost:8080/api'
      }
    }
  },
  writable: true,
  configurable: true
});

// Ensure the import.meta is available on global scope
globalThis.importMeta = {
  env: {
    MODE: 'test',
    VITE_API_BASE_URL: 'http://localhost:8080/api'
  }
};

// Also set process.env variables for fallback
process.env.VITE_API_BASE_URL = 'http://localhost:8080/api';
process.env.NODE_ENV = 'test';