module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  moduleFileExtensions: ['ts', 'js', 'json', 'jsx', 'tsx'],
  transform: {
    '^.+\.(ts|tsx)$': ['ts-jest', { tsconfig: 'tsconfig.app.json' }]
  },
  moduleNameMapper: {
    '\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testPathIgnorePatterns: ['/node_modules/', '/__tests__/__mocks__/']
}