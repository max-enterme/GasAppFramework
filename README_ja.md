# GAS App Framework

Google Apps Script (GAS) アプリケーション向けの包括的なTypeScriptフレームワークです。モジュラーアーキテクチャ、依存性注入、イベントシステム、堅牢なテストインフラストラクチャを提供します。

## 🏗️ アーキテクチャ概要

```
GasAppFramework/
├── src/
│   ├── Modules/           # コア機能モジュール
│   │   ├── EventSystem/   # Cronジョブ、トリガー、ワークフロー
│   │   ├── GasDI/         # 依存性注入コンテナ
│   │   ├── Locking/       # 分散ロック機構
│   │   ├── Repository/    # データ永続化抽象層
│   │   ├── Routing/       # URLルーティングとリクエスト処理
│   │   └── StringHelper/  # 文字列テンプレートとユーティリティ
│   └── Shared/            # 共通型、エラー、ユーティリティ
│       ├── CommonTypes.d.ts    # 共有インターフェース (Logger, Clock など)
│       ├── ErrorTypes.d.ts     # エラー型定義
│       ├── Errors.ts           # ベースエラークラス
│       ├── Ports.d.ts          # レガシー互換性レイヤー
│       └── Time.ts             # 時間ユーティリティ
└── test/                  # GAS対応テストフレームワーク
    ├── _framework/        # GAS用カスタムテストランナーとヘルパー
    │   └── TestHelpers.ts      # テストダブルとユーティリティ
    └── Modules/           # モジュール固有のテスト
```

## 🚀 クイックスタート

### 前提条件

- Node.js 16+ （開発ツール用）
- Google Apps Script プロジェクト（デプロイ用）
- `clasp` CLI ツール（GASデプロイ用）

### インストール

1. **リポジトリのクローン:**
   ```bash
   git clone <repository-url>
   cd GasAppFramework
   ```

2. **開発依存関係のインストール:**
   ```bash
   npm install
   ```

3. **GASデプロイ用claspの設定:**
   ```bash
   npm install -g @google/clasp
   clasp login
   clasp create --type standalone  # または既存プロジェクトに接続
   ```

## 🧪 テスト手法（Node.js/GAS両対応）

フレームワークはNode.jsテスト（ビジネスロジック用）とGASテスト（統合テスト用）の両方をサポートしています。

### Node.jsテスト

