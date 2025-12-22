# GAS App Framework

Google Apps Script (GAS) アプリケーション用の包括的な TypeScript フレームワークです。モジュラーアーキテクチャ、依存性注入、イベントシステム、および堅牢なテストインフラストラクチャを提供します。

## 🏗️ アーキテクチャ概要

```
GasAppFramework/
├── src/
│   ├── core/                    # フレームワークコア (☆ GASにプッシュ)
│   │   ├── modules/             # コア機能モジュール
│   │   │   ├── GasDI/          # 依存性注入コンテナ
│   │   │   ├── Locking/        # 分散ロック機構
│   │   │   ├── Repository/     # データ永続化抽象化
│   │   │   ├── Routing/        # URLルーティングとリクエスト処理
│   │   │   └── StringHelper/   # 文字列テンプレートとユーティリティ
│   │   ├── restframework/       # REST APIフレームワーク
│   │   ├── shared/              # 共通タイプ、エラー、ユーティリティ
│   │   │   ├── CommonTypes.d.ts    # 共有インターフェース (Logger, Clock等)
│   │   │   ├── ErrorTypes.d.ts     # エラータイプ定義
│   │   │   ├── Errors.ts           # ベースエラークラス
│   │   │   └── Time.ts             # 時間ユーティリティ
│   │   └── index.ts             # コアモジュールエクスポート
│   └── testing/                 # テストフレームワークモジュール
│       ├── common/              # 共通テストフレームワーク (☆ GASにプッシュ)
│       │   ├── Assert.ts           # アサーションユーティリティ
│       │   ├── Test.ts             # テスト定義ユーティリティ
│       │   ├── Runner.ts           # テスト実行エンジン
│       │   └── index.ts            # 共通テストエクスポート
│       ├── gas/                 # GAS固有のテストサポート (☆ GASにプッシュ)
│       │   ├── GasReporter.ts      # GAS用テスト結果レポート
│       │   ├── TestHelpers.ts      # テストダブル、GASモック、ユーティリティ
│       │   └── index.ts            # GASテストエクスポート
│       └── node/                # Node.js固有のテストサポート (ローカルのみ)
│           ├── test-utils.ts       # Jestテストユーティリティ
│           └── index.ts            # Node.jsテストエクスポート
├── test/                        # GasAppFramework自体のGASテスト
│   ├── @entrypoint.ts              # メインテストランナー (GASでtest_RunAll()を呼び出す)
│   └── Modules/                    # モジュール固有のGAS統合テスト
│       ├── GAS/                    # 高度なGASランタイム機能テスト
│       ├── GasDI/                  # GAS環境での依存性注入
│       ├── Locking/                # LockServiceとPropertiesServiceテスト
│       ├── Repository/             # SpreadsheetApp統合テスト
│       ├── Routing/                # URLルーティングテスト
│       └── StringHelper/           # 文字列ユーティリティテスト
└── test_node/                   # GasAppFramework自体のNode.jsテスト (ローカルのみ)
```

**凡例:**
- ☆ = GASプロジェクトにプッシュされる（`clasp push`に含まれる）
- (ローカルのみ) = 開発のみ、GASデプロイから除外

## 🚀 クイックスタート

### 前提条件

- 開発ツール用のNode.js 16+
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

4. **基本設定例:**
   ```typescript
   // main.ts - GASプロジェクトのエントリーポイント
   function doGet(e: GoogleAppsScript.Events.DoGet) {
       return Routing.Engine.handleGet(e)
   }
   
   function doPost(e: GoogleAppsScript.Events.DoPost) {
       return Routing.Engine.handlePost(e)
   }
   ```

## 🧪 テスト

フレームワークは（ビジネスロジック用の）Node.jsテストと（統合用の）GASテストの両方をサポートしています。

### Node.jsテスト

```bash
# コアビジネスロジック用のJestテストを実行
npm run test:node

# カバレッジ付きで実行
npm run test:node -- --coverage
```

### GASテスト

1. テストフレームワークをGASプロジェクトにデプロイ:
   ```bash
   clasp push
   ```

