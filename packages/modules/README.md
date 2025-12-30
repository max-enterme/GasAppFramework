# gas-app-framework-modules

GasAppFramework の `modules/` を npm 依存として配布するためのパッケージです（実行用JS + 型定義d.ts を同梱）。

## 使い方（利用側）

- 依存追加: `npm i @max-enterme/gas-app-framework-modules`
- 利用: `import { DI, Repository } from '@max-enterme/gas-app-framework-modules'`

※ Google Apps Script へは、利用側プロジェクトで webpack 等でバンドルして `clasp push` してください。

## 開発（このリポジトリ内）

- ビルド: `npm run build:modules`
- パック: `npm run pack:modules`
