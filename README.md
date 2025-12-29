# GasAppFramework - ES Modules Edition 🚀

Google Apps Script用の包括的なアプリケーションフレームワーク

## 概要

GasAppFrameworkは、Google Apps Script（GAS）プロジェクトの開発を効率化するための、モジュール化されたフレームワークです。TypeScript + Webpack + ES Modulesで構築され、型安全で保守性の高いGASアプリケーション開発をサポートします。

## 🎯 主な機能

### コアモジュール
- **DI Container** - 依存性注入による疎結合な設計
- **Locking** - 分散ロック管理（PropertiesService/LockService統合）
- **Repository** - データ永続化パターン（Spreadsheet/Memory）
- **Routing** - URLルーティングとミドルウェア
- **StringHelper** - 文字列操作ユーティリティ

### RESTフレームワーク
- **ApiController** - REST APIコントローラー基底クラス
- **RouteExecutor** - DI統合ルート実行エンジン
- **ErrorHandler** - 統一エラーハンドリング
- **RequestMappers** - リクエストマッピングユーティリティ
- **Logger** - ロギング機構

### テスティングフレームワーク
- **Testing** - ユニットテスト機構
  - Test registration: `T.it(name, fn, category)`
  - Assertions: `TAssert.equals()`, `TAssert.isTrue()`, etc.
  - Test runner: `TRunner.runAll()`, `TRunner.runByCategory()`
- **TestRunner** - Web-based test runner
  - ブラウザ/CLIからテスト実行
  - カテゴリ別テスト実行
  - HTML/JSON形式出力
  - レスポンシブUI

## 🚀 クイックスタート

### インストール

```bash
# リポジトリをクローン
git clone <repository-url>
cd GasAppFramework

# 依存関係をインストール
npm install
```

### ビルド

```bash
# TypeScriptコードをビルド
npm run build

# 型チェック
npm run type-check

# Lint
npm run lint
```

### GASへデプロイ

```bash
# ビルド + GASへプッシュ
npm run gas:push

# Web アプリとしてデプロイ
npm run gas:deploy

# GASエディタを開く
npm run gas:open
```

### テスト実行

```bash
# ローカルテスト（Node.js環境）
npm test

# GAS環境でテスト（CLIから）
npm run gas:test

# カテゴリ別にテスト実行
npm run gas:test -- --category=Repository
```

詳細な手順は [QUICKSTART_GAS.md](QUICKSTART_GAS.md) と [GAS_DEPLOYMENT.md](GAS_DEPLOYMENT.md) を参照してください。

## 📦 ビルド成果物

```
build/
├── main.js (110 KiB)           # メインバンドル（doGet handler含む）
├── index.d.ts                  # トップレベル型定義
└── di/, locking/, repository/, routing/, rest-framework/, testing/, test-runner/, shared/
    └── *.d.ts                  # 各モジュールの型定義
```

## 🏗️ プロジェクト構成

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

詳細は [STRUCTURE.md](STRUCTURE.md) を参照してください。

## 使い方

### GASでのグローバルアクセス

GASへデプロイ後、各モジュールはグローバルスコープから直接アクセスできます：

```typescript
// Repository module
const repo = Repository.Engine.create({
  schema: mySchema,
  store: myStore,
  keyCodec: myCodec,
});

// Testing module
T.it('should work', () => {
  TAssert.isTrue(true);
}, 'MyCategory');

// GasDI module
const container = GasDI.Container.create();
container.register('logger', () => ({ info: Logger.log }));
```

### Web Test Runner（doGet統合）

gas-main.tsにはdoGetハンドラが組み込まれており、デプロイ後すぐにWebテストランナーを使用できます：

```
https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec?all=true
```

利用可能なパラメータ:
- `?all=true` - すべてのテストを実行
- `?category=MyCategory` - 特定カテゴリのテストを実行
- `?list=true` - テストカテゴリ一覧を表示
- `?format=json` - JSON形式で結果を出力（CLI用）

## テストの実行

### Node.js環境でのテスト
```bash
# すべてのテストを実行
npm test

# 特定のテストを実行
npm run test:node:shared
npm run test:node:integration
```

### GAS環境でのテスト
```bash
# GASへプッシュ
clasp push

# GAS IDEでtest_RunAll()を実行
# または、Web Test Runnerを使用（上記参照）
```

## モジュール構成

整理後のプロジェクト構成については、[STRUCTURE.md](STRUCTURE.md) を参照してください。

```
modules/
├── di/                      # Dependency Injection
├── locking/                 # Distributed Locking
├── repository/              # Data Repository
├── routing/                 # URL Routing
├── rest-framework/          # REST API Framework
├── testing/                 # Testing Framework
├── test-runner/             # Web Test Runner
├── string-helper/           # String Utilities
└── shared/                  # Shared Utilities
```

詳細は [STRUCTURE.md](STRUCTURE.md) を参照してください。

## ドキュメント

詳細なドキュメントは `documents/` ディレクトリを参照してください:

- [README.md](documents/README.md) - 全体概要（英語）
- [README_ja.md](documents/README_ja.md) - 全体概要（日本語）
- [DEPENDENCY_INJECTION.md](documents/DEPENDENCY_INJECTION.md) - DI詳細（英語）
- [DEPENDENCY_INJECTION_ja.md](documents/DEPENDENCY_INJECTION_ja.md) - DI詳細（日本語）
- [CONTROLLER_DESIGN.md](documents/CONTROLLER_DESIGN.md) - コントローラー設計（英語）
- [CONTROLLER_DESIGN_ja.md](documents/CONTROLLER_DESIGN_ja.md) - コントローラー設計（日本語）
- [GAS_TESTING_GUIDE.md](documents/GAS_TESTING_GUIDE.md) - テスティングガイド
- [NAMESPACE_ORGANIZATION.md](documents/NAMESPACE_ORGANIZATION.md) - 名前空間構成（レガシー）

## マイグレーション履歴

詳細は [Features.md](Features.md) を参照してください。

### Phase 1: DI Container + Shared (✅ 完了)
- modules/di/ - DI Container機能
- modules/shared/ - 共通ユーティリティ

### Phase 2: Core Modules (✅ 完了)
- modules/locking/ - Locking Module
- modules/repository/ - Repository Module
- modules/routing/ - Routing Module
- modules/string-helper/ - StringHelper Module

### Phase 3: RestFramework (✅ 完了)
- modules/rest-framework/ - REST API Framework

### Phase 4: Testing Framework (✅ 完了)
- modules/testing/ - Testing Framework

### Phase 5: Web Test Runner (✅ 完了)
- modules/test-runner/ - doGet-based Web Test Runner

## ライセンス

MIT License

## 作者

y-tama-league

---

**Status**: ES Modules Migration Complete! 🎉

Last Updated: 2024-12-28