2. GASエディターでテストエントリーポイントを実行:
   ```javascript
   // GASエディターでこの関数を呼び出す
   test_RunAll()
   ```

3. GASロガーまたは実行トランスクリプトで結果を確認。

## 📚 ライブラリとして使用する

GasAppFrameworkは外部プロジェクトでライブラリとして使用できます。フレームワークは異なる用途に応じて選択的インポートを提供します:

### コアフレームワークのみ

GASプロジェクトでフレームワークモジュールのみを使用:

```typescript
// 名前空間からインポート（GASスタイル）
// デプロイ後、フレームワークモジュールはグローバルで利用可能

// Repositoryモジュールを使用
const repo = Repository.Engine.create({
    schema: mySchema,
    store: myStore,
    keyCodec: myCodec
});

// StringHelperを使用
const formatted = StringHelper.formatString('Hello {0}!', 'World');
```

### GASプロジェクトでのテストフレームワーク

共通テストフレームワークとGAS固有のテストユーティリティを含める:

```typescript
// 共通テストフレームワークを使用してテストを定義
T.it('正しく動作すること', () => {
    const result = myFunction();
    TAssert.equals(result, expectedValue);
}, 'MyModule');

// GASでテストを実行
function test_RunAll() {
    const results = TRunner.runAll();
    TGasReporter.print(results);
}

// テストヘルパーを使用
const mockLogger = new TestHelpers.Doubles.MockLogger();
TestHelpers.GAS.installAll(); // GAS環境モックをインストール
```

### Node.jsプロジェクトでのテストフレームワーク

GAS互換性を持つNode.js/Jestテスト用:

```typescript
import { setupGASMocks, createMockLogger } from 'gas-app-framework/testing/node';

// GAS環境モックをセットアップ
beforeAll(() => {
    setupGASMocks();
});

// テストデータを作成
const logger = createMockLogger();
```

### デプロイ設定

GASにデプロイする際、`.claspignore`ファイルが必要なモジュールのみがプッシュされることを保証します:

**GASにプッシュされる (☆):**
- `src/core/` - フレームワークコアモジュール
- `src/testing/common/` - 共通テストフレームワーク（GAS + Node.js互換）
- `src/testing/gas/` - GAS固有のテストユーティリティ
- `test/` - あなたのGASテストファイル

**GASにプッシュされない (ローカルのみ):**
- `src/testing/node/` - Node.js固有のテストユーティリティ
- `test_node/` - Node.jsテストファイル
- `node_modules/` - 依存関係
- `*.test.ts`, `*.spec.ts` - テストファイル

## 📦 モジュールダウンロード & デプロイ

### 個別モジュールダウンロード

各モジュールは独立してダウンロード・使用できます:

```bash
# Repository モジュールのみダウンロード
curl -O https://github.com/max-enterme/GasAppFramework/raw/main/src/core/modules/Repository/
```

### デプロイ方法

#### オプション1: フルフレームワーク

```bash
# 全モジュールをデプロイ
clasp push
```

#### オプション2: 選択的モジュール

必要なモジュールのみをプロジェクトにコピー:

```bash
# 特定のモジュールをコピー
cp -r src/core/modules/Repository/* your-project/src/
cp -r src/core/shared/* your-project/src/

# オプションでテストフレームワークを含める
cp -r src/testing/common/* your-project/test/framework/
cp -r src/testing/gas/* your-project/test/framework/
```

#### オプション3: 生成バンドル

```bash
# カスタムバンドルを作成
npm run build:bundle -- --modules=Repository,GasDI
```

## 🔧 設定

### ESLint設定
フレームワークにはGAS最適化されたESLintルールが含まれています:
- GAS互換性のためのnamespaceを許可
- タイプ宣言用のtriple-slash参照を許可
- TypeScript namespaceパターン用に設定

### TypeScript設定
GASデプロイとNode.js開発の両方に最適化:
- モダンGASランタイム用のES2020ターゲット
- 厳密なタイプチェックが有効
- 宣言ファイル生成
- デバッグ用ソースマップ

## 🏛️ フレームワークモジュール

フレームワークには以下のモジュールが含まれており、それぞれに包括的なドキュメントが用意されています:

