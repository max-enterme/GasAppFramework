# GAS App Framework

Google Apps Script (GAS) アプリケーション用の包括的な TypeScript フレームワークです。モジュラーアーキテクチャ、依存性注入、REST APIフレームワーク、および堅牢なテストインフラストラクチャを提供します。

## 🏗️ アーキテクチャ概要

```
GasAppFramework/
├── modules/                     # ES Modules ソースコード
│   ├── di/                      # 依存性注入コンテナ
│   ├── locking/                 # 分散ロック機構
│   ├── repository/              # データ永続化抽象化
│   ├── routing/                 # URLルーティングとリクエスト処理
│   ├── rest-framework/          # REST APIフレームワーク
│   ├── string-helper/           # 文字列テンプレートとユーティリティ
│   ├── testing/                 # テストフレームワークモジュール
│   │   ├── Assert.ts                # アサーションユーティリティ
│   │   ├── Test.ts                  # テスト定義ユーティリティ
│   │   ├── Runner.ts                # テスト実行エンジン
│   │   └── index.ts                 # テストエクスポート
│   ├── test-runner/             # Webベーステストランナー (doGetハンドラ)
│   ├── shared/                  # 共通タイプ、エラー、ユーティリティ
│   │   ├── Errors.ts                # ベースエラークラス
│   │   └── Time.ts                  # 時間ユーティリティ
│   └── index.ts                 # フレームワークエントリーポイント
├── build/                       # ビルド成果物（GASにプッシュ）
│   ├── main.js (110 KiB)            # doGetハンドラを含むWebpackバンドル
│   └── *.d.ts                       # TypeScript型定義
├── test/                        # フレームワーク自体のテスト
│   ├── Modules/                 # GAS統合テスト
│   │   ├── GAS/                     # 高度なGASランタイム機能テスト
│   │   ├── GasDI/                   # GAS環境での依存性注入
│   │   ├── Locking/                 # LockServiceとPropertiesServiceテスト
│   │   ├── Repository/              # SpreadsheetApp統合テスト
│   │   ├── Routing/                 # URLルーティングテスト
│   │   └── StringHelper/            # 文字列ユーティリティテスト
│   ├── node/                    # Node.jsテストスイート（ローカルのみ）
│   │   ├── shared/                  # 共有テスト用Jestラッパー
│   │   └── integration/             # 統合テスト
│   └── shared/                  # 共有テスト（GASとNode.js両方で実行）
│       ├── gasdi/                   # GasDI共有テスト
│       ├── locking/                 # Locking共有テスト
│       ├── repository/              # Repository共有テスト
│       ├── routing/                 # Routing共有テスト
│       └── stringhelper/            # StringHelper共有テスト
├── gas-main.ts                  # GASエントリーポイント（doGetハンドラ）
├── scripts/                     # ビルドとデプロイスクリプト
│   └── run-gas-tests.js             # リモートテスト実行用CLIツール
└── documents/                   # ドキュメント
```

**凡例:**
- `build/` 内のファイルがGASプロジェクトにプッシュされます（`clasp push`に含まれる）
- `test/node/` は開発のみ、GASデプロイから除外

## 🚀 クイックスタート

### 前提条件

- 開発ツール用のNode.js 18+
- デプロイ用のGoogle Apps Scriptプロジェクト
- GASデプロイ用の`clasp` CLIツール

### インストール

1. **リポジトリをクローン:**
   ```bash
   git clone <repository-url>
   cd GasAppFramework
   ```

2. **開発依存関係をインストール:**
   ```bash
   npm install
   ```

3. **GASデプロイ用にclaspを設定:**
   ```bash
   npm install -g @google/clasp
   clasp login
   clasp create --type standalone
   ```

4. **ビルドとデプロイ:**
   ```bash
   npm run build      # main.jsバンドルをビルド
   npm run gas:push   # GASにプッシュ
   npm run gas:deploy # Webアプリとしてデプロイ（`gas:deploy` は push しません）
   ```

## 🧪 テスト

フレームワークは（ビジネスロジック用の）Node.jsテストと（統合用の）GASテストの両方をサポートしています。