```bash
# コアビジネスロジックのJestテストを実行
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

### テスト戦略の特徴

- **二重テスト環境**: Node.js環境でのユニットテストとGAS環境での統合テスト
- **モックとテストダブル**: `TestHelpers.Doubles`を使用したGAS APIのモック
- **型安全性**: TypeScriptによる厳密な型チェック
- **自動化**: Node.js環境でのCI/CD対応

## 📦 モジュールダウンロードとデプロイメント

### 個別モジュールダウンロード

各モジュールは独立して使用可能です:

1. **Repository モジュール** - Google Sheetsを使ったデータ永続化
2. **EventSystem モジュール** - Cronジョブとワークフロー自動化  
3. **GasDI モジュール** - 依存性注入
4. **Routing モジュール** - Webアプリリクエストルーティング
5. **Locking モジュール** - 分散ロック
6. **StringHelper モジュール** - テンプレート文字列処理

### デプロイメント方法

#### オプション1: 完全フレームワーク
包括的な機能のためにフレームワーク全体をデプロイ:
```bash
clasp push
```

#### オプション2: 選択的モジュール
必要なモジュールのみをプロジェクトにコピー:
```bash
# 特定のモジュールをコピー
cp -r src/Modules/Repository/* your-project/src/
cp -r src/Shared/* your-project/src/
```

#### オプション3: 生成バンドル
ビルドプロセスを使用して最適化されたバンドルを作成:
```bash
npm run build
# dist/ フォルダからデプロイ
```

## 🔧 設定

### ESLint設定
フレームワークはGAS最適化ESLintルールを含みます:
- GAS互換性のためのnamespace許可
- 型宣言のための三重スラッシュ参照許可
- TypeScript namespaceパターン用設定

### TypeScript設定
GASデプロイとNode.js開発の両方に最適化:
- モダンGASランタイム用ES2020ターゲット
- 厳密な型チェック有効
- 宣言ファイル生成
- デバッグ用ソースマップ

## 🏛️ モジュール詳細説明

### Repository モジュール
Google Sheetsバックエンドでの型安全なデータ永続化を提供。

**主要機能:**
- スキーマベースのエンティティ検証
- 複合キーのエンコード/デコード
- 変更追跡付きUpsert操作
- メモリとSpreadsheetアダプター

**使用例:**
```typescript
// エンティティスキーマの定義
const userSchema: Repository.Ports.Schema<User, 'id'> = {
    parameters: ['id', 'name', 'email'],
    keyParameters: ['id'],
    instantiate: () => ({ id: '', name: '', email: '' }),
    fromPartial: (p) => ({ id: p.id || '', name: p.name || '', email: p.email || '' })
}

// リポジトリの作成
const userRepo = Repository.Engine.create({
    schema: userSchema,
    store: new Repository.Adapters.GAS.Spreadsheet.Store('your-sheet-id'),
    keyCodec: Repository.Codec.simple()
})

// リポジトリの使用
userRepo.load()
userRepo.upsert({ id: 'user1', name: 'John', email: 'john@example.com' })
const user = userRepo.find({ id: 'user1' })
```

### EventSystem モジュール
スケジュールジョブ、トリガー、マルチステップワークフローを処理。

**主要機能:**
- Cronベースのジョブスケジューリング
- マルチステップワークフロー実行
- タイムゾーン対応スケジューリング
- 長時間実行プロセスのチェックポイント復旧

**使用例:**
```typescript
// シンプルなジョブの定義
const jobStore = new EventSystem.Adapters.GAS.SimpleJobStore([{
    id: 'daily-report',
    handler: 'generateDailyReport',
    cron: '0 9 * * *',  // 毎日午前9時
    enabled: true
}])

// スケジューラーの実行
const trigger = EventSystem.Trigger.create({
    jobs: jobStore,
    scheduler: new EventSystem.Schedule.CronScheduler(),
    invoker: { invoke: (handler, ctx) => eval(`${handler}(ctx)`) }
})

trigger.run(new Date())
```

### GasDI モジュール
コンポーネントライフサイクル管理のための依存性注入コンテナ。

**使用例:**
```typescript
// サービスの登録
GasDI.Root.registerValue('config', { apiKey: 'secret' })
GasDI.Root.registerFactory('logger', () => new ConsoleLogger(), 'singleton')

// 注入用デコレーターの使用
@GasDI.Decorators.Resolve()
class UserService {
    constructor(
        @GasDI.Decorators.Inject('logger') private logger: Logger,
        @GasDI.Decorators.Inject('config') private config: Config
    ) {}
}
```

## 🏗️ GAS用Namespaceアーキテクチャ

フレームワークはGoogle Apps Script用に最適化された階層的namespace設計を使用:

```typescript
// Namespaceの構成はモジュラー構造を提供
namespace Repository.Engine { 
    export function create() { /*...*/ }
}

