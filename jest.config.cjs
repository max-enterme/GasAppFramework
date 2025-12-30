/* eslint-env node */

module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    roots: ['<rootDir>/test/node'],
    testMatch: [
        '**/test/node/**/*.test.ts'
    ],
    moduleFileExtensions: ['ts', 'js'],
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/modules/$1'
    },
    transform: {
        '^.+\\.tsx?$': ['ts-jest', {
            tsconfig: {
                target: 'ES2020',
                module: 'commonjs',
                types: ['jest', 'node'],
                typeRoots: ['./node_modules/@types', './test/shared']
            }
        }]
    },
    collectCoverageFrom: [
        'modules/**/*.ts',
        '!modules/**/*.d.ts',
        '!modules/**/index.ts'
    ]
};
