# GasDI モジュール

Google Apps Script アプリケーション向けの軽量依存性注入コンテナ。複数のライフタイム管理戦略と階層的依存性解決をサポートします。

## 機能

- **複数ライフタイム**: シングルトン、スコープ付き、一時的な依存性ライフタイム
- **型安全性**: コンパイル時型安全性のためのブランド型トークン
- **階層的解決**: 親子コンテナ関係
- **ファクトリ登録**: ファクトリ関数とクラスコンストラクタのサポート
- **柔軟なスコープ**: リクエストレベル依存性のためのスコープ付きコンテナ作成
- **オプション依存性**: 不足している依存性の適切な処理

## 主要API

### コンテナ作成と登録
```typescript
// コンテナ作成
const container = new GasDI.Container()

// 値の登録
container.registerValue('config', { apiKey: 'abc123', timeout: 5000 })

// ファクトリ関数の登録
container.registerFactory('logger', () => console, 'singleton')

// クラスの登録
container.registerClass('userService', UserService, 'scoped')

// カスタムファクトリの登録
container.registerFactory('database', () => {
    return new DatabaseConnection(process.env.DB_URL)
}, 'singleton')
```

### 依存性解決
```typescript
// 依存性の解決
const config = container.resolve('config')
const logger = container.resolve('logger') 
const userService = container.resolve('userService')

// オプション解決
const optionalService = container.resolve('optionalService', { optional: true })
if (optionalService) {
    // 利用可能な場合はサービスを使用
}
```

### スコープ付きコンテナ
```typescript
// リクエスト処理用スコープ付きコンテナの作成
const requestScope = container.createScope('request-123')

// リクエスト固有の依存性を登録
requestScope.registerValue('requestId', 'req-123')
requestScope.registerValue('currentUser', { id: 'user1', name: 'John' })

// スコープ内で解決
const requestId = requestScope.resolve('requestId')
const currentUser = requestScope.resolve('currentUser')

// 完了時のスコープクリーンアップ
// (requestScopeがスコープ外になると自動ガベージコレクション)
```

## 使用例

### 基本的なサービス登録
```typescript
// 型安全性のためのトークン定義
const TOKENS = {
    CONFIG: 'config' as GasDI.Ports.Token<AppConfig>,
    LOGGER: 'logger' as GasDI.Ports.Token<Logger>,
    USER_SERVICE: 'userService' as GasDI.Ports.Token<UserService>,
    SPREADSHEET_SERVICE: 'spreadsheetService' as GasDI.Ports.Token<SpreadsheetService>
}

interface AppConfig {
    spreadsheetId: string
    environment: 'dev' | 'prod'
}

interface Logger {
    info(msg: string): void
    error(msg: string): void
}

class UserService {
    constructor(
        private config: AppConfig,
        private logger: Logger,
        private spreadsheetService: SpreadsheetService
    ) {}
    
    findUser(id: string) {
        this.logger.info(`ユーザー検索中: ${id}`)
        return this.spreadsheetService.getUser(id)
    }
}

// コンテナ設定
const container = new GasDI.Container()

container.registerValue(TOKENS.CONFIG, {
    spreadsheetId: 'your-sheet-id',
    environment: 'prod'
})

container.registerFactory(TOKENS.LOGGER, () => ({
    info: (msg: string) => console.log(msg),
    error: (msg: string) => console.error(msg)
}), 'singleton')

container.registerFactory(TOKENS.SPREADSHEET_SERVICE, () => {
    const config = container.resolve(TOKENS.CONFIG)
    return new SpreadsheetService(config.spreadsheetId)
}, 'singleton')

container.registerFactory(TOKENS.USER_SERVICE, () => {
    return new UserService(
        container.resolve(TOKENS.CONFIG),
        container.resolve(TOKENS.LOGGER),
        container.resolve(TOKENS.SPREADSHEET_SERVICE)
    )
}, 'scoped')
```

### リクエストスコープ付きGAS Webアプリ
```typescript
// グローバルコンテナ設定
const globalContainer = new GasDI.Container()
globalContainer.registerValue(TOKENS.CONFIG, { /* グローバル設定 */ })
globalContainer.registerFactory(TOKENS.LOGGER, () => console, 'singleton')

// Webアプリエントリーポイント
function doGet(e: GoogleAppsScript.Events.DoGet) {
    // リクエストスコープ作成
    const requestContainer = globalContainer.createScope(`request-${Date.now()}`)
    
    // リクエスト固有データの登録
    requestContainer.registerValue('requestParams', e.parameter)
    requestContainer.registerValue('requestUrl', e.url)
    
    // このリクエスト用サービスの解決
    const userService = requestContainer.resolve(TOKENS.USER_SERVICE)
    const logger = requestContainer.resolve(TOKENS.LOGGER)
    
    try {
        const result = handleRequest(userService, e.parameter)
        return ContentService.createTextOutput(JSON.stringify(result))
    } catch (error) {
        logger.error(`リクエスト失敗: ${error.message}`)
        return ContentService.createTextOutput('Error')
    }
}
```

