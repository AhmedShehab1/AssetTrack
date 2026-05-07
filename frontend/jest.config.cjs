/** @type {import('jest').Config} */
const config = {
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.jsx?$': 'babel-jest',
  },
  setupFiles: ['./jest.setup.js'],
  clearMocks: true,
};

module.exports = config;