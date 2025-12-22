# Routing モジュール

Google Apps Script Webアプリケーション向けの柔軟なHTTPスタイルルーティングシステム。パラメータ化ルート、ワイルドカード、ミドルウェア、階層ルートマウンティングをサポートします。

## 機能

- **パラメータ化ルート**: `:param` 構文でURLからパラメータを抽出
- **ワイルドカードルート**: `*` 構文でキャッチオールルート
- **ミドルウェアサポート**: 前処理/後処理ミドルウェアの追加
- **ルートマウンティング**: パスプレフィックス付きルーター合成
- **型安全性**: コンテキストとレスポンス型の完全なTypeScriptサポート
- **パスマッチング**: 特異性順序付きの効率的なルートマッチング

## 主要API

### ルーター作成と登録
```typescript
// ルーター作成
const router = Routing.create<RequestContext, HtmlOutput>()

// シンプルルートの登録
router.register('/api/users', (ctx) => {
    return HtmlService.createHtmlOutput('ユーザー一覧')
})

// パラメータ化ルートの登録
router.register('/api/users/:id', (ctx) => {
    const userId = ctx.params.id
    return HtmlService.createHtmlOutput(`ユーザー: ${userId}`)
})

// ワイルドカードルートの登録
router.register('/static/*', (ctx) => {
    const filePath = ctx.params['*']
    return serveStaticFile(filePath)
})
```

### ミドルウェア
```typescript
// ログミドルウェアの追加
router.use((ctx, next) => {
    console.log(`リクエスト: ${ctx.path}`)
    const result = next(ctx)
    console.log(`レスポンス: ${result.getContent()}`)
    return result
})

// 認証ミドルウェアの追加
router.use((ctx, next) => {
    if (!ctx.user) {
        return HtmlService.createHtmlOutput('認証が必要です')
    }
    return next(ctx)
})
```

### ルートマウンティング
```typescript
// サブルーターの作成
const apiRouter = Routing.create()
apiRouter.register('/users', handleUsers)
apiRouter.register('/orders', handleOrders)

const adminRouter = Routing.create()
adminRouter.register('/dashboard', handleDashboard)
adminRouter.register('/settings', handleSettings)

// サブルーターのマウント
const mainRouter = Routing.create()
mainRouter.mount('/api', apiRouter)
mainRouter.mount('/admin', adminRouter)

// ルートは以下のようになります:
// /api/users, /api/orders
// /admin/dashboard, /admin/settings
```

## 使用例

### 基本的なWebアプリルーティング
```typescript
interface RequestContext {
    path: string
    params: { [key: string]: string }
    query: { [key: string]: string }
    user?: User
}

// ルーター設定
const router = Routing.create<RequestContext, GoogleAppsScript.HTML.HtmlOutput>()

// ホームページ
router.register('/', (ctx) => {
    return HtmlService.createHtmlOutputFromFile('index')
})

// ユーザープロフィールページ
router.register('/users/:id', (ctx) => {
    const userId = ctx.params.id
    const user = getUserById(userId)
    
    const template = HtmlService.createTemplateFromFile('user-profile')
    template.user = user
    return template.evaluate()
})

// APIエンドポイント
router.register('/api/users', (ctx) => {
    const users = getAllUsers()
    return HtmlService.createHtmlOutput(JSON.stringify(users))
        .setMimeType(ContentService.MimeType.JSON)
})

// 404用キャッチオール
router.register('/*', (ctx) => {
    return HtmlService.createHtmlOutputFromFile('404')
        .setTitle('ページが見つかりません')
})

// GAS doGet関数
function doGet(e: GoogleAppsScript.Events.DoGet): GoogleAppsScript.HTML.HtmlOutput {
    const ctx: RequestContext = {
        path: e.pathInfo || '/',
        params: {},
        query: e.parameter || {}
    }
    
    return router.dispatch(ctx.path, ctx)
}
```

### ルートグループ付きREST API
```typescript
// APIルーター作成
const apiRouter = Routing.create<ApiContext, ContentService.TextOutput>()

// ユーザーリソース
const usersRouter = Routing.create<ApiContext, ContentService.TextOutput>()
usersRouter.register('/', (ctx) => {
    // GET /api/users
    const users = userService.getAll()
    return createJsonResponse(users)
})

usersRouter.register('/:id', (ctx) => {
    // GET /api/users/123
    const user = userService.getById(ctx.params.id)
    return createJsonResponse(user)
})

// 注文リソース
const ordersRouter = Routing.create<ApiContext, ContentService.TextOutput>()
ordersRouter.register('/', (ctx) => {
    // GET /api/orders
    const orders = orderService.getAll()
    return createJsonResponse(orders)
})

ordersRouter.register('/:id', (ctx) => {
    // GET /api/orders/456
    const order = orderService.getById(ctx.params.id)
    return createJsonResponse(order)
})

// リソースルーターのマウント
apiRouter.mount('/users', usersRouter)
apiRouter.mount('/orders', ordersRouter)

// APIルーターのマウント
const mainRouter = Routing.create<ApiContext, ContentService.TextOutput>()
mainRouter.mount('/api', apiRouter)

function createJsonResponse(data: any): GoogleAppsScript.Content.TextOutput {
    return ContentService.createTextOutput(JSON.stringify(data))
        .setMimeType(ContentService.MimeType.JSON)
}
```

