# Config & Tooling Files

このZIPは、プロジェクトで利用する設定ファイル一式です。

- `.editorconfig`
- `.claspignore`（Node系テスト・設定を除外済み）
- `.eslintrc.cjs` / `.eslintignore`
- `jest.config.cjs`
- `tsconfig.json`
- `package.json`（devDependenciesにTypeScript/Jest/ESLint一式を定義）

## 利用方法
1. プロジェクトルートに展開
2. `npm install` で devDependencies を導入
3. `clasp push` 時に `test_node` や Node系設定ファイルは除外されます
