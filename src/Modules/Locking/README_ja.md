# Locking モジュール

Google Apps Script アプリケーション向けの分散ロック機構。複数の実行コンテキスト間での並行制御とリソース同期を提供します。

## 機能

- **読み取り/書き込みロック**: 共有読み取りロックと排他的書き込みロックのサポート
- **トークンベースロック**: ロック識別と解放のための一意トークン
- **TTL期限切れ**: デッドロックを防ぐ自動ロック期限切れ
- **競合検出**: ロック競合と再試行の適切な処理
- **ストレージ抽象化**: プラガブルストレージバックエンド（PropertiesServiceなど）
- **ガベージコレクション**: 期限切れロックの自動クリーンアップ

## 主要API

### ロックエンジン作成
```typescript
// 依存関係付きロックエンジンの作成
const lockEngine = Locking.Engine.create({
    store: new Locking.Adapters.GAS.PropertiesStore(),
    clock: { now: () => new Date() },
    logger: console,
    namespace: 'myapp:'
})
```

### ロックの取得
```typescript
// 排他的書き込みロックの取得
const writeResult = lockEngine.acquire('resource-id', 'write', {
    owner: 'user123',
    ttlMs: 30000 // 30秒
})

if (writeResult.success) {
    try {
        // 排他的操作の実行
        console.log('ロックトークン:', writeResult.token)
        performCriticalOperation()
    } finally {
        // 必ずロックを解放
        lockEngine.release(writeResult.token!)
    }
}

// 共有読み取りロックの取得
const readResult = lockEngine.acquire('resource-id', 'read', {
    owner: 'user456',
    ttlMs: 10000 // 10秒
})

if (readResult.success) {
    try {
        // 読み取り操作の実行（複数読み取り者が許可される）
        const data = readResource()
        console.log('読み取りデータ:', data)
    } finally {
        lockEngine.release(readResult.token!)
    }
}
```

### ロック状態と管理
```typescript
// ロック状態の確認
const status = lockEngine.status('resource-id')
console.log('ロック中:', status.locked)
console.log('モード:', status.mode) // 'r' または 'w'
console.log('所有者:', status.owners)

// 全アクティブロックのリスト
const allLocks = lockEngine.listAll()
for (const [resourceId, info] of Object.entries(allLocks)) {
    console.log(`リソース: ${resourceId}, モード: ${info.mode}, 所有者: ${info.owners}`)
}

// 全ロックの強制解放（管理者操作）
lockEngine.releaseAll()
```

## 使用例

### クリティカルセクション保護
```typescript
async function updateSpreadsheetSafely(sheetId: string, data: any[]) {
    const lockEngine = Locking.Engine.create({
        store: new Locking.Adapters.GAS.PropertiesStore(),
        clock: { now: () => new Date() }
    })
    
    const lockResult = lockEngine.acquire(`sheet:${sheetId}`, 'write', {
        owner: Session.getActiveUser().getEmail(),
        ttlMs: 60000 // 1分
    })
    
    if (!lockResult.success) {
        throw new Error('スプレッドシートの書き込みロックを取得できませんでした')
    }
    
    try {
        // アトミックなスプレッドシート更新の実行
        const sheet = SpreadsheetApp.openById(sheetId)
        const range = sheet.getDataRange()
        range.setValues(data)
        
        console.log('スプレッドシートが正常に更新されました')
    } finally {
        lockEngine.release(lockResult.token!)
    }
}
```

