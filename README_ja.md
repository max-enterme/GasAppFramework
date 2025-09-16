# GAS App Framework

Google Apps Script (GAS) アプリケーション用の包括的な TypeScript フレームワークです。モジュラーアーキテクチャ、依存性注入、イベントシステム、および堅牢なテストインフラストラクチャを提供します。

## 🏗️ アーキテクチャ概要

```
GasAppFramework/
├── src/
│   ├── Modules/           # コア機能モジュール
│   │   ├── EventSystem/   # Cronジョブ、トリガー、ワークフロー
│   │   ├── GasDI/         # 依存性注入コンテナ
│   │   ├── Locking/       # 分散ロック機構
│   │   ├── Repository/    # データ永続化抽象化
│   │   ├── Routing/       # URLルーティングとリクエスト処理
│   │   └── StringHelper/  # 文字列テンプレートとユーティリティ
│   └── Shared/            # 共通タイプ、エラー、ユーティリティ
│       ├── CommonTypes.d.ts    # 共有インターフェース (Logger, Clock等)
│       ├── ErrorTypes.d.ts     # エラータイプ定義
│       ├── Errors.ts           # ベースエラークラス
│       └── Time.ts             # 時間ユーティリティ
└── test/                  # GAS互換テストフレームワーク
    ├── _framework/        # GAS用カスタムテストランナーとヘルパー
    │   └── TestHelpers.ts      # テストダブルとユーティリティ
    └── Modules/           # モジュール固有のテスト
```

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

## 📦 モジュールダウンロード & デプロイ

### 個別モジュールダウンロード

各モジュールは独立してダウンロード・使用できます:

```bash
# Repository モジュールのみダウンロード
curl -O https://github.com/max-enterme/GasAppFramework/raw/main/src/Modules/Repository/
```

### デプロイ方法

#### オプション1: フルフレームワーク

```bash
# 全モジュールをデプロイ
clasp push
```

#### オプション2: 選択的モジュール

`.claspignore` を編集して必要なモジュールのみを含める:

```
# .claspignore
src/Modules/EventSystem/**
src/Modules/Locking/**
# 必要に応じて他のモジュールを除外
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

## 🏛️ モジュール説明

### Repository モジュール
Google Sheetsバックエンドでタイプセーフなデータ永続化を提供。

**主要機能:**
- スキーマベースのエンティティ検証
- 複雑なキー用のキーエンコーディング/デコーディング
- 変更追跡付きのupsert操作
- メモリとスプレッドシートアダプター

**使用例:**
```typescript
// エンティティスキーマを定義
const userSchema: Repository.Ports.Schema<User, 'id'> = {
    parameters: ['id', 'name', 'email'],
    keyParameters: ['id'],
    instantiate: () => ({ id: '', name: '', email: '' }),
    fromPartial: (p) => ({ id: p.id || '', name: p.name || '', email: p.email || '' })
}

// リポジトリを作成
const userRepo = Repository.Engine.create({
    schema: userSchema,
    store: new Repository.Adapters.GAS.Spreadsheet.Store('your-sheet-id'),
    keyCodec: Repository.Codec.simple()
})

// リポジトリを使用
userRepo.load()
userRepo.upsert({ id: 'user1', name: 'John', email: 'john@example.com' })
const user = userRepo.find({ id: 'user1' })
```

### EventSystem モジュール
時間ベースのトリガー、ワークフロー、非同期ジョブ処理。

**主要機能:**
- Cronスタイルのスケジューリング
- ワークフロー管理
- GASトリガー統合
- 分散ジョブキュー

**使用例:**
```typescript
// 毎日のレポートスケジュールを作成
EventSystem.Schedule.cron('0 9 * * *', () => {
    // 毎日午前9時に実行される処理
    generateDailyReport()
})

// ワークフローを定義
const workflow = EventSystem.Workflow.create([
    { name: 'validate', handler: validateData },
    { name: 'process', handler: processData },
    { name: 'notify', handler: sendNotification }
])
```

### GasDI モジュール
コンポーネントライフサイクル管理用の依存性注入コンテナ。

**使用例:**
```typescript
// サービスを登録
GasDI.Root.registerValue('config', { apiKey: 'secret' })
GasDI.Root.registerFactory('logger', () => new ConsoleLogger(), 'singleton')

// 注入用デコレーターを使用
@GasDI.Decorators.Resolve()
class UserService {
    constructor(
        @GasDI.Decorators.Inject('logger') private logger: Logger,
        @GasDI.Decorators.Inject('config') private config: Config
    ) {}
}
```

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
2. モジュール固有のREADMEファイルを確認
3. 使用例についてテストケースを調査
4. バグや機能リクエストはissueを開いてください

---

**フレームワークバージョン:** 1.0.0  
**GASランタイム:** V8 (ES2020)  
**TypeScript:** 5.x  
**Node.js:** 16+