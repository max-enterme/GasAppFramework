# RestFramework 使用例

このディレクトリには、実際のシナリオでRestFrameworkを使用する方法を示す、実用的で動作する例が含まれています。

## 概要

ここの例は、独自のAPIエンドポイントのテンプレートとして使用できる完全な実装を示しています。各例は、フレームワークのさまざまな側面とベストプラクティスを示します。

## 利用可能な例

### UserController.ts

完全なユーザー管理APIエンドポイントを示す包括的な例。

**実演される機能:**
- GASイベントから型付きリクエストへのリクエストマッピング
- ビジネスロジックからAPI形式へのレスポンスマッピング
- ビジネスロジック実装
- GASエントリーポイント関数（doGet、doPost）
- 名前空間組織
- TypeScriptによる型安全性

**このパターンを使用するタイミング:**
- Google Apps ScriptでCRUD APIを構築する場合
- 構造化されたリクエスト/レスポンス処理が必要な場合
- 関心の分離を維持したい場合
- GASでRESTfulパターンを実装する場合

## 使用シナリオ

### シナリオ1: シンプルなGET API

**ユースケース:** IDによるユーザーデータの取得

```typescript
// UserController例に基づく
// GETリクエスト: ?id=user123

// Google Apps Scriptで:
function doGet(e: GoogleAppsScript.Events.DoGet) {
    return RestFramework.Examples.doGet(e);
}

// レスポンス:
{
    "success": true,
    "data": {
        "user": {
            "id": "user123",
            "name": "Unknown User",
            "email": "unknown@example.com",
            "created_at": "2024-01-01T12:00:00.000Z"
        }
    },
    "timestamp": "2024-01-01T12:00:00.000Z"
}
```

### シナリオ2: JSONボディを持つPOST API

**ユースケース:** ユーザーデータの作成または更新

```typescript
// UserController例に基づく
// JSONボディを持つPOSTリクエスト:
// {
//     "id": "user123",
//     "name": "John Doe",
//     "email": "john@example.com"
// }

function doPost(e: GoogleAppsScript.Events.DoPost) {
    return RestFramework.Examples.doPost(e);
}

// レスポンス:
{
    "success": true,
    "data": {
        "user": {
            "id": "user123",
            "name": "John Doe",
            "email": "john@example.com",
            "created_at": "2024-01-01T12:00:00.000Z"
        }
    },
    "timestamp": "2024-01-01T12:00:00.000Z"
}
```

### シナリオ3: エラーハンドリング

**ユースケース:** 無効なリクエストの処理

```typescript
// GETリクエスト: ?id= (空のID)

// 自動エラーレスポンス:
{
    "success": false,
    "error": {
        "code": "ValidationError",
        "message": "Invalid user ID",
        "details": {}
    },
    "timestamp": "2024-01-01T12:00:00.000Z"
}
```

## ユースケースに合わせた例の適応

### ステップ1: データモデルの定義

```typescript
// リクエスト/レスポンス型を定義
interface ProductRequest {
    productId: string;
    name?: string;
    price?: number;
    quantity?: number;
}

interface ProductResponse {
    productId: string;
    name: string;
    price: number;
    quantity: number;
    lastUpdated: string;
}
```

### ステップ2: マッパーの実装

```typescript
// GASリクエストをドメインにマップ
class ProductRequestMapper implements RestFramework.Types.RequestMapper<any, ProductRequest> {
    map(input: any): ProductRequest {
        return {
            productId: input.productId || input.parameter?.productId || '',
            name: input.name || input.parameter?.name,
            price: input.price || input.parameter?.price ? parseFloat(input.parameter.price) : undefined,
            quantity: input.quantity || input.parameter?.quantity ? parseInt(input.parameter.quantity) : undefined
        };
    }
}

// ドメインをAPIレスポンスにマップ
class ProductResponseMapper implements RestFramework.Types.ResponseMapper<ProductResponse, any> {
    map(input: ProductResponse): any {
        return {
            product: {
                id: input.productId,
                name: input.name,
                price: input.price,
                quantity: input.quantity,
                last_updated: input.lastUpdated
            }
        };
    }
}
```

### ステップ3: ビジネスロジックの実装

```typescript
class ProductApiLogic implements RestFramework.Types.ApiLogic<ProductRequest, ProductResponse> {
    execute(request: ProductRequest): ProductResponse {
        // 入力検証
        if (!request.productId) {
            throw new Error('Product IDが必要です');
        }

        // ここにビジネスロジック
        // - データベース操作
        // - 外部API呼び出し
        // - データ処理
        
        return {
            productId: request.productId,
            name: request.name || '不明な製品',
            price: request.price || 0,
            quantity: request.quantity || 0,
            lastUpdated: new Date().toISOString()
        };
    }
}
```

### ステップ4: コントローラーの作成

```typescript
export class ProductController extends RestFramework.ApiController<ProductRequest, ProductResponse> {
    private constructor() {
        super(
            new ProductRequestMapper(),
            new ProductResponseMapper(),
            new ProductApiLogic()
        );
    }

    static handleRequest(request: any): RestFramework.Types.ApiResponse<any> {
        const controller = new ProductController();
        return controller.handle(request);
    }
}
```

### ステップ5: GASエントリーポイントの設定

