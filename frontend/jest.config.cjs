/** @type {import('jest').Config} */
const config = {
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.jsx?$': 'babel-jest',
  },
  moduleNameMapper: {
    '\\.module\\.css$': 'identity-obj-proxy',
    '\\.(css|less)$': '<rootDir>/__mocks__/styleMock.js'
  },
  transformIgnorePatterns: [
    'node_modules/(?!(axios)/)',
  ],
  setupFilesAfterEnv: ['./jest.setup.js'],
  clearMocks: true,
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
};

module.exports = config;