### Node.jsテスト

```bash
# すべてのテストを実行
npm run test:node

# 特定のテストスイートを実行
npm run test:node:shared       # 共有テスト（Jestラッパー）
npm run test:node:integration  # 統合テスト

# カバレッジ付きで実行
npm run test:node -- --coverage
```

**現在のカバレッジ:**
- Node.js環境で **184テスト合格**
- コアビジネスロジック用の **54共有テスト**（StringHelper、Routing、Repository、Locking、GasDI）
- 複雑なシナリオ用の **130統合テスト**

### GASテスト（Webテストランナー）

フレームワークには、doGetハンドラ経由でアクセス可能な組み込みWebテストランナーが含まれています：

**テストの実行:**

1. ビルドとデプロイ：
   ```bash
   npm run build       # main.jsをビルド
   npm run gas:push    # GASにプッシュ
   npm run gas:deploy  # Webアプリとしてデプロイ（`gas:deploy` は push しません）
   ```

2. CLIからテスト実行：
   ```bash
   npm run gas:test                        # すべてのテストを実行
   npm run gas:test -- --category=Routing  # 特定カテゴリを実行
   npm run gas:test -- --list              # テストカテゴリ一覧
   ```

3. または、WebのURLに直接アクセス：
   ```
   https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec?all=true
   https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec?category=StringHelper
   https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec?list=true
   ```

**テストカバレッジ:**
- GAS環境で **55テスト**（9合格、46はTestHelpers.installAll()が必要）
- **Repository**: SpreadsheetApp統合、データ永続化
- **Locking**: LockService統合、PropertiesService分散ロック
- **GasDI**: GASサービスとの依存性注入
- **Routing**: URLルーティングとリクエスト処理
- **StringHelper**: 文字列テンプレートとフォーマットユーティリティ

**詳細なテスト手順については以下を参照:**
- [test/README.md](../test/README.md) - 包括的なテスト構成ガイド
- [GAS_TESTING_GUIDE.md](./GAS_TESTING_GUIDE.md) - GAS固有のテストパターン

## 📚 ライブラリとして使用する

GasAppFrameworkは外部GASプロジェクトでライブラリとして使用できます。

### GASプロジェクトでの使用

GASプロジェクトへのデプロイ後、すべてのモジュールがグローバルで利用可能です：

```typescript
// Repositoryモジュールを使用
const repo = Repository.Engine.create({
    schema: mySchema,
    store: myStore,
    keyCodec: myCodec
});

// StringHelperを使用
const formatted = StringHelper.formatString('Hello {0}!', 'World');

// Testingフレームワークを使用
T.it('my test', () => {
  TAssert.equals(myFunction(), expected);
}, 'MyCategory');
```

### デプロイ設定

GASにデプロイする際、`.claspignore`ファイルが必要なファイルのみがプッシュされることを保証します：

**GASにプッシュされる:**
- `build/main.js` - すべてのモジュールとdoGetハンドラを含むWebpackバンドル
- `build/**/*.d.ts` - TypeScript型定義
- `test/Modules/` - GAS統合テスト
- `test/shared/` - 共有テスト（両環境で実行）
- `appsscript.json` - GAS設定

**GASにプッシュされない（ローカルのみ）:**
- `modules/` - ソースコード（ビルド成果物のみプッシュ）
- `gas-main.ts` - エントリーポイントソース（main.jsのみプッシュ）
- `test/node/` - Node.jsテストファイル
- `node_modules/` - 依存関係
- 開発設定ファイル（webpack.config.js、tsconfig.jsonなど）

## 📦 モジュール使用法

### 利用可能なモジュール

GASへのデプロイ後、これらのモジュールがグローバルで利用可能です：

1. **Repository** - Google Sheetsによるデータ永続化
2. **GasDI** - 依存性注入コンテナ
3. **Routing** - WebアプリリクエストルーティNG
4. **Locking** - 分散ロック
5. **StringHelper** - テンプレート文字列処理
6. **RestFramework** - REST APIフレームワーク
7. **Testing** - テストフレームワーク（T、TAssert、TRunner）
8. **TestRunner** - Webベーステストランナー