### 階層コンテナ設定
```typescript
// 共有サービス用親コンテナ
const appContainer = new GasDI.Container()
appContainer.registerFactory(TOKENS.LOGGER, () => console, 'singleton')
appContainer.registerValue(TOKENS.CONFIG, globalConfig)

// モジュール固有サービス用子コンテナ
const moduleContainer = new GasDI.Container(appContainer)
moduleContainer.registerFactory('moduleService', () => new ModuleService(), 'singleton')

// 子は親の依存性を解決可能
const logger = moduleContainer.resolve(TOKENS.LOGGER) // 親から解決
const moduleService = moduleContainer.resolve('moduleService') // 子から解決
```

## テスト戦略

### 単体テスト (Node.js)
```typescript
describe('GasDI Container', () => {
    let container: GasDI.Container
    
    beforeEach(() => {
        container = new GasDI.Container()
    })
    
    test('値を登録して解決できること', () => {
        container.registerValue('test', 'value')
        expect(container.resolve('test')).toBe('value')
    })
    
    test('シングルトンライフタイムをサポートすること', () => {
        let callCount = 0
        container.registerFactory('service', () => {
            callCount++
            return { id: callCount }
        }, 'singleton')
        
        const instance1 = container.resolve('service')
        const instance2 = container.resolve('service')
        
        expect(instance1).toBe(instance2)
        expect(callCount).toBe(1)
    })
    
    test('スコープ付きコンテナをサポートすること', () => {
        const scope1 = container.createScope('scope1')
        const scope2 = container.createScope('scope2')
        
        scope1.registerValue('data', 'scope1-data')
        scope2.registerValue('data', 'scope2-data')
        
        expect(scope1.resolve('data')).toBe('scope1-data')
        expect(scope2.resolve('data')).toBe('scope2-data')
    })
})
```

### 統合テスト (GAS)
```typescript
function test_DIContainer() {
    const container = new GasDI.Container()
    
    // 実際のGASサービスでのテスト
    container.registerFactory('spreadsheetService', () => {
        return SpreadsheetApp.openById('test-sheet-id')
    }, 'singleton')
    
    container.registerFactory('logger', () => {
        return {
            info: (msg: string) => Logger.log(`INFO: ${msg}`),
            error: (msg: string) => Logger.log(`ERROR: ${msg}`)
        }
    }, 'singleton')
    
    const spreadsheet = container.resolve('spreadsheetService')
    const logger = container.resolve('logger')
    
    logger.info('DIコンテナテスト完了')
    console.log('スプレッドシート名:', spreadsheet.getName())
}
```

### テスト用モック依存性
```typescript
// DIを使ったテストダブル
function createTestContainer() {
    const container = new GasDI.Container()
    
    // モックロガー
    const mockLogger = {
        info: jest.fn(),
        error: jest.fn()
    }
    container.registerValue(TOKENS.LOGGER, mockLogger)
    
    // モック設定
    container.registerValue(TOKENS.CONFIG, {
        spreadsheetId: 'test-sheet',
        environment: 'test'
    })
    
    return { container, mockLogger }
}

test('サービスがロガーを正しく使用すること', () => {
    const { container, mockLogger } = createTestContainer()
    
    container.registerFactory(TOKENS.USER_SERVICE, () => {
        return new UserService(
            container.resolve(TOKENS.CONFIG),
            container.resolve(TOKENS.LOGGER),
            container.resolve(TOKENS.SPREADSHEET_SERVICE)
        )
    })
    
    const userService = container.resolve(TOKENS.USER_SERVICE)
    userService.findUser('test123')
    
    expect(mockLogger.info).toHaveBeenCalledWith('ユーザー検索中: test123')
})
```

## 設定

### ライフタイム管理
- **Singleton**: コンテナライフタイム全体で共有される単一インスタンス
- **Scoped**: スコープごとの単一インスタンス（リクエストレベルサービスに有用）
- **Transient**: 解決ごとに新しいインスタンスを作成

### ベストプラクティス
- 型安全性のためブランド型トークンを使用
- 高コストなサービスはシングルトンとして登録
- リクエスト固有データにはスコープライフタイムを使用
- コンテナ設定を別の設定モジュールに保持
- サービス間の循環依存を避ける

### パフォーマンス考慮事項
- シングルトンサービスはキャッシュされ再利用される
- スコープ付きサービスはスコープ内でキャッシュされる
- 一時的サービスにはキャッシュオーバーヘッドなし
- 親コンテナ検索は最小限のパフォーマンス影響