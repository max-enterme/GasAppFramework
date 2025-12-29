# GasAppFramework - Directory Structure

ES Modules版プロジェクト構成

## コアディレクトリ

```
GasAppFramework/
├── modules/                    # ES Modules版ソースコード
│   ├── di/                    # DI Container
│   ├── locking/               # Distributed Locking
│   ├── repository/            # Data Repository
│   ├── routing/               # URL Routing
│   ├── rest-framework/        # REST API Framework
│   ├── testing/               # Testing Framework
│   ├── test-runner/           # Web Test Runner
│   ├── string-helper/         # String Utilities
│   ├── shared/                # Shared Utilities
│   └── index.ts               # Entry Point
│
├── build/                     # ビルド成果物（GASにデプロイ）
│   ├── main.js                # メインバンドル (110 KiB) - doGetハンドラ含む
│   ├── index.d.ts             # トップレベル型定義
│   └── */                     # モジュール別型定義 (.d.ts)
│
├── test/                      # テストコード
│   ├── Modules/               # GAS環境統合テスト
│   │   ├── StringHelper/      # 文字列ユーティリティテスト
│   │   ├── Routing/           # ルーティングテスト
│   │   ├── Repository/        # Repositoryテスト
│   │   ├── Locking/           # ロックテスト
│   │   ├── GasDI/             # 依存性注入テスト
│   │   └── GAS/               # GAS高度機能テスト
│   ├── node/                  # Node.js環境テスト
│   │   ├── shared/            # 共有テスト用Jestラッパー
│   │   └── integration/       # 統合テスト
│   └── shared/                # 両環境で実行可能な共有テスト
│       ├── stringhelper/
│       ├── routing/
│       ├── repository/
│       ├── locking/
│       └── gasdi/
│
├── scripts/                   # ビルド/デプロイスクリプト
│   └── run-gas-tests.js       # GASテスト実行CLIツール
│
├── documents/                 # ドキュメント
│   ├── README.md
│   ├── README_ja.md
│   ├── DEPENDENCY_INJECTION.md
│   ├── DEPENDENCY_INJECTION_ja.md
│   ├── CONTROLLER_DESIGN.md
│   ├── CONTROLLER_DESIGN_ja.md
│   └── GAS_TESTING_GUIDE.md
│
├── types/                     # TypeScript型定義
│   └── gas-globals.d.ts       # GASグローバルAPI型定義
│
├── gas-main.ts                # GASエントリーポイント（doGetハンドラ）
├── package.json               # npm設定
├── tsconfig.json              # TypeScript設定
├── webpack.config.js          # webpack設定（main.jsビルド）
├── jest.config.cjs            # Jest設定
├── eslint.config.mjs          # ESLint設定
├── .clasp.json                # clasp設定（GASデプロイ）
├── .claspignore               # clasp除外設定
├── appsscript.json            # GAS Webアプリ設定
├── README.md                  # プロジェクト説明
├── QUICKSTART_GAS.md          # GASクイックスタートガイド
├── GAS_DEPLOYMENT.md          # GASデプロイメントガイド
└── STRUCTURE.md               # このファイル
```

## ビルドワークフロー

1. **開発**: modules/ でES Modulesとして開発
2. **ビルド**: webpack が gas-main.ts をエントリーポイントとして main.js を生成
3. **デプロイ**: clasp が build/ の内容をGASにプッシュ
4. **テスト**: CLI (npm run gas:test) または Web UI でテスト実行

## モジュール構成

### modules/di/ (6 files)
Dependency Injection コンテナ実装
- Container.ts, Context.ts, Decorators.ts, GenericFactory.ts, Types.ts, index.ts

### modules/locking/ (4 files)
分散ロック機構
- Engine.ts, Adapters.ts, Types.ts, index.ts

### modules/repository/ (8 files)
データ永続化抽象化レイヤー
- Engine.ts, MemoryAdapter.ts, SpreadsheetAdapter.ts, Codec.ts, SchemaFactory.ts, Errors.ts, Types.ts, index.ts

