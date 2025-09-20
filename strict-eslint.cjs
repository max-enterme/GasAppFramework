/* eslint-env node */
module.exports = {
    root: true,
    parser: "@typescript-eslint/parser",
    parserOptions: { ecmaVersion: 2021, sourceType: "module" },
    plugins: ["@typescript-eslint"],
    extends: [
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended"
    ],
    rules: {
        // Enable more strict rules to catch issues
        "@typescript-eslint/no-unused-vars": "error",
        "@typescript-eslint/no-explicit-any": "warn",
        "@typescript-eslint/no-empty-function": "warn",
        "prefer-const": "error",
        "no-var": "error",
        "semi": "error",
        "indent": ["error", 4],
        "quotes": ["error", "single"],
        "comma-dangle": ["error", "never"]
    }
};