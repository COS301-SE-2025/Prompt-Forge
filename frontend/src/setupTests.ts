import '@testing-library/jest-dom';
import 'web-streams-polyfill';
import 'whatwg-fetch';
import { TextEncoder, TextDecoder } from 'util';
// Import ReadableStream and fetch properly
import { ReadableStream as WebReadableStream } from 'web-streams-polyfill';
import fetchMock from 'jest-fetch-mock';

// Add jest to globals
declare global {
  const jest: any;
}

// Polyfill TextEncoder/TextDecoder
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder as any;

// Mock ReadableStream
if (typeof window.ReadableStream === 'undefined') {
  global.ReadableStream = WebReadableStream as any;
}

// Mock fetch if not already mocked
if (!global.fetch) {
  global.fetch = fetchMock as any;
}

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock console methods to reduce noise in tests
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;
const originalConsoleLog = console.log;

console.error = (...args) => {
  // Skip React Router deprecation warnings
  if (args[0] && typeof args[0] === 'string' && args[0].includes('React Router')) {
    return;
  }
  originalConsoleError(...args);
};

console.warn = (...args) => {
  // Skip React Router deprecation warnings
  if (args[0] && typeof args[0] === 'string' && args[0].includes('React Router')) {
    return;
  }
  originalConsoleWarn(...args);
};

console.log = (...args) => {
  // Skip logs in tests to reduce noise
  if (process.env.NODE_ENV === 'test' && process.env.JEST_VERBOSE !== 'true') {
    return;
  }
  originalConsoleLog(...args);
};