/** @type {import('jest').Config} */
const config = {
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.jsx?$': 'babel-jest',
  },
  setupFilesAfterEnv: ['./jest.setup.js'],
  clearMocks: true,
};

module.exports = config;
