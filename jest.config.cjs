/* eslint-env node */
module.exports = {
    testEnvironment: 'node',
    testMatch: ['**/test_node/**/*.test.ts', '**/__tests__/**/*.test.ts'],
    moduleFileExtensions: ['ts', 'tsx', 'js'],
    roots: ['<rootDir>'],
    transform: {
        '^.+\\.tsx?$': ['ts-jest', { tsconfig: { target: 'ES2020', module: 'commonjs' } }],
    },
};
