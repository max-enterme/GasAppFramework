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
    ignorePatterns: [
        "dist/**",
        "build/**",
        "node_modules/**",
        "test/_framework/**"
    ],
    rules: {
        // Allow GAS namespaces
        "@typescript-eslint/no-namespace": "off",
        "no-inner-declarations": "off",
        "no-redeclare": "off",

        // Allow empty blocks only in catch statements
        "no-empty": ["error", { "allowEmptyCatch": true }],

        // Turn off empty function warnings (namespace style compatibility)
        "no-empty-function": "off",
        "@typescript-eslint/no-empty-function": "off",

        // Allow any type
        "@typescript-eslint/no-explicit-any": "off",

        // GAS compatibility: triple slash references needed for type declarations
        "@typescript-eslint/triple-slash-reference": "off",

        // Check for unused variables (allow specific names and those starting with "_")
        "@typescript-eslint/no-unused-vars": ["warn", {
            "argsIgnorePattern": "^_",
            "varsIgnorePattern": "^(Shared|GasDI|Repository|Routing|EventSystem|StringHelper|RestFramework|Spec_.*|TestHelpers|_)$"
        }]
    }
};