```typescript
function doGet(e: GoogleAppsScript.Events.DoGet): GoogleAppsScript.Content.TextOutput {
    const response = ProductController.handleRequest({
        method: 'GET',
        parameter: e.parameter,
        parameters: e.parameters
    });

    return ContentService
        .createTextOutput(JSON.stringify(response))
        .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e: GoogleAppsScript.Events.DoPost): GoogleAppsScript.Content.TextOutput {
    let body = {};
    try {
        body = e.postData?.contents ? JSON.parse(e.postData.contents) : {};
    } catch (error) {
        // JSONパースエラーの処理
    }

    const response = ProductController.handleRequest({
        method: 'POST',
        parameter: e.parameter,
        parameters: e.parameters,
        body: body
    });

    return ContentService
        .createTextOutput(JSON.stringify(response))
        .setMimeType(ContentService.MimeType.JSON);
}
```

## 高度なパターン

### オプショナルユーティリティの使用

より複雑なシナリオの場合、オプショナルユーティリティを統合します：

```typescript
// バリデーション、認証、ミドルウェア付き
export class SecureProductController extends RestFramework.ApiController<ProductRequest, ProductResponse> {
    private constructor() {
        super(
            new ProductRequestMapper(),
            new ProductResponseMapper(),
            new ProductApiLogic(),
            GasDI.Root.resolve('requestValidator', { optional: true }), // バリデーション
            GasDI.Root.resolve('authService', { optional: true }),       // 認証
            GasDI.Root.resolve('middlewareManager', { optional: true }), // ミドルウェア
            GasDI.Root.resolve('logger', { optional: true }),            // ログ
            GasDI.Root.resolve('errorHandler', { optional: true })       // エラーハンドリング
        );
    }
}
```

これらのコンポーネントの詳細なドキュメントについては、[オプショナルユーティリティREADME](../optional-utilities/README_ja.md)を参照してください。

### 薄いコントローラーパターン

責任を委譲することでコントローラーを薄く保ちます：

**✅ 良い例 - 薄いコントローラー:**
```typescript
class UserApiLogic implements RestFramework.Types.ApiLogic<UserRequest, UserResponse> {
    constructor(
        private userService: UserService,
        private validator: UserValidator
    ) {}

    execute(request: UserRequest): UserResponse {
        // すべてのビジネスロジックはサービスにある
        const user = this.userService.findById(request.id);
        return this.userService.toResponse(user);
    }
}
```

**❌ 悪い例 - 太ったコントローラー:**
```typescript
// ApiLogicやControllerでこれをしないでください
execute(request: UserRequest): UserResponse {
    // コントローラー層にロジックが多すぎる
    const sheet = SpreadsheetApp.openById('...');
    const data = sheet.getRange('A1:Z100').getValues();
    const filtered = data.filter(row => row[0] === request.id);
    // ... さらなる直接的な実装の詳細
}
```

## 実装のテスト

例に基づいて、コントローラーをテストできます：

```typescript
// test_node/your-controller.test.ts
import { ProductController } from '../src/RestFramework/examples/ProductController';

describe('ProductController', () => {
    it('GETリクエストを処理すべき', () => {
        const response = ProductController.handleRequest({
            method: 'GET',
            parameter: { productId: 'prod123' }
        });

        expect(response.success).toBe(true);
        expect(response.data.product.id).toBe('prod123');
    });

    it('バリデーションエラーを処理すべき', () => {
        const response = ProductController.handleRequest({
            method: 'GET',
            parameter: { productId: '' }
        });

        expect(response.success).toBe(false);
        expect(response.error?.code).toBe('ValidationError');
    });
});
```

## 実演されたベストプラクティス

1. **関心の分離**: 各コンポーネント（マッパー、ロジック、コントローラー）は単一の責任を持つ
2. **型安全性**: リクエスト/レスポンスパイプライン全体で強い型付け
3. **エラーハンドリング**: フレームワークを通じた一貫したエラーレスポンス
4. **再利用性**: コンポーネントは異なるエンドポイント間で再利用可能
5. **テスト可能性**: 純粋関数と依存性注入により簡単なテストが可能
6. **GAS互換性**: 名前空間組織はGAS環境でシームレスに動作

## 避けるべき一般的な落とし穴

1. **❌ 関心を混在させない**: 検証、ビジネスロジック、データアクセスを分離する
2. **❌ マッパーをバイパスしない**: 常にマッパーを使用してデータを変換する
3. **❌ 生のエラーを返さない**: ErrorHandlerにエラーレスポンスをフォーマットさせる
4. **❌ GASで非同期を使用しない**: GASはプロミスをうまくサポートしていない; 同期コードを使用
5. **❌ 型安全性を無視しない**: TypeScriptの型システムを活用する

## 次のステップ

1. 例をコピーして、ユースケースに適応させる
2. 高度な機能については[オプショナルユーティリティ](../optional-utilities/README_ja.md)を確認
3. DIパターンについては[依存性注入ガイド](../../../DEPENDENCY_INJECTION_ja.md)を読む
4. 完全なAPIリファレンスについては[RestFrameworkメインREADME](../README_ja.md)を確認

## 質問がありますか？

- 完全なAPIドキュメントは[RestFramework README](../README_ja.md)を参照
- 依存性注入については[GasDIモジュール](../../Modules/GasDI/README_ja.md)を確認
- [ベストプラクティス](../README_ja.md#ベストプラクティス)セクションを確認
- `test_node/restframework/`ディレクトリのテスト例を参照
