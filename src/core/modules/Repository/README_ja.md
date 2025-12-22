# Repository モジュール

Google Apps Script アプリケーション向けの型安全データ永続化抽象化。スキーマベースのエンティティ検証、キーエンコーディング/デコーディング、変更追跡付きアップサート操作を提供します。

## 機能

- **スキーマベース検証**: 型安全性を持つエンティティスキーマ定義
- **キーエンコーディング/デコーディング**: 複雑な複合キーの処理
- **複数ストレージバックエンド**: Google SheetsとインメモリアダプタThat
- **変更追跡**: エンティティ変更の追跡と更新の最適化
- **アップサート操作**: インテリジェントな挿入/更新操作
- **型安全性**: ブランド型による完全なTypeScriptサポート

## 主要API

### リポジトリ作成
```typescript
// エンティティスキーマの定義
const userSchema: Repository.Ports.Schema<User, 'id'> = {
    parameters: ['id', 'name', 'email', 'createdAt'],
    keyParameters: ['id'],
    instantiate: () => ({ id: '', name: '', email: '', createdAt: new Date() }),
    fromPartial: (p) => ({
        id: p.id || '',
        name: p.name || '',
        email: p.email || '',
        createdAt: p.createdAt || new Date()
    })
}

// Google Sheetsバックエンド付きリポジトリの作成
const userRepo = Repository.Engine.create({
    schema: userSchema,
    store: new Repository.Adapters.GAS.Spreadsheet.Store(SHEET_ID),
    keyCodec: Repository.Codec.simple()
})
```

### CRUD操作
```typescript
// 全エンティティの読み込み
userRepo.load()

// キーによるエンティティ検索
const user = userRepo.find({ id: 'user123' })

// アップサート（挿入または更新）
userRepo.upsert({ 
    id: 'user123', 
    name: 'John Doe', 
    email: 'john@example.com',
    createdAt: new Date()
})

// エンティティ削除
userRepo.delete({ id: 'user123' })

// 全エンティティ取得
const allUsers = userRepo.getAll()

// エンティティ存在確認
const exists = userRepo.has({ id: 'user123' })
```

### 変更追跡
```typescript
// 追跡された変更の取得
const changes = userRepo.getChanges()
console.log('追加:', changes.added.length)
console.log('更新:', changes.updated.length) 
console.log('削除:', changes.deleted.length)

// ストレージへの変更コミット
userRepo.commit()

// 未コミット変更のロールバック
userRepo.rollback()
```

## 使用例

### 基本的なエンティティ管理
```typescript
interface Product {
    id: string
    name: string
    price: number
    category: string
}

const productSchema: Repository.Ports.Schema<Product, 'id'> = {
    parameters: ['id', 'name', 'price', 'category'],
    keyParameters: ['id'],
    instantiate: () => ({ id: '', name: '', price: 0, category: '' }),
    fromPartial: (p) => ({
        id: p.id || '',
        name: p.name || '',
        price: p.price || 0,
        category: p.category || ''
    })
}

const productRepo = Repository.Engine.create({
    schema: productSchema,
    store: new Repository.Adapters.GAS.Spreadsheet.Store(PRODUCTS_SHEET_ID),
    keyCodec: Repository.Codec.simple()
})

// 商品追加
productRepo.upsert({ id: 'p1', name: 'ノートPC', price: 999, category: '電子機器' })
productRepo.upsert({ id: 'p2', name: 'マウス', price: 25, category: '電子機器' })

// 商品検索
const laptop = productRepo.find({ id: 'p1' })
const allProducts = productRepo.getAll()
```

