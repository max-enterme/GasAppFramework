/* eslint-env node */
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    roots: ['<rootDir>/test/node'],
    testMatch: [
        '**/test/node/**/*.test.ts',
    ],
    moduleFileExtensions: ['ts', 'js'],
    transform: {
        '^.+\\.tsx?$': ['ts-jest', { tsconfig: { target: 'ES2020', module: 'commonjs' } }],
    },
    collectCoverageFrom: [
        'src/**/*.ts',
        '!src/**/*.d.ts',
    ],
};
