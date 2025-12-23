# GasAppFramework 依存性注入（DI）ガイド

このドキュメントは、GasAppFramework全体で使用される依存性注入パターンに関する包括的なガイダンスを提供します。DIをいつどのように使用するか、および必須コンポーネントとオプションコンポーネントの違いについて説明します。

## 目次

1. [概要](#概要)
2. [DIアーキテクチャ](#diアーキテクチャ)
3. [必須コンポーネント vs オプションコンポーネント](#必須コンポーネント-vs-オプションコンポーネント)
4. [GasDIコンテナの使用](#gasdiコンテナの使用)
5. [フレームワークモジュールのDIパターン](#フレームワークモジュールのdiパターン)
6. [ベストプラクティス](#ベストプラクティス)
7. [共通パターン](#共通パターン)
8. [DIを使用したテスト](#diを使用したテスト)

## 概要

GasAppFrameworkは、依存性注入コンテナとして**GasDI**（Google Apps Script Dependency Injection）を使用します。DIにより以下が可能になります：

- **疎結合**: コンポーネントは具体的な実装ではなく抽象に依存
- **テスト可能性**: テストで依存関係を簡単にモック化
- **柔軟性**: クライアントコードを変更せずに実装を交換
- **ライフサイクル管理**: 依存関係の作成タイミングと方法を制御

## DIアーキテクチャ

### コアDIコンポーネント

```
GasDI モジュール
├── Container          # 依存関係の登録と解決のためのIoCコンテナ
├── Decorators         # 自動依存関係解決のための@Resolve()デコレータ
├── Root              # グローバルシングルトンコンテナインスタンス
└── Types             # トークンタイプとインターフェース
```

### コンテナライフタイム

GasDIは3つの依存関係ライフタイムをサポートします：

1. **Singleton**: アプリケーション全体の存続期間で1つのインスタンス
   ```typescript
   container.registerFactory('logger', () => new Logger(), 'singleton')
   ```

2. **Scoped**: スコープごとに1つのインスタンス（例：HTTPリクエストごと）
   ```typescript
   container.registerFactory('requestContext', () => new RequestContext(), 'scoped')
   ```

3. **Transient**: 解決されるたびに新しいインスタンス
   ```typescript
   container.registerFactory('validator', () => new Validator(), 'transient')
   ```

## 必須コンポーネント vs オプションコンポーネント

必須コンポーネントとオプションコンポーネントの違いを理解することは、フレームワークの適切な使用にとって重要です。

### 必須コンポーネント

**定義**: フレームワークが正常に機能するために必要なコンポーネント。

**特徴**:
- 開発者が提供する必要がある
- これらなしではフレームワークは動作できない
- 通常、コンストラクタで直接渡される
- `interfaces/`ディレクトリに配置

**RestFrameworkの例**:
- `RequestMapper`: 生の入力を型付きリクエストにマップ
- `ResponseMapper`: ビジネス結果をAPIレスポンスにマップ
- `ApiLogic`: コアビジネスロジックを含む

**使用パターン**:
```typescript
class MyController extends RestFramework.ApiController<MyRequest, MyResponse> {
    constructor() {
        super(
            new MyRequestMapper(),      // 必須 - 直接インスタンス化
            new MyResponseMapper(),     // 必須 - 直接インスタンス化
            new MyApiLogic()            // 必須 - 直接インスタンス化
        );
    }
}
```

### オプションコンポーネント

**定義**: 機能を拡張するが基本操作には必須ではないコンポーネント。

**特徴**:
- これらなしでもフレームワークは動作する
- DIコンテナを介して注入される
- 高度な機能を有効にする（検証、認証、ミドルウェア、ログ）
- `optional-utilities/`ディレクトリに配置

**RestFrameworkの例**:
- `RequestValidator`: 入力検証
- `AuthService`: 認証と認可
- `MiddlewareManager`: リクエスト/レスポンスパイプライン
- `Logger`: ログ機能
- `ErrorHandler`: エラーフォーマット

**使用パターン**:
```typescript
class MyController extends RestFramework.ApiController<MyRequest, MyResponse> {
    constructor() {
        super(
            new MyRequestMapper(),
            new MyResponseMapper(),
            new MyApiLogic(),
            GasDI.Root.resolve('requestValidator', { optional: true }),  // DI経由でオプション
            GasDI.Root.resolve('authService', { optional: true }),       // DI経由でオプション
            GasDI.Root.resolve('middlewareManager', { optional: true }), // DI経由でオプション
            GasDI.Root.resolve('logger', { optional: true }),            // DI経由でオプション
            GasDI.Root.resolve('errorHandler', { optional: true })       // DI経由でオプション
        );
    }
}
```

### 比較表

| 側面 | 必須コンポーネント | オプションコンポーネント |
|--------|---------------------|-------------------|
| **必須性** | はい | いいえ |
| **注入方法** | 直接インスタンス化 | DIコンテナ解決 |
| **場所** | `interfaces/` | `optional-utilities/` |
| **目的** | コア機能 | 機能拡張 |
| **これなしの動作** | 動作不可 | 機能低下で動作 |
| **例** | RequestMapper, ResponseMapper, ApiLogic | RequestValidator, AuthService, MiddlewareManager |

## GasDIコンテナの使用

### 基本的な登録と解決

```typescript
// コンテナインスタンスを作成（またはグローバルRootを使用）
const container = new GasDI.Container();

// 値を登録（デフォルトでシングルトン）
container.registerValue('config', {
    apiUrl: 'https://api.example.com',
    timeout: 5000
});

// ファクトリを登録
container.registerFactory('logger', () => {
    return new CustomLogger('[MyApp]');
}, 'singleton');

// クラスを登録
container.registerClass('userService', UserService, 'scoped');

// 依存関係を解決
const config = container.resolve('config');
const logger = container.resolve('logger');
const userService = container.resolve('userService');
```

### グローバルコンテナ（GasDI.Root）

フレームワークは、アプリケーション全体の依存関係用のグローバルシングルトンコンテナを提供します：

```typescript
// アプリケーション初期化時に登録
function initializeApp() {
    GasDI.Root.registerValue('logger', RestFramework.Logger.create('[API]'));
    GasDI.Root.registerValue('authService', new MyAuthService());
    GasDI.Root.registerValue('requestValidator', new MyValidator());
}

// アプリケーションのどこでも解決
const logger = GasDI.Root.resolve('logger');
```

### オプション解決

依存関係が登録されていない可能性がある場合は、オプション解決を使用します：

```typescript
// 登録されていない場合はundefinedを返す
const optionalService = container.resolve('optionalService', { optional: true });

if (optionalService) {
    optionalService.doSomething();
} else {
    // フォールバック動作
    console.log('オプションサービスは利用できません');
}
```

### 型付きトークン

コンパイル時の型安全性のためにブランド型を使用します：

```typescript
// 型付きトークンを定義
const TOKENS = {
    LOGGER: 'logger' as GasDI.Ports.Token<Shared.Types.Logger>,
    AUTH_SERVICE: 'authService' as GasDI.Ports.Token<RestFramework.Types.AuthService>,
    CONFIG: 'config' as GasDI.Ports.Token<AppConfig>
};

// トークンで登録
GasDI.Root.registerValue(TOKENS.LOGGER, new Logger());

// 型安全性を持って解決
const logger: Shared.Types.Logger = GasDI.Root.resolve(TOKENS.LOGGER);
```

## フレームワークモジュールのDIパターン

### RestFramework

**DI有効化コンポーネント**:
- `Logger`: ログサービス（オプション）
- `ErrorHandler`: エラーフォーマット（オプション）
- `RequestValidator`: 入力検証（オプション）
- `AuthService`: 認証/認可（オプション）
- `MiddlewareManager`: リクエストパイプライン（オプション）

**登録例**:
```typescript
// オプションサービスをセットアップ
GasDI.Root.registerValue('logger', RestFramework.Logger.create('[MyAPI]'));
GasDI.Root.registerValue('requestValidator', new MyRequestValidator());
GasDI.Root.registerValue('authService', new MyAuthService());
```

### Repositoryモジュール

**DI有効化コンポーネント**:
- `Store`: データストレージバックエンド（コンストラクタまたはDI経由で必須）
- `KeyCodec`: キーエンコーディング戦略（コンストラクタまたはDI経由で必須）
- `Logger`: ログ（オプション）

**パターン**:
```typescript
// 直接インスタンス化（一般的なパターン）
const repo = Repository.Engine.create({
    schema: mySchema,
    store: Repository.Adapters.GAS.SpreadsheetStore.create(spreadsheetId),
    keyCodec: Repository.Codec.simple('|')
});

// またはDI経由
GasDI.Root.registerValue('dataStore', myStore);
GasDI.Root.registerValue('keyCodec', myCodec);
```

### EventSystemモジュール

**DI有効化コンポーネント**:
- `JobStore`: ジョブ永続化（必須）
- `GlobalInvoker`: 関数実行（必須）
- `Logger`: ログ（オプション）
- `Clock`: 時間操作（オプション）

### GasDIモジュール

**自己完結型**: GasDI自体がDIシステムであるため、DIを必要としません。

### Lockingモジュール

**DI有効化コンポーネント**:
- `LockService`: ロックプロバイダー（必須）
- `Logger`: ログ（オプション）

## ベストプラクティス

### 1. アプリケーションレベルの依存関係にグローバルコンテナを使用

```typescript
// ✅ 良い例: グローバルコンテナのアプリケーションレベルサービス
function setupApplication() {
    GasDI.Root.registerValue('logger', createLogger());
    GasDI.Root.registerValue('config', loadConfig());
}

// ❌ 悪い例: あちこちで新しいコンテナを作成
function myFunction() {
    const container = new GasDI.Container(); // 複数のコンテナを作成しない
    container.registerValue('logger', new Logger());
}
```

### 2. アプリケーション起動時に依存関係を登録

```typescript
// ✅ 良い例: 一元化された初期化
function onOpen() {
    initializeServices();
}

function initializeServices() {
    // すべてのサービスを一度登録
    GasDI.Root.registerValue('logger', RestFramework.Logger.create());
    GasDI.Root.registerValue('authService', new AuthService());
    GasDI.Root.registerValue('requestValidator', new RequestValidator());
}

// ❌ 悪い例: 複数の場所で登録
function handleRequest() {
    GasDI.Root.registerValue('logger', new Logger()); // リクエストごとに登録しない
}
```

### 3. 本当にオプションのサービスにオプション解決を使用

```typescript
// ✅ 良い例: フォールバック付きオプションサービス
const logger = GasDI.Root.resolve('logger', { optional: true }) || createDefaultLogger();

// ✅ 良い例: サービスが存在するか確認
const authService = GasDI.Root.resolve('authService', { optional: true });
if (authService) {
    authService.authenticate(token);
}

// ❌ 悪い例: 必須サービスをオプションとして（静かに失敗）
const requestMapper = GasDI.Root.resolve('requestMapper', { optional: true }); // 必須であるべき！
```

### 4. 適切なライフタイムを選択

```typescript
// ✅ 良い例: ステートレスサービスにシングルトン
GasDI.Root.registerFactory('logger', () => new Logger(), 'singleton');

// ✅ 良い例: リクエスト固有データにスコープ
requestScope.registerFactory('requestId', () => generateId(), 'scoped');

// ✅ 良い例: ステートフルな操作にトランジェント
container.registerFactory('validator', () => new Validator(), 'transient');

// ❌ 悪い例: ステートフルオブジェクトにシングルトン（バグの原因）
container.registerFactory('requestContext', () => new RequestContext(), 'singleton');
```

### 5. 型安全性のために型付きトークンを使用

```typescript
// ✅ 良い例: 型安全なトークン
interface AppConfig {
    apiUrl: string;
}

const CONFIG_TOKEN = 'config' as GasDI.Ports.Token<AppConfig>;
GasDI.Root.registerValue(CONFIG_TOKEN, { apiUrl: 'https://api.example.com' });
const config: AppConfig = GasDI.Root.resolve(CONFIG_TOKEN);

// ❌ 悪い例: 型なし文字列（型安全性を失う）
const config = GasDI.Root.resolve('config'); // 型は'any'
```

## 共通パターン

### パターン1: オプション機能のサービスロケーター

```typescript
class MyController {
    private logger?: Shared.Types.Logger;
    
    constructor() {
        // オプションのロガーサービスを見つける
        this.logger = GasDI.Root.resolve('logger', { optional: true });
    }
    
    execute() {
        this.logger?.info('コントローラーを実行中');
        // メインロジックはロガーに依存しない
    }
}
```

### パターン2: リクエスト処理用のスコープコンテナ

```typescript
function handleRequest(e: any) {
    // リクエストスコープのコンテナを作成
    const requestScope = GasDI.Root.createScope('request');
    
    // リクエスト固有のデータを登録
    requestScope.registerValue('requestId', generateRequestId());
    requestScope.registerValue('currentUser', extractUser(e));
    
    // スコープ依存関係を使用
    const controller = new MyController(requestScope);
    return controller.handle(e);
}
```

### パターン3: DIを使用したファクトリパターン

```typescript
// DIに登録されたファクトリ
GasDI.Root.registerFactory('userRepository', () => {
    const store = GasDI.Root.resolve('dataStore');
    const logger = GasDI.Root.resolve('logger', { optional: true });
    
    return Repository.Engine.create({
        schema: userSchema,
        store: store,
        keyCodec: Repository.Codec.simple('|'),
        logger: logger
    });
}, 'singleton');

// 使用方法
const userRepo = GasDI.Root.resolve('userRepository');
```

## DIを使用したテスト

### テストでの依存関係のモック化

```typescript
describe('MyController', () => {
    beforeEach(() => {
        // テストダブルを登録
        GasDI.Root.registerValue('logger', {
            info: jest.fn(),
            error: jest.fn()
        });
        
        GasDI.Root.registerValue('authService', {
            authenticate: jest.fn(() => ({ isAuthenticated: true, user: { id: 'test' } })),
            authorize: jest.fn(() => true)
        });
    });
    
    afterEach(() => {
        // クリーンアップ（必要に応じて）
        // 注意: GasDIには組み込みのクリーンアップがないため、テスト分離戦略を検討
    });
    
    it('注入されたサービスを使用すべき', () => {
        const controller = new MyController();
        controller.execute();
        
        const logger = GasDI.Root.resolve('logger');
        expect(logger.info).toHaveBeenCalled();
    });
});
```

### テスト分離

```typescript
// オプション1: テストに別のコンテナを使用
describe('MyTest', () => {
    let testContainer: GasDI.Container;
    
    beforeEach(() => {
        testContainer = new GasDI.Container();
        testContainer.registerValue('logger', mockLogger);
    });
});

// オプション2: グローバルコンテナをリセット（注意して使用）
describe('MyTest', () => {
    const originalServices = {};
    
    beforeAll(() => {
        // 必要に応じて元の登録を保存
    });
    
    afterAll(() => {
        // 元の登録を復元
    });
});
```

## まとめ

**重要なポイント**:

1. **必須コンポーネント**は直接渡され、**オプションコンポーネント**はDIを使用
2. アプリケーションレベルの依存関係には**GasDI.Root**を使用
3. サービスを**起動時に一度**登録し、リクエストごとではない
4. 本当にオプションのサービスには**オプション解決**（`{ optional: true }`）を使用
5. 適切な**ライフタイム**（singleton、scoped、transient）を選択
6. コンパイル時の型安全性のために**型付きトークン**を使用
7. DIコンテナにテストダブルを登録して**モックでテスト**

**関連ドキュメント**:
- [GasDIモジュールREADME](src/Modules/GasDI/README_ja.md)
- [RestFrameworkオプショナルユーティリティ](src/RestFramework/optional-utilities/README_ja.md)
- [RestFramework使用例](src/RestFramework/examples/README_ja.md)

**サポートが必要ですか？**
- 使用例については[GasDIテスト](test/Modules/GasDI/)を確認
- DIパターンについては[RestFrameworkテスト](test_node/restframework/)を確認
- モジュール固有のDIパターンについては各モジュールのREADMEを参照
