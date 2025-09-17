# GAS App Framework用 API Framework

このフレームワークは、Google Apps Script (GAS) 環境でREST API スタイルのアプリケーションを構築するための標準化された基盤を提供します。

## 概要

Framework モジュールは、確立された GasAppFramework のパターンに従い、以下を提供します：

- **BaseApiController**: API エンドポイント用抽象ベースクラス
- **標準化されたレスポンス形式**: 全エンドポイントで一貫したAPIレスポンス
- **エラーハンドリング**: 集中化されたエラー処理とログ
- **依存性注入**: GasDI経由で注入されるオプションサービス
- **型安全性**: インターフェースによる完全なTypeScriptサポート

## アーキテクチャ

```
Framework/
├── controllers/           # ベースコントローラークラス
│   └── BaseApiController.ts
├── formatters/           # レスポンス形式化
│   └── ApiResponseFormatter.ts
├── errors/              # エラーハンドリング
│   └── ErrorHandler.ts
├── logging/             # フレームワークログ
│   └── Logger.ts
├── interfaces/          # コアインターフェース
│   ├── IRequestMapper.ts
│   ├── IResponseMapper.ts
│   ├── IApiLogic.ts
│   ├── IRequestValidator.ts    # オプション
│   ├── IAuthService.ts         # オプション
│   └── IMiddlewareManager.ts   # オプション
├── examples/            # サンプル実装
│   └── UserController.ts
└── Core.Types.d.ts     # 型定義
```

## クイックスタート

### 1. 型定義

```typescript
interface MyRequest {
    id: string;
    name: string;
}

interface MyResponse {
    id: string;
    name: string;
    status: string;
}
```

### 2. 必須コンポーネントの実装

```typescript
// リクエストマッパー
class MyRequestMapper implements Framework.Types.IRequestMapper<any, MyRequest> {
    map(input: any): MyRequest {
        return {
            id: input.parameter?.id || '',
            name: input.parameter?.name || ''
        };
    }
}

// レスポンスマッパー
class MyResponseMapper implements Framework.Types.IResponseMapper<MyResponse, any> {
    map(input: MyResponse): any {
        return {
            item: {
                id: input.id,
                name: input.name,
                status: input.status
            }
        };
    }
}

// ビジネスロジック
class MyApiLogic implements Framework.Types.IApiLogic<MyRequest, MyResponse> {
    execute(request: MyRequest): MyResponse {
        // ここにビジネスロジックを記述
        return {
            id: request.id,
            name: request.name,
            status: 'processed'
        };
    }
}
```

### 3. コントローラーの作成

```typescript
@GasDI.Decorators.Resolve()
class MyController extends Framework.BaseApiController<MyRequest, MyResponse> {
    protected readonly requestMapper = new MyRequestMapper();
    protected readonly responseMapper = new MyResponseMapper();
    protected readonly apiLogic = new MyApiLogic();
}
```

### 4. GAS エントリーポイント

```typescript
function doGet(e: GoogleAppsScript.Events.DoGet): GoogleAppsScript.Content.TextOutput {
    const controller = new MyController();
    const response = controller.handle({
        method: 'GET',
        parameter: e.parameter
    });

    return ContentService
        .createTextOutput(JSON.stringify(response))
        .setMimeType(ContentService.MimeType.JSON);
}
```

## 依存性注入（オプション機能）

フレームワークは GasDI を通じてオプションサービスをサポートします：

### リクエスト検証

```typescript
// バリデータを登録
GasDI.Root.registerValue('requestValidator', {
    validate: (request: MyRequest) => ({
        isValid: !!request.id,
        errors: request.id ? [] : ['IDが必要です']
    })
});
```

### 認証

```typescript
// 認証サービスを登録
GasDI.Root.registerValue('authService', {
    authenticate: (token?: string) => ({
        isAuthenticated: !!token,
        user: token ? { id: 'user1' } : null
    }),
    authorize: (user: any, resource: string, action: string) => true
});
```

### カスタムログ

```typescript
// カスタムロガーを登録
GasDI.Root.registerValue('logger', Framework.Logger.create('[MyAPI]'));
```

## レスポンス形式

すべてのAPIレスポンスは以下の標準化された形式に従います：