### リーダー・ライターパターン
```typescript
class DataCache {
    private lockEngine: any
    private cacheKey: string
    
    constructor(cacheKey: string) {
        this.cacheKey = cacheKey
        this.lockEngine = Locking.Engine.create({
            store: new Locking.Adapters.GAS.PropertiesStore(),
            clock: { now: () => new Date() }
        })
    }
    
    // 複数の読み取り者が同時にデータにアクセス可能
    read(): any {
        const lockResult = this.lockEngine.acquire(this.cacheKey, 'read', {
            owner: 'reader',
            ttlMs: 30000
        })
        
        if (!lockResult.success) {
            throw new Error('読み取りロックを取得できませんでした')
        }
        
        try {
            const data = PropertiesService.getScriptProperties().getProperty(this.cacheKey)
            return data ? JSON.parse(data) : null
        } finally {
            this.lockEngine.release(lockResult.token!)
        }
    }
    
    // 排他的書き込みアクセス
    write(data: any): void {
        const lockResult = this.lockEngine.acquire(this.cacheKey, 'write', {
            owner: 'writer',
            ttlMs: 60000
        })
        
        if (!lockResult.success) {
            throw new Error('書き込みロックを取得できませんでした')
        }
        
        try {
            PropertiesService.getScriptProperties().setProperty(
                this.cacheKey,
                JSON.stringify(data)
            )
        } finally {
            this.lockEngine.release(lockResult.token!)
        }
    }
}

// 使用方法
const cache = new DataCache('user-data')

// 複数読み取り者が同時実行可能
const userData1 = cache.read()
const userData2 = cache.read()

// 書き込み者が排他的アクセスを取得
cache.write({ users: [...] })
```

### 指数バックオフ付き再試行
```typescript
function acquireLockWithRetry(resourceId: string, mode: 'read' | 'write', maxRetries = 5) {
    const lockEngine = Locking.Engine.create({
        store: new Locking.Adapters.GAS.PropertiesStore(),
        clock: { now: () => new Date() }
    })
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
        const result = lockEngine.acquire(resourceId, mode, {
            owner: 'service',
            ttlMs: 30000
        })
        
        if (result.success) {
            return result.token!
        }
        
        // 指数バックオフ
        const delayMs = Math.min(1000 * Math.pow(2, attempt), 10000)
        console.log(`ロック取得失敗、${delayMs}ms後に再試行...`)
        Utilities.sleep(delayMs)
    }
    
    throw new Error(`${maxRetries}回の試行後に${mode}ロックの取得に失敗しました`)
}

// 使用方法
try {
    const token = acquireLockWithRetry('critical-resource', 'write')
    try {
        // クリティカル操作の実行
    } finally {
        lockEngine.release(token)
    }
} catch (error) {
    console.error('ロックを取得できませんでした:', error.message)
}
```

### ロック監視と診断
```typescript
class LockMonitor {
    private lockEngine: any
    
    constructor() {
        this.lockEngine = Locking.Engine.create({
            store: new Locking.Adapters.GAS.PropertiesStore(),
            clock: { now: () => new Date() },
            logger: console
        })
    }
    
    // アプリケーション全体のロック使用状況を監視
    reportLockStatus(): void {
        const allLocks = this.lockEngine.listAll()
        const lockCount = Object.keys(allLocks).length
        
        console.log(`総アクティブロック数: ${lockCount}`)
        
        for (const [resourceId, info] of Object.entries(allLocks)) {
            console.log(`リソース: ${resourceId}`)
            console.log(`  モード: ${info.mode}`)
            console.log(`  所有者: ${info.owners.join(', ')}`)
            console.log(`  エントリ数: ${info.count}`)
        }
    }
    
    // スタックしたロックのクリーンアップ（管理者機能）
    cleanupStaleLocks(): void {
        console.log('古いロックをクリーンアップ中...')
        this.lockEngine.releaseAll()
        console.log('全ロックが解放されました')
    }
    
    // リソースが利用可能かチェック
    isResourceAvailable(resourceId: string, mode: 'read' | 'write'): boolean {
        const status = this.lockEngine.status(resourceId)
        
        if (!status.locked) {
            return true // ロックなし、利用可能
        }
        
        if (mode === 'read' && status.mode === 'r') {
            return true // 読み取りロック要求、読み取りロック存在（共有）
        }
        
        return false // 書き込みロック存在または任意のロック付き書き込みロック要求
    }
}
```

## テスト戦略

