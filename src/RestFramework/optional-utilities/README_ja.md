# RestFramework オプショナルユーティリティ

このディレクトリには、RestFrameworkの基本機能を拡張するために使用できる**オプションコンポーネント**が含まれています。これらのユーティリティは基本操作には必須ではありませんが、高度なユースケースのための追加機能を提供します。

## コンポーネント概要

### RequestValidator
リクエストバリデーション機能を提供し、処理前に受信データが期待される基準を満たしていることを確認します。

**ユースケース:**
- ビジネスロジック実行前の入力検証
- データ型およびフォーマットチェック
- 必須フィールドの検証

**例:**
```typescript
class UserRequestValidator implements RestFramework.Types.RequestValidator<UserRequest> {
    validate(request: UserRequest): { isValid: boolean; errors?: string[] } {
        const errors: string[] = [];
        
        if (!request.id || request.id.trim() === '') {
            errors.push('ユーザーIDが必要です');
        }
        
        if (request.email && !this.isValidEmail(request.email)) {
            errors.push('無効なメールフォーマットです');
        }
        
        return {
            isValid: errors.length === 0,
            errors: errors.length > 0 ? errors : undefined
        };
    }
    
    private isValidEmail(email: string): boolean {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }
}

// 依存性注入で登録
GasDI.Root.registerValue('requestValidator', new UserRequestValidator());
```

### AuthService
APIエンドポイントの認証と認可を処理します。

**ユースケース:**
- トークンベース認証
- ユーザーID検証
- リソースレベルの認可チェック
- ロールベースアクセス制御

**例:**
```typescript
class JwtAuthService implements RestFramework.Types.AuthService {
    authenticate(token?: string): { isAuthenticated: boolean; user?: any } {
        if (!token) {
            return { isAuthenticated: false };
        }
        
        try {
            const decoded = this.verifyToken(token);
            return {
                isAuthenticated: true,
                user: decoded
            };
        } catch (error) {
            return { isAuthenticated: false };
        }
    }
    
    authorize(user: any, resource: string, action: string): boolean {
        // ユーザー権限をチェック
        return user.permissions?.includes(`${resource}:${action}`) || false;
    }
    
    private verifyToken(token: string): any {
        // JWTトークンを検証（実装は認証戦略によって異なります）
        return {}; // デコードされたトークンペイロード
    }
}

// 依存性注入で登録
GasDI.Root.registerValue('authService', new JwtAuthService());
```

### MiddlewareManager
横断的関心事のためのミドルウェア実行パイプラインを管理します。

**ユースケース:**
- リクエスト/レスポンス変換
- ログとモニタリング
- レート制限
- CORS処理
- リクエスト前処理

**例:**
```typescript
class SimpleMiddlewareManager implements RestFramework.Types.MiddlewareManager {
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

// ミドルウェア例: リクエストログ
const loggingMiddleware = (context: any, next: () => any) => {
    console.log(`[${new Date().toISOString()}] ${context.method} ${context.path}`);
    const result = next();
    console.log(`[${new Date().toISOString()}] レスポンス送信`);
    return result;
};

// ミドルウェア例: レート制限
const rateLimitMiddleware = (context: any, next: () => any) => {
    const clientId = context.headers?.['x-client-id'];
    if (this.isRateLimited(clientId)) {
        throw new Error('レート制限を超えました');
    }
    return next();
};

// セットアップ
const middlewareManager = new SimpleMiddlewareManager();
middlewareManager.use(loggingMiddleware);
middlewareManager.use(rateLimitMiddleware);

GasDI.Root.registerValue('middlewareManager', middlewareManager);
```

## コントローラーとの統合

オプショナルユーティリティは、コンストラクタまたは依存性注入を通じてコントローラーに注入されます：

```typescript
@GasDI.Decorators.Resolve()
class SecureUserController extends RestFramework.ApiController<UserRequest, UserResponse> {
    constructor() {
        super(
            new UserRequestMapper(),
            new UserResponseMapper(),
            new UserApiLogic(),
            GasDI.Root.resolve('requestValidator', { optional: true }),
            GasDI.Root.resolve('authService', { optional: true }),
            GasDI.Root.resolve('middlewareManager', { optional: true }),
            GasDI.Root.resolve('logger', { optional: true }),
            GasDI.Root.resolve('errorHandler', { optional: true })
        );
    }
}
```

## オプショナルユーティリティの使用タイミング

### RequestValidatorを使用する場合:
- 入力データに複雑な検証ルールが必要な場合
- 詳細な検証エラーメッセージを提供する必要がある場合
- 検証ロジックをビジネスロジックから分離したい場合

### AuthServiceを使用する場合:
- APIに認証が必要な場合
- ロールベースアクセス制御が必要な場合
- 認可ロジックを一元化したい場合

### MiddlewareManagerを使用する場合:
- 横断的関心事がある場合（ログ、モニタリング、レート制限）
- コントローラーに到達する前にリクエストを前処理する必要がある場合
- プラグインスタイルのアーキテクチャを実装したい場合

## ベストプラクティス

1. **オプショナルユーティリティを本当にオプションにする**: フレームワークはこれらなしで動作すべき
2. **依存性注入を使用する**: 疎結合のためにGasDIでユーティリティを登録
3. **単一責任を実装する**: 各ユーティリティは1つの明確な目的を持つべき
4. **独立してテストする**: 各ユーティリティの単体テストを分離して記述
5. **明確に文書化する**: 明確な例と使用ガイドラインを提供

## 必須コンポーネントとの違い

| 側面 | 必須コンポーネント | オプショナルユーティリティ |
|--------|---------------------|-------------------|
| 場所 | `interfaces/` | `optional-utilities/` |
| 必須性 | はい、コントローラー操作に必要 | いいえ、なくてもコントローラーは動作 |
| 例 | RequestMapper, ResponseMapper, ApiLogic | RequestValidator, AuthService, MiddlewareManager |
| DIパターン | コンストラクタで直接提供 | DIを介してオプションで解決 |
| 目的 | コアフレームワーク機能 | 拡張機能と横断的関心事 |

## 関連ドキュメント

- [RestFramework メインREADME](../README.md)
- [Examplesディレクトリ](../examples/README.md)
- [依存性注入ガイド](../../../DEPENDENCY_INJECTION_ja.md)
- [コントローラーベストプラクティス](../README_ja.md#ベストプラクティス)