- **[Repository](src/Modules/Repository/README_ja.md)** - Google Sheetsを使った型安全データ永続化
- **[EventSystem](src/Modules/EventSystem/README_ja.md)** - Cronジョブ、トリガー、ワークフロー自動化  
- **[GasDI](src/Modules/GasDI/README_ja.md)** - 依存性注入コンテナ
- **[Routing](src/Modules/Routing/README_ja.md)** - Webアプリケーションリクエストルーティング
- **[Locking](src/Modules/Locking/README_ja.md)** - 分散ロックと並行制御
- **[StringHelper](src/Modules/StringHelper/README_ja.md)** - 文字列テンプレートとフォーマットユーティリティ

各モジュールディレクトリには、API文書、使用例、テスト戦略を含む詳細なREADMEファイルが含まれています。

## 🎯 ベストプラクティス

### エラーハンドリング
```typescript
// 構造化エラーハンドリングを使用
try {
    const result = riskyOperation()
} catch (error) {
    if (error instanceof Shared.Errors.ValidationError) {
        // 検証エラーを処理
    } else if (error instanceof Shared.Errors.NetworkError) {
        // ネットワークエラーを処理
    }
}
```

### テスト
```typescript
// TestHelpersを活用してモックを作成
const mockLogger = TestHelpers.createLogger()
const mockStore = TestHelpers.createMemoryStore()
```

### タイプセーフティ
```typescript
// 強いタイピングで型システムを活用
interface UserSchema extends Repository.Ports.Schema<User, 'id'> {
    parameters: ['id', 'name', 'email']
    keyParameters: ['id']
}
```

### パフォーマンス
- 大きなデータセットには遅延読み込みを使用
- GAS実行時間制限内に収まるよう操作をバッチ化
- プロパティサービスで設定をキャッシュ

## 🏗️ GAS用Namespaceアーキテクチャ

フレームワークはGoogle Apps Script用に最適化された階層namespace設計を使用します:

```typescript
// Namespaceはモジュラー構造を提供します
namespace Repository.Engine { 
    export function create() { /*...*/ }
}

// GAS環境でのアクセスパターン
const repo = Repository.Engine.create({ schema, store, keyCodec })
const codec = Repository.Codec.simple('|')
```

**GAS用Namespaceを使う理由:**
- Google Apps ScriptはESモジュール（import/export）をサポートしていません
- NamespaceはGAS制約内でモジュラー組織を提供します
- デプロイにビルドステップが不要
- 優れたIDE統合でフルTypeScriptサポート

## GAS互換性注意事項

### ランタイム制限
- **実行時間**: 最大6分（シンプルトリガー）、最大30分（インストール可能トリガー）
- **メモリ**: 制限された実行環境
- **並行実行**: シングルスレッド環境

### API制限
- **外部API**: URLFetchを使用してHTTPリクエスト
- **ファイルアクセス**: DriveApp、SpreadsheetApp経由
- **データベース**: Spreadsheetを主データストアとして使用

### 開発とデプロイ
- **ローカル開発**: TypeScriptで開発してコンパイル
- **テスト**: Node.jsで単体テスト、GASで統合テスト
- **デプロイ**: `clasp`を使用してGASプロジェクトにプッシュ

## 🤝 貢献

1. 確立されたnamespaceパターンに従ってください
2. 新機能に包括的なテストを追加してください
3. 別の`.d.ts`ファイルでタイプ定義を更新してください
4. JSDocコメントでパブリックAPIを文書化してください
5. Node.jsとGASの両方の互換性を確保してください

## 📄 ライセンス

[ライセンス情報をここに追加]

## 🆘 サポート

問題、質問、または貢献については:
1. 既存のドキュメントとテストを確認
2. **`src/Modules/`ディレクトリ内のモジュール固有のREADMEファイル**を確認
3. 使用例についてテストケースを調査
4. バグや機能リクエストはissueを開いてください

---

**フレームワークバージョン:** 1.0.0  
**GASランタイム:** V8 (ES2020)  
**TypeScript:** 5.x  
**Node.js:** 16+