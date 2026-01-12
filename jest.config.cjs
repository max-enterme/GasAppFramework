/* eslint-env node */

const path = require('path');

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
                typeRoots: [
                    path.join(__dirname, 'node_modules/@types'),
                    path.join(__dirname, '..', '..', 'node_modules/@types'),
                    path.join(__dirname, 'test/shared'),
                ]
            }
        }]
    },
    collectCoverageFrom: [
        'modules/**/*.ts',
        '!modules/**/*.d.ts',
        '!modules/**/index.ts'
    ]
};
