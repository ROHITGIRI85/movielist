module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  setupFiles: ['<rootDir>/tests/setupEnv.js'],
  clearMocks: true,
  restoreMocks: true,
  testTimeout: 30000,
};