### modules/routing/ (3 files)
URLルーティングとリクエスト処理
- Engine.ts, Types.ts, index.ts

### modules/rest-framework/ (9+ files)
REST APIフレームワーク
- Types.ts, Logger.ts, ErrorHandler.ts, ApiResponseFormatter.ts, RouteExecutor.ts, ApiController.ts, NormalizedRequest.ts, RequestMappers.ts, index.ts

### modules/testing/ (5 files)
テストフレームワーク（T, TAssert, TRunner）
- Test.ts, Runner.ts, Assert.ts, GasReporter.ts, TestHelpers.ts, index.ts

### modules/test-runner/ (3 files)
Webベーステストランナー（doGet統合）
- WebTestRunner.ts, HtmlReporter.ts, Types.ts, index.ts

### modules/string-helper/ (1 file)
文字列ユーティリティ
- index.ts

### modules/shared/ (3 files)
共通タイプとユーティリティ
- Errors.ts, Time.ts, index.ts

## ビルド成果物

### main.js (110 KiB)
- すべてのモジュールを含むWebpackバンドル
- doGetハンドラ統合
- グローバルエクスポート（T, TAssert, Repository, etc.）
- GAS V8ランタイム（ES2020）対応

### 型定義ファイル
- **build/index.d.ts**: トップレベル型定義
- **build/di/*.d.ts**: DIモジュール型定義
- **build/locking/*.d.ts**: Lockingモジュール型定義
- **build/repository/*.d.ts**: Repositoryモジュール型定義
- **build/routing/*.d.ts**: Routingモジュール型定義
- **build/rest-framework/*.d.ts**: RestFrameworkモジュール型定義
- **build/testing/*.d.ts**: Testingモジュール型定義
- **build/test-runner/*.d.ts**: TestRunnerモジュール型定義
- **build/shared/*.d.ts**: Sharedモジュール型定義

合計: 約45個の型定義ファイル

## GASデプロイ対象

`.claspignore` により、以下のファイルのみがGASにデプロイされます：

### デプロイされるファイル
- `build/main.js` - メインバンドル
- `build/**/*.d.ts` - すべての型定義
- `test/Modules/**/*.ts` - GAS統合テスト
- `test/shared/**/*.ts` - 共有テスト
- `appsscript.json` - GAS設定
- `types/gas-globals.d.ts` - グローバル型定義

### デプロイされないファイル（開発専用）
- `modules/` - ソースコード（ビルド済みmain.jsのみデプロイ）
- `gas-main.ts` - エントリーポイントソース
- `test/node/` - Node.jsテスト
- `node_modules/` - npm依存関係
- 各種設定ファイル (webpack.config.js, tsconfig.json, etc.)

## テスト構成

### test/Modules/ - GAS環境統合テスト
GAS固有のAPIを使用するテスト（SpreadsheetApp, PropertiesService, LockService等）

### test/shared/ - 両環境共有テスト
GASとNode.js両方で実行可能な純粋なロジックテスト

### test/node/ - Node.js専用テスト
- **shared/**: 共有テスト用Jestラッパー
- **integration/**: 複雑な統合テスト

## npm スクリプト

### ビルド関連
- `npm run build` - TypeScriptビルド + webpack バンドル
- `npm run type-check` - 型チェックのみ
- `npm run lint` - ESLint実行

### GASデプロイ関連
- `npm run gas:push` - build + clasp push
- `npm run gas:deploy` - Webアプリとしてデプロイ
- `npm run gas:open` - GASエディタを開く

### テスト関連
- `npm test` - Node.jsテスト（Jest）
- `npm run test:node` - Node.jsテスト
- `npm run test:node:shared` - 共有テストのみ
- `npm run test:node:integration` - 統合テストのみ
- `npm run gas:test` - GASテスト（CLI経由）

詳細は [README.md](README.md) を参照してください。
