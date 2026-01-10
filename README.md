# GasAppFramework

Google Apps Script用のTypeScriptフレームワーク - DI、REST API、Repository、Testing完備

## 主な機能

- **DI Container** - 依存性注入（Singleton/Transient/Scoped）
- **Repository** - Spreadsheet/Memory永続化
- **Locking** - 分散ロック（Properties/LockService）
- **REST Framework** - API構築（Controller/Router/ErrorHandler）
- **Testing** - GAS/Node.js両環境対応テストフレームワーク

## セットアップ

```bash
npm install
npm run build

# GAS初回セットアップ
npm install -g @google/clasp
clasp login
clasp create --type standalone --title "GasAppFramework"
```

## デプロイと設定

### 1. ビルド & プッシュ
```bash
npm run gas:push
```

### 2. Web App設定（初回のみ）

GASエディタで:
1. 「デプロイ」→「新しいデプロイ」
2. 種類: ウェブアプリ
3. アクセス: 全員
4. HEAD deploymentのIDをコピー

### 3. 設定ファイル作成

```bash
cp .gas-config.example.json .gas-config.json
```

`.gas-config.json`を編集:
```json
{
  "deployments": {
    "headDeployId": "AKfycby...",
    "targetDeployId": "AKfycbx..."
  }
}
```

## テスト実行

```bash
# Node.js環境（高速、開発用）
npm test

# GAS環境（統合テスト）
npm run gas:test                  # HEAD deployment
npm run gas:test -- --target      # Target deployment
npm run gas:test -- --category=Repository
```

## プロジェクト構成

```
GasAppFramework/
├── modules/                    # ES Modules ソースコード
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
├── test/                      # テストコード
│   ├── Modules/               # GAS環境テスト
│   ├── node/                  # Node.js環境テスト
│   └── shared/                # 共通テストユーティリティ
│
├── scripts/                   # ビルド/デプロイスクリプト
├── documents/                 # ドキュメント
├── types/                     # TypeScript型定義
│
├── gas-main.ts                # GASエントリーポイント
├── package.json               # NPM設定
├── tsconfig.json              # TypeScript設定
├── webpack.config.js          # Webpack設定
└── .claspignore               # clasp除外設定
```
modules/
├── di/              # Dependency Injection Container
├── locking/         # Distributed Locking (Properties/LockService)
├── repository/      # Data Repository (Spreadsheet/Memory)
├── routing/         # URL Routing & Middleware
├── rest-framework/  # REST API Framework
├── string-helper/   # String Utilities
├── testing/         # Test Framework (Assert/Runner)
├── test-runner/     # Web Test Runner (doGet handler)
└── shared/          # Common Types & Utilities

test/
├── gas/            # GAS統合テスト（SpreadsheetApp等）
├── shared/         # 両環境共通テスト
└── node/           # Node.js専用テスト
```

## npm scripts

```bash
# ビルド
npm run build              # Webpack build
npm run type-check         # TypeScript型チェック
npm run lint              # ESLint
npm run lint:fix          # ESLint auto-fix

# テスト
npm test                  # Node.jsテスト
npm run gas:test          # GASテスト（HEAD）
npm run gas:test -- --target  # GASテスト（Target）

# デプロイ
npm run gas:push          # Build + Push to GAS
npm run gas:deploy        # Deploy as Web App (does not push)
npm run gas:open          # Open GAS Editor
```

## ドキュメント

- [documents/README_ja.md](documents/README_ja.md) - フレームワーク詳細（日本語）
- [documents/DEPENDENCY_INJECTION_ja.md](documents/DEPENDENCY_INJECTION_ja.md) - DI詳細
- [documents/CONTROLLER_DESIGN_ja.md](documents/CONTROLLER_DESIGN_ja.md) - Controller設計
- [test/README.md](test/README.md) - テスト構成

## ライセンス

MIT License

