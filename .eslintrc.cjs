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
        // GAS の namespace を許容
        "@typescript-eslint/no-namespace": "off",
        "no-inner-declarations": "off",
        "no-redeclare": "off",

        // 空ブロックは catch だけ許容
        "no-empty": ["error", { "allowEmptyCatch": true }],

        // 空関数の警告はオフ（namespace スタイル対策）
        "no-empty-function": "off",
        "@typescript-eslint/no-empty-function": "off",

        // any を許可
        "@typescript-eslint/no-explicit-any": "off",

        // 未使用変数チェック（特定の名前や "_" 始まりは許容）
        "@typescript-eslint/no-unused-vars": ["warn", {
            "argsIgnorePattern": "^_",
            "varsIgnorePattern": "^(Shared|GasDI|Repository|Routing|EventSystem|StringHelper|Spec_.*|_)$"
        }]
    }
};