### 複合キー
```typescript
interface OrderItem {
    orderId: string
    productId: string
    quantity: number
    price: number
}

const orderItemSchema: Repository.Ports.Schema<OrderItem, 'orderId' | 'productId'> = {
    parameters: ['orderId', 'productId', 'quantity', 'price'],
    keyParameters: ['orderId', 'productId'],
    instantiate: () => ({ orderId: '', productId: '', quantity: 0, price: 0 }),
    fromPartial: (p) => ({
        orderId: p.orderId || '',
        productId: p.productId || '',
        quantity: p.quantity || 0,
        price: p.price || 0
    })
}

const orderItemRepo = Repository.Engine.create({
    schema: orderItemSchema,
    store: new Repository.Adapters.GAS.Spreadsheet.Store(ORDER_ITEMS_SHEET_ID),
    keyCodec: Repository.Codec.simple('|') // カスタム区切り文字
})

// 複合キー付き注文アイテムの追加
orderItemRepo.upsert({ orderId: 'ord1', productId: 'p1', quantity: 2, price: 999 })

// 複合キーによる検索
const item = orderItemRepo.find({ orderId: 'ord1', productId: 'p1' })
```

### テスト用メモリアダプタ
```typescript
// 単体テスト用インメモリアダプタの使用
const testRepo = Repository.Engine.create({
    schema: userSchema,
    store: new Repository.Adapters.Memory.Store(),
    keyCodec: Repository.Codec.simple()
})

// Google Sheetsなしでの操作テスト
testRepo.upsert({ id: 'test1', name: 'テストユーザー', email: 'test@example.com' })
expect(testRepo.has({ id: 'test1' })).toBe(true)
```

## テスト戦略

### 単体テスト (Node.js)
```typescript
import { Repository } from '../src/Modules/Repository'

describe('Repository Engine', () => {
    let repo: any
    
    beforeEach(() => {
        repo = Repository.Engine.create({
            schema: userSchema,
            store: new Repository.Adapters.Memory.Store(),
            keyCodec: Repository.Codec.simple()
        })
    })
    
    test('エンティティをアップサートして検索できること', () => {
        const user = { id: 'u1', name: 'John', email: 'john@test.com' }
        repo.upsert(user)
        
        const found = repo.find({ id: 'u1' })
        expect(found).toEqual(user)
    })
    
    test('変更を追跡できること', () => {
        repo.upsert({ id: 'u1', name: 'John', email: 'john@test.com' })
        
        const changes = repo.getChanges()
        expect(changes.added).toHaveLength(1)
        expect(changes.updated).toHaveLength(0)
    })
})
```

### 統合テスト (GAS)
```typescript
function test_RepositoryWithSheets() {
    const repo = Repository.Engine.create({
        schema: userSchema,
        store: new Repository.Adapters.GAS.Spreadsheet.Store(TEST_SHEET_ID),
        keyCodec: Repository.Codec.simple()
    })
    
    // 実際のGoogle SheetsでのCRUD操作テスト
    repo.load()
    repo.upsert({ id: 'test1', name: 'テストユーザー', email: 'test@example.com' })
    repo.commit()
    
    const user = repo.find({ id: 'test1' })
    console.log('見つかったユーザー:', user)
}
```

### エラーハンドリングテスト
```typescript
test('存在しないエンティティを適切に処理できること', () => {
    const user = repo.find({ id: 'nonexistent' })
    expect(user).toBeNull()
})

test('スキーマパラメータを検証できること', () => {
    expect(() => {
        repo.upsert({ id: 'u1' }) // 必須フィールドなし
    }).toThrow()
})
```

## 設定

### Google Sheets設定
スキーマパラメータに対応する列を持つスプレッドシートを作成:
- 1行目: パラメータ名のヘッダー
- 以降の行: エンティティデータ
- Spreadsheet.Storeコンストラクタにシート IDが必要

### スキーマベストプラクティス
- 常に `instantiate()` と `fromPartial()` メソッドを定義
- エンティティIDにはブランド型を使用
- 必要に応じて `onBeforeSave()` でバリデーション
- マイグレーション用にスキーマバージョニングを検討

### パフォーマンス最適化
- 起動時に `load()` を一度呼んでデータをキャッシュ
- `commit()` 呼び出し前に操作をバッチ化
- 複合キーは性能のため控えめに使用
- 大きなデータセットではメモリ制限を考慮