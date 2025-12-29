// @ts-check
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
    // Ignore patterns (from both .eslintignore and .eslintrc.cjs)
    {
        ignores: [
            'dist/**',
            'build/**',
            'node_modules/**'
        ]
    },
    // Base ESLint recommended rules
    eslint.configs.recommended,
    // TypeScript ESLint recommended rules
    ...tseslint.configs.recommended,
    // Project-specific configuration
    {
        languageOptions: {
            parser: tseslint.parser,
            parserOptions: {
                ecmaVersion: 2021,
                sourceType: 'module'
            }
        },
        rules: {
            // Allow GAS namespaces
            '@typescript-eslint/no-namespace': 'off',
            'no-inner-declarations': 'off',
            'no-redeclare': 'off',

            // Allow @ts-nocheck for GAS test files
            '@typescript-eslint/ban-ts-comment': 'off',

            // Allow empty blocks only in catch statements
            'no-empty': ['error', { 'allowEmptyCatch': true }],

            // Turn off empty function warnings (namespace style compatibility)
            'no-empty-function': 'off',
            '@typescript-eslint/no-empty-function': 'off',

            // Allow any type (needed for GAS compatibility)
            '@typescript-eslint/no-explicit-any': 'off',

            // GAS compatibility: triple slash references needed for type declarations
            '@typescript-eslint/triple-slash-reference': 'off',

            // Check for unused variables (allow specific names and those starting with "_")
            '@typescript-eslint/no-unused-vars': ['warn', {
                'argsIgnorePattern': '^_',
                'varsIgnorePattern': '^(Shared|GasDI|Repository|Routing|EventSystem|StringHelper|RestFramework|Spec_.*|TestHelpers|T|TAssert|TRunner|TGasReporter|_.*)'
            }],

            // Code formatting and consistency rules
            'semi': ['error', 'always'],
            'quotes': ['error', 'single', { 'avoidEscape': true, 'allowTemplateLiterals': true }],
            'comma-dangle': ['error', 'never'],
            'prefer-const': 'error',
            'no-var': 'error'
        }
    }
);