### 単体テスト (Node.js)
```typescript
describe('Locking Engine', () => {
    let lockEngine: any
    let mockStore: any
    let mockClock: any
    
    beforeEach(() => {
        mockStore = {
            get: jest.fn(),
            set: jest.fn()
        }
        
        mockClock = {
            now: jest.fn().mockReturnValue(new Date('2023-01-01T00:00:00Z'))
        }
        
        lockEngine = Locking.Engine.create({
            store: mockStore,
            clock: mockClock
        })
    })
    
    test('書き込みロックを正常に取得できること', () => {
        mockStore.get.mockReturnValue(null) // 既存ロックなし
        
        const result = lockEngine.acquire('resource1', 'write', {
            owner: 'user1',
            ttlMs: 30000
        })
        
        expect(result.success).toBe(true)
        expect(result.token).toBeDefined()
        expect(mockStore.set).toHaveBeenCalled()
    })
    
    test('複数読み取りロックを許可すること', () => {
        // 最初の読み取りロック
        mockStore.get.mockReturnValue(null)
        const result1 = lockEngine.acquire('resource1', 'read', { owner: 'user1' })
        expect(result1.success).toBe(true)
        
        // 同じリソースの2番目の読み取りロック
        mockStore.get.mockReturnValue(JSON.stringify({
            version: 1,
            entries: [{
                token: result1.token,
                owner: 'user1',
                mode: 'r',
                expireMs: Date.now() + 30000
            }]
        }))
        
        const result2 = lockEngine.acquire('resource1', 'read', { owner: 'user2' })
        expect(result2.success).toBe(true)
    })
    
    test('読み取りロック存在時に書き込みロックを拒否すること', () => {
        mockStore.get.mockReturnValue(JSON.stringify({
            version: 1,
            entries: [{
                token: 'existing-read-token',
                owner: 'user1',
                mode: 'r',
                expireMs: Date.now() + 30000
            }]
        }))
        
        const result = lockEngine.acquire('resource1', 'write', { owner: 'user2' })
        expect(result.success).toBe(false)
    })
})
```

### 統合テスト (GAS)
```typescript
function test_LockingWithPropertiesService() {
    const lockEngine = Locking.Engine.create({
        store: new Locking.Adapters.GAS.PropertiesStore(),
        clock: { now: () => new Date() }
    })
    
    // ロック取得と解放のテスト
    const token = lockEngine.acquire('test-resource', 'write', {
        owner: 'test-user',
        ttlMs: 30000
    })
    
    if (token.success) {
        console.log('書き込みロック取得:', token.token)
        
        // ロック状態の確認
        const status = lockEngine.status('test-resource')
        console.log('ロック状態:', status)
        
        // ロック解放
        const released = lockEngine.release(token.token!)
        console.log('ロック解放:', released)
    } else {
        console.log('ロック取得に失敗しました')
    }
}
```

### 並行テスト
```typescript
test('同時ロック取得を適切に処理できること', async () => {
    const lockEngine = Locking.Engine.create({
        store: new MockConcurrentStore(),
        clock: { now: () => new Date() }
    })
    
    const promises = []
    
    // 同じロックを同時に取得を試行
    for (let i = 0; i < 10; i++) {
        promises.push(
            lockEngine.acquire('resource1', 'write', { owner: `user${i}` })
        )
    }
    
    const results = await Promise.all(promises)
    const successful = results.filter(r => r.success)
    
    // 1つだけが成功すべき
    expect(successful).toHaveLength(1)
})
```

## 設定

### ロックモード
- **Read ('r')**: 共有ロック、複数読み取り者許可
- **Write ('w')**: 排他ロック、単一書き込み者のみ

### TTLと期限切れ
- デフォルトTTL: 30秒
- 期限切れロックの自動ガベージコレクション
- クラッシュしたプロセスからのデッドロック防止

### ストレージバックエンド
- **PropertiesService**: デフォルトGASストレージ
- **Memory**: テストと開発用
- **Custom**: `Locking.Ports.Store` インターフェース実装

### ベストプラクティス
- ロック解放を確実にするためtry/finallyブロックを常に使用
- 使用ケースに適切なTTL値を設定
- 読み取り専用操作には読み取りロックを使用
- 指数バックオフによる再試行ロジックを実装
- 本番環境でロック使用状況を監視