// GAS環境でのアクセスパターン
const repo = Repository.Engine.create({ schema, store, keyCodec })
const codec = Repository.Codec.simple('|')
```

**GASでNamespaceを使用する理由:**
- Google Apps ScriptはESモジュール（import/export）をサポートしない
- NamespaceはGAS制約内でモジュラー構成を提供
- デプロイメントにビルドステップ不要
- 優れたIDE統合でのTypeScriptサポート

### Namespace設計の利点

- **GAS互換性**: モジュールバンドルなしでGASランタイムでネイティブ動作
- **ビルドステップゼロ**: モジュール用のトランスパイルなしで直接GASにデプロイ可能
- **明確な構成**: 階層構造により依存関係と関係が明確
- **型安全性**: namespaceベースの型定義での完全なTypeScriptサポート
- **グローバルアクセス**: GAS環境で全機能がグローバルに利用可能
- **複雑性削減**: 基本的な使用にモジュールシステムやバンドルの理解不要
- **IDEサポート**: TypeScript namespace宣言での優れた自動補完とIntelliSense

## 🎯 ベストプラクティス

### エラーハンドリング
- `ErrorTypes.d.ts`から型付きエラーコードを使用
- ドメイン固有エラーには`Shared.DomainError`を継承
- 構造化されたコンテキストでエラーをログ

### テスト
- モックオブジェクトには`TestHelpers.Doubles`を使用
- ユニットテスト（Node.js）と統合テスト（GAS）の両方を記述
- エラー条件を明示的にテスト

### 型安全性
- 専用の`.d.ts`ファイルでインターフェースを定義
- エンティティIDにはブランド型を使用
- エラーコードにはユニオン型を活用

### パフォーマンス
- 高コストな操作には遅延読み込みを使用
- 適切なキャッシュ戦略を実装
- 可能な限り操作をバッチ処理

## 🚨 GAS環境上の注意事項

### import/export制限
Google Apps Scriptでは標準的なESモジュール（import/export）が使用できません:

```typescript
// ❌ GASでは使用不可
import { Repository } from './Repository'
export function createRepo() { /*...*/ }

// ✅ GASで使用可能（Namespace方式）
namespace MyApp {
    export function createRepo() {
        return Repository.Engine.create({ /*...*/ })
    }
}
```

### グローバルスコープ
- すべての関数とnamespaceはグローバルスコープで定義される
- 名前の衝突を避けるため適切なnamespace設計が重要
- `const`、`let`、`var`で宣言された変数はファイル間で共有される

### GASランタイム制限
- **実行時間制限**: 6分（通常スクリプト）、30分（カスタム関数）
- **メモリ制限**: 制限されたヒープサイズ
- **配列サイズ制限**: 大量データ処理時は注意
- **外部API呼び出し**: UrlFetchAppの使用制限

### トリガー制約
```typescript
// GASトリガーでの実行例
function onScheduledRun() {
    // EventSystemを使用したスケジュール実行
    const trigger = EventSystem.Trigger.create({ /*...*/ })
    trigger.run(new Date())
}
```

### デバッグとログ
```typescript
// GAS環境でのログ出力
const logger = new EventSystem.Adapters.GAS.GasLogger()
logger.info('処理開始', { userId: 'user123' })

// Stackdriverログへの出力
console.log('詳細ログ', { data: complexObject })
```

## ❓ よくある質問（FAQ）

### Q1: フレームワークを既存のGASプロジェクトに追加できますか？
**A:** はい、可能です。必要なモジュールを選択的にコピーするか、全体をデプロイできます。既存のコードとのname space衝突に注意してください。

### Q2: TypeScriptを知らなくても使用できますか？
**A:** 基本的な使用は可能ですが、TypeScriptの型安全性を活用するため学習をお勧めします。JavaScriptの知識があればTypeScriptの基本は習得しやすいです。

### Q3: Google Sheetsとの連携はどのように動作しますか？
**A:** Repository モジュールがSpreadsheetAPIを抽象化し、スキーマベースでデータの読み書きを行います。型安全性とバリデーションを提供します。

### Q4: Cronジョブの設定方法は？
**A:** EventSystemモジュールでCron形式でスケジュールを定義します:
```typescript
const job = {
    id: 'daily-task',
    handler: 'myFunction',
    cron: '0 9 * * *',  // 毎日午前9時
    enabled: true
}
```

### Q5: 大規模データの処理に適していますか？
**A:** GASの制限内（6分実行時間、メモリ制限）で効果的です。大量データはバッチ処理とチェックポイント機能を使用してください。

### Q6: 本番環境での使用に適していますか？
**A:** はい、以下を考慮してください:
- 適切なエラーハンドリング
- ログ記録とモニタリング
- GAS制限の理解
- バックアップ戦略

### Q7: 他のGASライブラリとの競合は？
**A:** Namespaceベースの設計により競合リスクは最小限ですが、同名の関数やnamespaceは避けてください。

### Q8: CI/CDパイプラインに組み込めますか？
**A:** Node.jsテストはCI/CDで実行可能です。GASデプロイには`clasp`コマンドを使用してください:
```bash
clasp push  # デプロイ
npm run test:node  # テスト実行
```

### Q9: モジュールの依存関係は？
**A:** 依存関係図:
```
Shared (基盤型) ← Repository ← EventSystem
                ← GasDI     ← Routing
                ← Locking   ← StringHelper
