import '@testing-library/jest-dom';

// Mock import.meta for testing
if (!global.import) {
  global.import = {};
}

if (!global.import.meta) {
  global.import.meta = {
    env: {
      VITE_API_BASE_URL: 'http://localhost:8080/api',
      MODE: 'test',
      DEV: false,
      PROD: false,
      SSR: false,
    },
  };
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