```typescript
// 成功レスポンス
{
    "success": true,
    "data": { /* レスポンスデータ */ },
    "timestamp": "2024-01-01T12:00:00.000Z"
}

// エラーレスポンス
{
    "success": false,
    "error": {
        "code": "ValidationError",
        "message": "リクエスト検証に失敗しました",
        "details": { /* 追加エラー情報 */ }
    },
    "timestamp": "2024-01-01T12:00:00.000Z"
}
```

## エラーコード

- `ValidationError`: リクエスト検証失敗
- `AuthenticationError`: 認証が必要または失敗
- `AuthorizationError`: このアクションに対する認可がありません
- `NotFound`: 要求されたリソースが見つかりません
- `MethodNotAllowed`: HTTPメソッドがサポートされていません
- `BadRequest`: 不正なリクエスト
- `InternalError`: 予期しないサーバーエラー

## ベストプラクティス

1. **コントローラーを薄く保つ**: ビジネスロジックは `IApiLogic` 実装に配置
2. **型安全性を使用**: すべてのリクエスト/レスポンス型にインターフェースを定義
3. **エラーを適切に処理**: フレームワークにエラー形式化を任せる
4. **DI を活用**: 横断的関心事にはオプションサービスを使用
5. **十分にテスト**: 提供されたテストモジュールラッパーを使用

## テスト

フレームワークコンポーネントは Node.js テストモジュールラッパーを使用してテストできます：

```typescript
import { FrameworkLogger, ApiResponseFormatter, ErrorHandler } from './framework-module';

describe('My Controller Tests', () => {
    it('should handle requests correctly', () => {
        // テスト実装
    });
});
```

## サンプル

フレームワークのすべての機能を示す完全な動作例については、`src/Framework/examples/UserController.ts` を参照してください。

## 使用例：ユーザー管理API

以下は、ユーザー管理APIの完全な実装例です：

```typescript
// ユーザーリクエスト/レスポンス型
interface UserRequest {
    id: string;
    name?: string;
    email?: string;
}

interface UserResponse {
    id: string;
    name: string;
    email: string;
    createdAt: string;
}

// 実装
class UserRequestMapper implements Framework.Types.IRequestMapper<any, UserRequest> {
    map(input: any): UserRequest {
        return {
            id: input.id || input.parameter?.id || '',
            name: input.name || input.parameter?.name,
            email: input.email || input.parameter?.email
        };
    }
}

class UserResponseMapper implements Framework.Types.IResponseMapper<UserResponse, any> {
    map(input: UserResponse): any {
        return {
            user: {
                id: input.id,
                name: input.name,
                email: input.email,
                created_at: input.createdAt
            }
        };
    }
}

class UserApiLogic implements Framework.Types.IApiLogic<UserRequest, UserResponse> {
    execute(request: UserRequest): UserResponse {
        if (!request.id) {
            throw new Error('ユーザーIDが無効です');
        }

        return {
            id: request.id,
            name: request.name || '不明なユーザー',
            email: request.email || 'unknown@example.com',
            createdAt: new Date().toISOString()
        };
    }
}

// コントローラー
@GasDI.Decorators.Resolve()
class UserController extends Framework.BaseApiController<UserRequest, UserResponse> {
    protected readonly requestMapper = new UserRequestMapper();
    protected readonly responseMapper = new UserResponseMapper();
    protected readonly apiLogic = new UserApiLogic();
}

// GAS エントリーポイント
function doGet(e: GoogleAppsScript.Events.DoGet): GoogleAppsScript.Content.TextOutput {
    const controller = new UserController();
    const response = controller.handle({
        method: 'GET',
        parameter: e.parameter
    });

    return ContentService
        .createTextOutput(JSON.stringify(response))
        .setMimeType(ContentService.MimeType.JSON);
}
```

## フレームワークの利点

- **生産性向上**: 定型的なコードを削減し、ビジネスロジックに集中
- **一貫性**: すべてのAPIエンドポイントで統一された構造
- **保守性**: モジュラー設計により容易な拡張とテスト
- **GAS最適化**: Google Apps Script環境の制約に特化した設計
- **型安全**: TypeScriptによる開発時エラーの早期発見