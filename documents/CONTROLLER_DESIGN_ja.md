# RestFramework コントローラー設計ガイド

このドキュメントは、RestFrameworkで薄く保守可能なコントローラーを設計するためのベストプラクティスとパターンを提供します。目標は、コントローラーの責務の肥大化を防ぎ、関心の明確な分離を維持することです。

## 目次

1. [薄いコントローラーの哲学](#薄いコントローラーの哲学)
2. [コントローラーの責務](#コントローラーの責務)
3. [関心の分離](#関心の分離)
4. [横断的関心事へのミドルウェアの使用](#横断的関心事へのミドルウェアの使用)
5. [入力検証パターン](#入力検証パターン)
6. [例とアンチパターン](#例とアンチパターン)
7. [薄いコントローラーのテスト](#薄いコントローラーのテスト)

## 薄いコントローラーの哲学

**原則**: コントローラーは薄いオーケストレーターであり、ビジネスロジックの実装者ではありません。

コントローラーの役割は：
- リクエスト/レスポンスフローの調整
- 適切なコンポーネントへの委譲
- ビジネスロジックを含まない
- データストアに直接アクセスしない
- 複雑な計算を行わない

**たとえ話**: コントローラーをレストランの支配人と考えてください - 顧客を迎え、注文を受け、キッチンやサーバーと調整しますが、自分で料理を作りません。

## コントローラーの責務

### ✅ コントローラーがすべきこと

1. **リクエストの調整**
   ```typescript
   handle(rawRequest: any): ApiResponse<any> {
       // フローを調整するが、作業は委譲する
       return this.processRequest(rawRequest);
   }
   ```

2. **コンポーネントの配線**
   ```typescript
   constructor() {
       super(
           new RequestMapper(),    // 入力マッピングを委譲
           new ResponseMapper(),   // 出力マッピングを委譲
           new BusinessLogic()     // ビジネスルールを委譲
       );
   }
   ```

3. **エラー境界**
   ```typescript
   try {
       return this.processRequest(rawRequest);
   } catch (error) {
       return this._errorHandler.handle(error);
   }
   ```

### ❌ コントローラーがすべきでないこと

1. **ビジネスロジック**
   ```typescript
   // ❌ 悪い例: コントローラー内のビジネスロジック
   execute(request: UserRequest): UserResponse {
       if (request.age < 18) {
           throw new Error('ユーザーは18歳以上でなければなりません');
       }
       // 複雑なビジネスルール...
   }
   ```

2. **直接のデータアクセス**
   ```typescript
   // ❌ 悪い例: コントローラー内の直接的なスプレッドシートアクセス
   execute(request: UserRequest): UserResponse {
       const sheet = SpreadsheetApp.openById('...');
       const data = sheet.getRange('A1:Z100').getValues();
       // ...
   }
   ```

3. **複雑な変換**
   ```typescript
   // ❌ 悪い例: コントローラー内の複雑なデータ変換
   execute(request: UserRequest): UserResponse {
       const transformed = request.items.map(item => ({
           ...item,
           calculated: this.complexCalculation(item),
           formatted: this.formatData(item)
       }));
       // ...
   }
   ```

## 関心の分離

### レイヤーの責務

```
┌─────────────────────────────────────┐
│ Controller (オーケストレーション)    │
│ - リクエストフローを調整             │
│ - コンポーネントを配線               │
│ - 境界でエラーを処理                 │
└──────────────┬──────────────────────┘
               │
┌──────────────┴──────────────────────┐
│ Middleware (横断的)                 │
│ - ログ                              │
│ - 認証                              │
│ - レート制限                        │
│ - リクエスト前処理                  │
└──────────────┬──────────────────────┘
               │
┌──────────────┴──────────────────────┐
│ Mappers (変換)                      │
│ - リクエストマッピング              │
│ - レスポンスマッピング              │
│ - データフォーマット変換            │
└──────────────┬──────────────────────┘
               │
┌──────────────┴──────────────────────┐
│ Validators (入力検証)               │
│ - スキーマ検証                      │
│ - ビジネスルール検証                │
│ - データ整合性チェック              │
└──────────────┬──────────────────────┘
               │
┌──────────────┴──────────────────────┐
│ Business Logic (ドメインルール)     │
│ - コアビジネス操作                  │
│ - ドメイン固有の計算                │
│ - ユースケース実装                  │
└──────────────┬──────────────────────┘
               │
┌──────────────┴──────────────────────┐
│ Services (インフラストラクチャ)     │
│ - リポジトリ操作                    │
│ - 外部API呼び出し                   │
│ - ファイルシステムアクセス          │
└─────────────────────────────────────┘
```

### 実装パターン

```typescript
// ✅ 良い例: 各レイヤーに明確な責務

// 1. Mapper: 入力を変換
class UserRequestMapper implements RestFramework.Types.RequestMapper<any, UserRequest> {
    map(input: any): UserRequest {
        return {
            id: input.parameter?.id || '',
            name: input.parameter?.name || '',
            email: input.parameter?.email || ''
        };
    }
}

// 2. Validator: 入力ルールをチェック（オプション、DI経由）
class UserRequestValidator implements RestFramework.Types.RequestValidator<UserRequest> {
    validate(request: UserRequest): { isValid: boolean; errors?: string[] } {
        const errors: string[] = [];
        if (!request.id) errors.push('IDが必要です');
        if (request.email && !this.isValidEmail(request.email)) {
            errors.push('無効なメールフォーマットです');
        }
        return { isValid: errors.length === 0, errors };
    }
    
    private isValidEmail(email: string): boolean {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }
}

// 3. Service: データ操作を処理
class UserService {
    constructor(private repository: any) {}
    
    findUser(id: string): User | null {
        return this.repository.findById(id);
    }
    
    updateUser(user: User): User {
        return this.repository.save(user);
    }
}

// 4. Business Logic: ドメインルールを実装
class UserApiLogic implements RestFramework.Types.ApiLogic<UserRequest, UserResponse> {
    constructor(private userService: UserService) {}
    
    execute(request: UserRequest): UserResponse {
        // サービスに委譲
        const user = this.userService.findUser(request.id);
        
        if (!user) {
            throw new Error('ユーザーが見つかりません');
        }
        
        // ビジネスルールを適用
        if (request.name && request.name !== user.name) {
            user.name = request.name;
            this.userService.updateUser(user);
        }
        
        return {
            id: user.id,
            name: user.name,
            email: user.email,
            updatedAt: new Date().toISOString()
        };
    }
}

// 5. Response Mapper: 出力を変換
class UserResponseMapper implements RestFramework.Types.ResponseMapper<UserResponse, any> {
    map(input: UserResponse): any {
        return {
            user: {
                id: input.id,
                name: input.name,
                email: input.email,
                updated_at: input.updatedAt
            }
        };
    }
}

// 6. Controller: オーケストレート（薄いまま！）
class UserController extends RestFramework.ApiController<UserRequest, UserResponse> {
    constructor() {
        const userService = new UserService(myRepository);
        
        super(
            new UserRequestMapper(),
            new UserResponseMapper(),
            new UserApiLogic(userService),
            GasDI.Root.resolve('requestValidator', { optional: true }),
            GasDI.Root.resolve('authService', { optional: true }),
            GasDI.Root.resolve('middlewareManager', { optional: true })
        );
    }
}
```

## 横断的関心事へのミドルウェアの使用

ミドルウェアは、複数のコントローラーにまたがる関心事に最適です。

### 一般的なミドルウェアのユースケース

1. **リクエストログ**
2. **認証/認可**
3. **レート制限**
4. **入力サニタイゼーション**
5. **レスポンスキャッシュ**
6. **CORSヘッダー**
7. **リクエストID生成**

### ミドルウェアの実装

```typescript
class ApiMiddlewareManager implements RestFramework.Types.MiddlewareManager {
    private middlewares: Array<(context: any, next: () => any) => any> = [];
    
    use(middleware: (context: any, next: () => any) => any): void {
        this.middlewares.push(middleware);
    }
    
    execute(context: any, next: () => any): any {
        let index = 0;
        
        const runNext = (): any => {
            if (index < this.middlewares.length) {
                const middleware = this.middlewares[index++];
                return middleware(context, runNext);
            }
            return next();
        };
        
        return runNext();
    }
}

// ミドルウェアパイプラインをセットアップ
const middlewareManager = new ApiMiddlewareManager();

// 1. ログミドルウェア
middlewareManager.use((context, next) => {
    const startTime = Date.now();
    console.log(`[${new Date().toISOString()}] ${context.method} ${context.path || 'unknown'}`);
    
    const result = next();
    
    const duration = Date.now() - startTime;
    console.log(`[${new Date().toISOString()}] レスポンス送信 (${duration}ms)`);
    
    return result;
});

// 2. リクエストIDミドルウェア
middlewareManager.use((context, next) => {
    context.requestId = Utilities.getUuid();
    return next();
});

// 3. レート制限ミドルウェア
middlewareManager.use((context, next) => {
    const clientId = context.headers?.['x-client-id'] || 'anonymous';
    
    if (isRateLimited(clientId)) {
        throw new Error('レート制限を超えました');
    }
    
    return next();
});

// DIに登録
GasDI.Root.registerValue('middlewareManager', middlewareManager);
```

## 入力検証パターン

### パターン1: オプショナルユーティリティ経由の検証

検証ロジックをコントローラーから専用のバリデータに移動：

```typescript
// ✅ 良い例: 専用バリデータ
class ProductRequestValidator implements RestFramework.Types.RequestValidator<ProductRequest> {
    validate(request: ProductRequest): { isValid: boolean; errors?: string[] } {
        const errors: string[] = [];
        
        // 基本検証
        if (!request.productId) {
            errors.push('製品IDが必要です');
        }
        
        // ビジネスルール検証
        if (request.price !== undefined && request.price < 0) {
            errors.push('価格は負の値にできません');
        }
        
        if (request.quantity !== undefined && request.quantity < 0) {
            errors.push('数量は負の値にできません');
        }
        
        // フォーマット検証
        if (request.productId && !/^[A-Z]{3}\d{6}$/.test(request.productId)) {
            errors.push('製品IDは次の形式である必要があります: ABC123456');
        }
        
        return {
            isValid: errors.length === 0,
            errors: errors.length > 0 ? errors : undefined
        };
    }
}

// バリデータを登録
GasDI.Root.registerValue('requestValidator', new ProductRequestValidator());

// コントローラーは自動的にそれを使用
class ProductController extends RestFramework.ApiController<ProductRequest, ProductResponse> {
    constructor() {
        super(
            new ProductRequestMapper(),
            new ProductResponseMapper(),
            new ProductApiLogic(),
            GasDI.Root.resolve('requestValidator', { optional: true }) // ここで検証が処理される
        );
    }
}
```

### パターン2: ミドルウェア経由の検証

複数のコントローラーに適用される検証の場合：

```typescript
// 検証ミドルウェア
const validationMiddleware = (context: any, next: () => any) => {
    // すべてのリクエストに適用される共通検証ルール
    if (!context.parameter?.version) {
        throw new Error('APIバージョンパラメータが必要です');
    }
    
    if (context.parameter.version !== 'v1') {
        throw new Error('サポートされていないAPIバージョンです');
    }
    
    return next();
};

middlewareManager.use(validationMiddleware);
```

### パターン3: スキーマベースの検証

複雑な検証にスキーマバリデータを使用：

```typescript
class SchemaValidator<T> implements RestFramework.Types.RequestValidator<T> {
    constructor(private schema: any) {}
    
    validate(request: T): { isValid: boolean; errors?: string[] } {
        const errors: string[] = [];
        
        // スキーマに対して検証
        for (const [field, rules] of Object.entries(this.schema)) {
            const value = (request as any)[field];
            const fieldRules = rules as any;
            
            if (fieldRules.required && !value) {
                errors.push(`${field}が必要です`);
            }
            
            if (value && fieldRules.type) {
                if (typeof value !== fieldRules.type) {
                    errors.push(`${field}は${fieldRules.type}型である必要があります`);
                }
            }
            
            if (value && fieldRules.pattern) {
                if (!new RegExp(fieldRules.pattern).test(value)) {
                    errors.push(`${field}のフォーマットが無効です`);
                }
            }
        }
        
        return {
            isValid: errors.length === 0,
            errors: errors.length > 0 ? errors : undefined
        };
    }
}

// 使用方法
const userSchema = {
    id: { required: true, type: 'string', pattern: '^[A-Z0-9]+$' },
    email: { required: false, type: 'string', pattern: '^[^@]+@[^@]+\\.[^@]+$' },
    age: { required: false, type: 'number' }
};

GasDI.Root.registerValue('requestValidator', new SchemaValidator(userSchema));
```

## 例とアンチパターン

### 例1: 良い - 薄いコントローラー

```typescript
// ✅ 明確な分離のある薄いコントローラー
class OrderController extends RestFramework.ApiController<OrderRequest, OrderResponse> {
    constructor() {
        const orderService = GasDI.Root.resolve('orderService');
        
        super(
            new OrderRequestMapper(),
            new OrderResponseMapper(),
            new OrderApiLogic(orderService), // ビジネスロジックが委譲される
            GasDI.Root.resolve('requestValidator', { optional: true }),
            GasDI.Root.resolve('authService', { optional: true }),
            GasDI.Root.resolve('middlewareManager', { optional: true })
        );
    }
}

class OrderApiLogic implements RestFramework.Types.ApiLogic<OrderRequest, OrderResponse> {
    constructor(private orderService: OrderService) {}
    
    execute(request: OrderRequest): OrderResponse {
        // サービス層に委譲
        const order = this.orderService.processOrder(request);
        return this.orderService.toResponse(order);
    }
}
```

### アンチパターン1: 太ったコントローラー

```typescript
// ❌ 悪い例: やりすぎのコントローラー
class OrderApiLogic implements RestFramework.Types.ApiLogic<OrderRequest, OrderResponse> {
    execute(request: OrderRequest): OrderResponse {
        // ❌ 直接的なデータアクセス
        const sheet = SpreadsheetApp.openById('...');
        const orders = sheet.getRange('A2:F100').getValues();
        
        // ❌ 複雑なビジネスロジック
        const customerOrders = orders.filter(row => row[1] === request.customerId);
        const totalAmount = customerOrders.reduce((sum, row) => sum + row[4], 0);
        
        if (totalAmount > 10000) {
            // 割引を適用
            request.price = request.price * 0.9;
        }
        
        // ❌ 直接的な外部API呼び出し
        const response = UrlFetchApp.fetch('https://api.external.com/validate');
        
        // ❌ 複雑な計算
        const tax = this.calculateTax(request);
        const shipping = this.calculateShipping(request);
        
        // ここにロジックが多すぎる！
        return { /* ... */ };
    }
}
```

### 例2: 入力サニタイゼーション用ミドルウェア

```typescript
// ✅ 良い例: ミドルウェアでの入力サニタイゼーション
const sanitizationMiddleware = (context: any, next: () => any) => {
    // 共通入力をサニタイズ
    if (context.parameter) {
        Object.keys(context.parameter).forEach(key => {
            const value = context.parameter[key];
            if (typeof value === 'string') {
                // 潜在的に有害な文字を削除
                context.parameter[key] = value
                    .replace(/<script[^>]*>.*?<\/script>/gi, '')
                    .replace(/<[^>]+>/g, '')
                    .trim();
            }
        });
    }
    
    return next();
};

middlewareManager.use(sanitizationMiddleware);
```

## 薄いコントローラーのテスト

薄いコントローラーは、依存関係と責務が少ないため、テストが簡単です。

### テスト戦略

```typescript
describe('OrderController', () => {
    let mockOrderService: any;
    let orderLogic: OrderApiLogic;
    
    beforeEach(() => {
        // サービス層をモック
        mockOrderService = {
            processOrder: jest.fn(),
            toResponse: jest.fn()
        };
        
        orderLogic = new OrderApiLogic(mockOrderService);
    });
    
    it('注文サービスに委譲すべき', () => {
        const request: OrderRequest = {
            orderId: 'ORD123',
            customerId: 'CUST456'
        };
        
        const mockOrder = { id: 'ORD123', status: 'processed' };
        mockOrderService.processOrder.mockReturnValue(mockOrder);
        mockOrderService.toResponse.mockReturnValue({
            orderId: 'ORD123',
            status: 'processed'
        });
        
        const result = orderLogic.execute(request);
        
        expect(mockOrderService.processOrder).toHaveBeenCalledWith(request);
        expect(mockOrderService.toResponse).toHaveBeenCalledWith(mockOrder);
        expect(result.orderId).toBe('ORD123');
    });
});
```

## まとめ

**薄いコントローラーの重要原則:**

1. ✅ **委譲、実装しない**: コントローラーは調整するが、作業は行わない
2. ✅ **単一責任**: 各レイヤーは1つの明確な目的を持つ
3. ✅ **ミドルウェアを使用**: 横断的関心事はミドルウェアに属する
4. ✅ **検証を分離**: バリデータまたはミドルウェアを使用し、コントローラーロジックではない
5. ✅ **独立してテスト**: 各レイヤーは分離してテスト可能であるべき
6. ✅ **依存性注入**: オプションおよび横断的サービスにはDIを使用

**覚えておいてください**: 薄いコントローラーは良いアーキテクチャの兆候です。コントローラーまたはApiLogicが20-30行を超える場合は、ロジックをサービス、バリデータ、またはミドルウェアに抽出することを検討してください。

**関連ドキュメント**:
- [RestFramework README](src/RestFramework/README_ja.md)
- [オプショナルユーティリティガイド](src/RestFramework/optional-utilities/README_ja.md)
- [依存性注入ガイド](DEPENDENCY_INJECTION_ja.md)
- [使用例ディレクトリ](src/RestFramework/examples/README_ja.md)