### デプロイ方法

#### 標準デプロイ（推奨）
フレームワーク全体をデプロイ：
```bash
npm run build      # すべてのモジュールをmain.jsにバンドル
npm run gas:push   # build/ をGASにプッシュ
npm run gas:deploy # Webアプリとしてデプロイ（`gas:deploy` は push しません）
```

#### 手動デプロイ
```bash
clasp push   # GASにファイルをプッシュ
clasp deploy # 新しいデプロイを作成
```


## 🔧 設定

### Webpack設定
- 単一エントリーポイント: `gas-main.ts`
- 出力: `build/main.js` (110 KiB)
- ターゲット: ES2020（GAS V8ランタイム）
- フォーマット: IIFE（即時実行関数式）

### TypeScript設定
- モダンGASランタイム用のES2020ターゲット
- 厳密なタイプチェックが有効
- 宣言ファイル生成
- デバッグ用ソースマップ

### ESLint設定
- GAS最適化ルール
- TypeScriptサポート
- Node.jsとJest環境

## 🏛️ フレームワークモジュール

各モジュールは特定の機能を提供します：

- **GasDI** - 依存性注入コンテナ
- **Locking** - 分散ロックと並行制御
- **Repository** - Google Sheetsを使った型安全データ永続化
- **Routing** - Webアプリケーションリクエストルーティング
- **StringHelper** - 文字列テンプレートとフォーマットユーティリティ
- **RestFramework** - REST APIコントローラーとルーティング
- **Testing** - テスト定義とアサーションフレームワーク
- **TestRunner** - Webベーステスト実行

## 🎯 ベストプラクティス

### エラーハンドリング
- 型付けされたエラーコードを使用
- ドメイン固有のエラーにはベースエラークラスを拡張
- 構造化コンテキストでエラーをログ

### テスト
- GAS統合には `test/Modules/` にテストを記述
- Node.js単体/統合テストには `test/node/` にテストを記述
- クロス環境テストには `test/shared/` の共有テストを使用
- CLIでテスト: `npm run gas:test`

### タイプセーフティ
- すべてのモジュールは完全に型付け
- 開発にはTypeScriptを使用
- 生成された.d.tsファイルでIDEオートコンプリートを活用

### パフォーマンス
- 大きなデータセットには遅延読み込みを使用
- 適切なキャッシング戦略を実装
- 操作をバッチ化（特にSpreadsheetApp）

## 🏗️ アーキテクチャ

フレームワークは開発ではES Modulesを使用し、GASデプロイにはWebpackバンドリングを使用します：

```typescript
// 開発時（modules/）
import { Container } from './di/Container';
import { Engine } from './repository/Engine';

// GASへのデプロイ後（グローバルアクセス）
const container = GasDI.Container.create();
const repo = Repository.Engine.create({ schema, store, keyCodec });
```

**GASにWebpackを使う理由:**
- GASはES modulesをネイティブサポートしていません
- Webpackがすべてのモジュールを単一のIIFEにバンドル
- グローバルエクスポートでGASでモジュールにアクセス可能
- 型定義でIDEサポートを有効化
- doGetハンドラをバンドルに統合

## 🤝 貢献

1. `modules/` でES Modulesパターンに従う
2. 新機能に包括的なテストを追加
3. 型定義を更新
4. 公開APIをJSDocコメントで文書化
5. ビルド成功を確認: `npm run build`

## 📄 ライセンス

未定

## 🆘 サポート

問題、質問、または貢献については：
1. 既存のドキュメントとテストを確認
2. テスト構成については [test/README.md](../test/README.md) を確認
3. 使用例についてはテストケースを確認
4. デプロイガイドについては [QUICKSTART_GAS.md](../QUICKSTART_GAS.md) と [GAS_DEPLOYMENT.md](../GAS_DEPLOYMENT.md) を参照

---

**フレームワークバージョン:** 1.0.0  
**ビルド成果物:** main.js (110 KiB)  
**GASランタイム:** V8 (ES2020)  
**TypeScript:** 5.x  
**Node.js:** 18+