```

### Q10: パフォーマンスチューニングのコツは？
**A:** 
- バッチ操作の使用
- 不要なSheet読み書きの最小化
- 適切なキャッシュ戦略
- 長時間処理のチェックポイント分割

## 🤝 コントリビューションガイド

### 開発の流れ

1. **フォークとクローン**
   ```bash
   git fork <repository-url>
   git clone <your-fork-url>
   cd GasAppFramework
   ```

2. **開発環境のセットアップ**
   ```bash
   npm install
   npm run test:node  # テスト実行確認
   ```

3. **ブランチ作成とコーディング**
   ```bash
   git checkout -b feature/new-functionality
   # コーディング...
   ```

4. **テストの追加**
   - Node.jsテスト: `test_node/`に追加
   - GASテスト: `test/Modules/`に追加

5. **品質チェック**
   ```bash
   npm run lint      # ESLintチェック
   npm run test:node # テスト実行
   ```

### コーディング規約

1. **Namespaceパターンの遵守**
   ```typescript
   // ✅ 正しいパターン
   namespace MyModule.SubModule {
       export function doSomething() { /*...*/ }
   }
   
   // ❌ 避けるべきパターン
   export function doSomething() { /*...*/ }
   ```

2. **型定義の分離**
   - インターフェースは`.d.ts`ファイルに分離
   - 実装と型定義を明確に分ける

3. **JSDocコメント**
   ```typescript
   /**
    * リポジトリエンジンを作成します
    * @param config 設定オブジェクト
    * @returns リポジトリインスタンス
    */
   export function create(config: Config) { /*...*/ }
   ```

4. **エラーハンドリング**
   - `Shared.DomainError`を継承
   - 適切なエラーコードを使用
   - 構造化されたエラー情報

### テストガイドライン

1. **包括的なテスト**
   - 正常ケースとエラーケース
   - 境界値テスト
   - 統合テスト

2. **モックの使用**
   ```typescript
   // TestHelpersのモックを使用
   const mockStore = TestHelpers.Doubles.createMockStore()
   ```

3. **GAS固有テスト**
   - GAS APIの動作確認
   - ランタイム制限テスト

### プルリクエストガイドライン

1. **明確な説明**
   - 変更内容の要約
   - 影響範囲の説明
   - テスト結果

2. **小さな変更単位**
   - 1つのPRで1つの機能
   - レビューしやすいサイズ

3. **ドキュメント更新**
   - APIドキュメント更新
   - README更新（必要に応じて）

### レビュープロセス

1. **自動チェック**
   - CI/CDでのテスト実行
   - ESLintチェック
   - 型チェック

2. **コードレビュー**
   - コード品質確認
   - 設計パターン確認
   - GAS互換性確認

3. **統合テスト**
   - 既存機能への影響確認
   - パフォーマンステスト

## 📄 ライセンス

[ライセンス情報をここに追加してください]

## 🆘 サポート

問題、質問、コントリビューションについては:

1. **ドキュメント確認**
   - 既存のドキュメントとテストを確認
   - モジュール固有のREADMEファイルをレビュー
   - テストケースで使用例を確認

2. **Issue報告**
   - バグレポートや機能リクエストでIssueを開く
   - 再現手順の詳細を提供
   - 環境情報（GASバージョン、ブラウザなど）を含める

3. **コミュニティ**
   - ディスカッションでの質問
   - ベストプラクティスの共有

---

**フレームワークバージョン:** 1.0.0  
**GASランタイム:** V8 (ES2020)  
**TypeScript:** 5.x  
**Node.js:** 16+

---

**最終更新:** 2024年12月
**言語:** 日本語