### 認証と認可
```typescript
// 認証ミドルウェア
const authMiddleware: Routing.Ports.Middleware<RequestContext, HtmlOutput> = (ctx, next) => {
    const token = ctx.query.token
    if (!token) {
        return HtmlService.createHtmlOutput('認証が必要です')
    }
    
    const user = validateToken(token)
    if (!user) {
        return HtmlService.createHtmlOutput('無効なトークンです')
    }
    
    ctx.user = user
    return next(ctx)
}

// 管理者ルート用認可ミドルウェア
const adminMiddleware: Routing.Ports.Middleware<RequestContext, HtmlOutput> = (ctx, next) => {
    if (!ctx.user || ctx.user.role !== 'admin') {
        return HtmlService.createHtmlOutput('管理者アクセスが必要です')
    }
    return next(ctx)
}

// ミドルウェアの適用
const router = Routing.create<RequestContext, HtmlOutput>()

// パブリックルート（ミドルウェアなし）
router.register('/', (ctx) => HtmlService.createHtmlOutputFromFile('public'))

// 保護されたルート
router.use(authMiddleware)
router.register('/dashboard', (ctx) => {
    const template = HtmlService.createTemplateFromFile('dashboard')
    template.user = ctx.user
    return template.evaluate()
})

// 管理者ルート（認証 + 管理者ミドルウェア）
const adminRouter = Routing.create<RequestContext, HtmlOutput>()
adminRouter.use(authMiddleware)
adminRouter.use(adminMiddleware)
adminRouter.register('/users', handleAdminUsers)
adminRouter.register('/settings', handleAdminSettings)

router.mount('/admin', adminRouter)
```

## テスト戦略

### 単体テスト (Node.js)
```typescript
describe('Routing Engine', () => {
    let router: Routing.Router<TestContext, string>
    
    beforeEach(() => {
        router = Routing.create<TestContext, string>()
    })
    
    test('静的ルートをマッチできること', () => {
        router.register('/users', (ctx) => 'users')
        
        const result = router.dispatch('/users', { path: '/users', params: {} })
        expect(result).toBe('users')
    })
    
    test('ルートパラメータを抽出できること', () => {
        router.register('/users/:id', (ctx) => `user-${ctx.params.id}`)
        
        const result = router.dispatch('/users/123', { path: '/users/123', params: {} })
        expect(result).toBe('user-123')
    })
    
    test('ワイルドカードルートを処理できること', () => {
        router.register('/files/*', (ctx) => `file-${ctx.params['*']}`)
        
        const result = router.dispatch('/files/docs/readme.txt', { 
            path: '/files/docs/readme.txt', 
            params: {} 
        })
        expect(result).toBe('file-docs/readme.txt')
    })
    
    test('ミドルウェアを順序通りに適用できること', () => {
        const calls: string[] = []
        
        router.use((ctx, next) => {
            calls.push('middleware1')
            return next(ctx)
        })
        
        router.use((ctx, next) => {
            calls.push('middleware2')
            return next(ctx)
        })
        
        router.register('/test', (ctx) => {
            calls.push('handler')
            return 'result'
        })
        
        router.dispatch('/test', { path: '/test', params: {} })
        expect(calls).toEqual(['middleware1', 'middleware2', 'handler'])
    })
})
```

### 統合テスト (GAS)
```typescript
function test_WebAppRouting() {
    // モックGAS環境でのテスト
    const router = Routing.create<RequestContext, GoogleAppsScript.HTML.HtmlOutput>()
    
    router.register('/', (ctx) => {
        return HtmlService.createHtmlOutput('<h1>ホーム</h1>')
    })
    
    router.register('/users/:id', (ctx) => {
        return HtmlService.createHtmlOutput(`<h1>ユーザー ${ctx.params.id}</h1>`)
    })
    
    // ルーティングテスト
    const homeResult = router.dispatch('/', { path: '/', params: {}, query: {} })
    console.log('ホーム結果:', homeResult.getContent())
    
    const userResult = router.dispatch('/users/123', { 
        path: '/users/123', 
        params: {}, 
        query: {} 
    })
    console.log('ユーザー結果:', userResult.getContent())
}
```

### パフォーマンステスト
```typescript
test('大きなルートテーブルを効率的に処理できること', () => {
    const router = Routing.create()
    
    // 多数のルートを登録
    for (let i = 0; i < 1000; i++) {
        router.register(`/route${i}`, (ctx) => `result${i}`)
    }
    
    const start = Date.now()
    const result = router.dispatch('/route500', { path: '/route500', params: {} })
    const elapsed = Date.now() - start
    
    expect(result).toBe('result500')
    expect(elapsed).toBeLessThan(10) // 高速であること
})
```

## 設定

### ルートパターン
- **静的**: `/users` - 正確なパスマッチ
- **パラメータ**: `/users/:id` - 名前付きパラメータの抽出
- **ワイルドカード**: `/files/*` - 残りのパスセグメントをマッチ

### ミドルウェア順序
- ミドルウェアは登録順に適用される
- 各ミドルウェアは `next()` 呼び出し前にコンテキストを変更可能
- ミドルウェアは早期リターンでリクエストをショートサーキット可能

### ベストプラクティス
- 一般的なルートより具体的なルートを先に使用
- 認証ミドルウェアを早期に適用
- 関連ルートをサブルーターでグループ化
- キャッチオールエラーハンドリングにワイルドカードルートを使用
- ルートハンドラーは焦点を絞り軽量に保つ