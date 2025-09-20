# GasAppFramework テストインフラ使用ガイド

このガイドでは、外部プロジェクトでGasAppFrameworkのテストインフラを使用する方法について説明します。このフレームワークは、カテゴリ化されたテスト組織をサポートし、Google Apps Script（GAS）環境向けに特別に設計された包括的なテストシステムを提供します。

## 📋 概要

GasAppFrameworkをライブラリとしてインポートすると、以下の強力なテストインフラにアクセスできます：

- **カテゴリベースのテスト組織** - 機能やモジュールごとにテストをグループ化
- **GAS最適化テストランナー** - GAS実行環境向けに設計
- **包括的なアサーションライブラリ** - 一般的なテストシナリオ用の組み込みアサーション
- **モックユーティリティ** - 分離したテスト用のGASサービスモック
- **柔軟なエントリーポイント** - プロジェクト用のカスタムテストランナーを作成

## 🚀 クイックスタート

### 1. プロジェクトでのテスト設定

GASプロジェクトにテストディレクトリ構造を作成します：

```
your-project/
├── src/                        # ソースコード
└── test/                       # テストファイル
    ├── @entrypoint.ts         # テストエントリーポイント
    ├── YourModule/            # モジュール固有のテスト
    │   ├── @entrypoint.ts     # モジュールテストエントリーポイント
    │   └── *.ts               # テストファイル
    └── _helpers/              # オプション：プロジェクト固有のヘルパー
```

### 2. 基本的なテストファイル構造

フレームワークのテスト登録システムを使用してテストファイルを作成します：

```typescript
/**
 * YourModuleのテスト
 */

// カテゴリ付きでテストを登録
T.it('基本的な機能を実行する必要がある', () => {
    // 準備
    const input = 'test data';
    
    // 実行
    const result = YourModule.processData(input);
    
    // 検証
    TAssert.equals(result.status, 'success', '正常に処理される必要がある');
    TAssert.isTrue(result.data.length > 0, 'データを返す必要がある');
}, 'YourModule');

T.it('エッジケースを処理する必要がある', () => {
    // エッジケースのテスト
    TAssert.throws(() => YourModule.processData(null), 'null入力で例外をスローする必要がある');
}, 'YourModule');
```

### 3. エントリーポイント関数の作成

`test/@entrypoint.ts`ファイルでテストエントリーポイントを作成します：

```typescript
// プロジェクトのすべてのテストを実行するエントリーポイント
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function test_RunYourProject() {
    const results = TRunner.runByCategory('YourModule');
    TGasReporter.printCategory(results, 'YourModule');
}

// すべてのテスト（GasAppFrameworkテストを含む）を実行するエントリーポイント
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function test_RunAllWithYourProject() {
    const results = TRunner.runAll();
    TGasReporter.print(results);
}

// プロジェクトのテストカテゴリを表示するユーティリティ
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function test_ListYourProjectCategories() {
    const logger = (typeof Logger !== 'undefined') ? Logger : console;
    const categories = T.categories().filter(cat => 
        cat.startsWith('YourProject') || cat === 'YourModule'
    );
    
    logger.log(`\n📋 プロジェクトテストカテゴリ (${categories.length}):`);
    categories.forEach(cat => {
        const count = T.byCategory(cat).length;
        logger.log(`  📂 ${cat} (${count} テスト)`);
    });
}
```

## 🏗️ テストインフラコンポーネント

### コアフレームワークコンポーネント

GasAppFrameworkは以下の必須コンポーネントを提供します：

| コンポーネント | 目的 | 使用方法 |
|-----------|---------|-------|
| `T.it()` | テスト登録 | `T.it('テスト名', () => { /* テスト */ }, 'カテゴリ')` |
| `TRunner` | テスト実行 | `TRunner.runAll()`, `TRunner.runByCategory('カテゴリ')` |
| `TAssert` | アサーション | `TAssert.equals()`, `TAssert.isTrue()`, `TAssert.throws()` |
| `TGasReporter` | テストレポート | `TGasReporter.print()`, `TGasReporter.printCategory()` |
| `TestHelpers` | GASモック&ユーティリティ | `TestHelpers.GAS.installAll()` |

### テスト登録

`T.it()`関数を使用してテストを登録します：

```typescript
T.it('説明的なテスト名', () => {
    // テスト実装
    TAssert.isTrue(someCondition, '失敗メッセージ');
}, 'カテゴリ名');
```

**パラメータ:**
- `name` (文字列) - 説明的なテスト名
- `fn` (関数) - 実行するテスト関数
- `category` (文字列、オプション) - テスト組織用カテゴリ（デフォルトは'General'）

### アサーション

利用可能なアサーションメソッド：

```typescript
// ブール値アサーション
TAssert.isTrue(value, 'trueである必要がある');

// 等価アサーション
TAssert.equals(actual, expected, '等しい必要がある');

// 例外アサーション
TAssert.throws(() => riskyFunction(), 'エラーをスローする必要がある');

// カスタム失敗
TAssert.fail('カスタム失敗メッセージ');
```

### テストカテゴリ

カテゴリを使用してテストを整理します。既存のフレームワークカテゴリを使用するか、独自のものを作成できます：

**フレームワークカテゴリ:**
- `EventSystem` - イベント処理とトリガー
- `Repository` - データ永続化
- `Locking` - 分散ロック
- `GasDI` - 依存性注入
- `GAS` - GASランタイム機能
- `Routing` - URLルーティング
- `StringHelper` - 文字列ユーティリティ
- `General` - 未分類テスト

**プロジェクトカテゴリ:**
```typescript
// 独自のカテゴリを作成
T.it('テスト名', () => { /* テスト */ }, 'YourProjectCore');
T.it('テスト名', () => { /* テスト */ }, 'YourProjectAPI');
T.it('テスト名', () => { /* テスト */ }, 'YourProjectUtils');
```

## 🎯 テストの実行

### 組み込みGasAppFrameworkテストの実行

```typescript
// すべてのフレームワークテストを実行
test_RunAll()

// 特定のフレームワークモジュールテストを実行
test_RunByCategory('EventSystem')
test_RunByCategory('Repository')

// 利用可能なカテゴリをリスト
test_ListCategories()

// モジュールヘルプを表示
test_ShowModuleHelp()
```

### プロジェクトテストの実行

```typescript
// プロジェクトのテストのみを実行
test_RunYourProject()

// 特定のカテゴリのテストを実行
test_RunByCategory('YourModule')

// すべてのテスト（フレームワーク + プロジェクト）を実行
test_RunAllWithYourProject()
```

### Google Apps Script IDEでの実行

1. **プロジェクトをデプロイ:**
   ```bash
   clasp push
   ```

2. **GASスクリプトエディタで関数を実行:**
   - 関数ドロップダウンをクリック
   - テスト関数を選択（例：`test_RunYourProject`）
   - 実行ボタンをクリック
   - 実行ログで結果を確認

## 🧪 高度な使用方法

### GASサービスモックの使用

GASサービスを使用するコードのテスト：

```typescript
T.it('モックされたGASサービスで動作する必要がある', () => {
    // GASモックをインストール
    TestHelpers.GAS.installAll();
    
    try {
        // テストコードをここに
        const result = YourModule.useSpreadsheetService();
        TAssert.isTrue(result.success, 'モックされたサービスで成功する必要がある');
    } finally {
        // モックをクリーンアップ
        TestHelpers.GAS.resetAll();
    }
}, 'YourModule');
```

### モジュール固有エントリーポイントの作成

大規模なプロジェクトでは、モジュール固有のテストエントリーポイントを作成します：

```typescript
// test/YourModule/@entrypoint.ts

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function test_RunYourModule() {
    const results = TRunner.runByCategory('YourModule');
    TGasReporter.printCategory(results, 'YourModule');
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function test_RunYourModuleDemo() {
    // カテゴリシステムを検証するデモテスト
    T.it('YourModuleデモテスト', () => {
        TAssert.isTrue(true, 'デモテストは成功する必要がある');
    }, 'YourModule');
    
    const results = TRunner.runByCategory('YourModule');
    TGasReporter.printCategory(results, 'YourModule');
}
```

### カスタムテストヘルパー

プロジェクト固有のテストヘルパーを作成：

```typescript
// test/_helpers/YourProjectHelpers.ts

namespace YourProjectHelpers {
    export function createTestData() {
        return {
            id: 'test-123',
            name: 'テストアイテム',
            created: new Date()
        };
    }
    
    export function assertValidResponse(response: any) {
        TAssert.isTrue(response.hasOwnProperty('status'), 'statusを持つ必要がある');
        TAssert.isTrue(response.hasOwnProperty('data'), 'dataを持つ必要がある');
    }
}
```

## 📊 テスト出力

テストは出力でカテゴリごとに整理されます：

```
[TEST] total=15 ok=13 ng=2

📂 [YourModule] 8 テスト (✅7 ❌1)
  ✅ 基本的な機能を実行する必要がある (2ms)
  ✅ エッジケースを処理する必要がある (1ms)
  ❌ 複雑なシナリオを処理する必要がある (3ms) :: エラーの詳細

📂 [YourProjectCore] 7 テスト (✅6 ❌1)
  ✅ コア機能が正しく動作する (1ms)
  ✅ 設定が適切に読み込まれる (0ms)
```

## 🔧 ベストプラクティス

### 1. 命名規則

```typescript
// 良いテスト名
T.it('税込み総価格を計算する必要がある', () => { ... }, 'PriceCalculator');
T.it('入力が負の場合にエラーをスローする必要がある', () => { ... }, 'PriceCalculator');

// 説明的なカテゴリ名を使用
T.it('テスト名', () => { ... }, 'YourProjectPayment');
T.it('テスト名', () => { ... }, 'YourProjectValidation');
```

### 2. テスト組織

```typescript
// 関連するテストを同じファイルにグループ化
// test/YourModule/validation_spec.ts
T.it('メール形式を検証する必要がある', () => { ... }, 'YourModuleValidation');
T.it('電話番号形式を検証する必要がある', () => { ... }, 'YourModuleValidation');

// test/YourModule/calculation_spec.ts
T.it('割引を計算する必要がある', () => { ... }, 'YourModuleCalculation');
T.it('税率を処理する必要がある', () => { ... }, 'YourModuleCalculation');
```

### 3. GAS固有のテスト

```typescript
T.it('GAS実行制限内で動作する必要がある', () => {
    TestHelpers.GAS.installAll();
    
    try {
        // 長時間実行操作のテスト
        const startTime = Date.now();
        YourModule.processLargeDataset();
        const duration = Date.now() - startTime;
        
        TAssert.isTrue(duration < 300000, '5分以内に完了する必要がある');
    } finally {
        TestHelpers.GAS.resetAll();
    }
}, 'YourModulePerformance');
```

## 🚨 トラブルシューティング

### よくある問題

1. **テストがカテゴリに表示されない:**
   - `T.it()`にカテゴリパラメータを渡していることを確認
   - カテゴリ名のタイプミスを確認

2. **GASサービスエラー:**
   - GASサービスを使用するテストの前に`TestHelpers.GAS.installAll()`を使用
   - finallyブロックで常に`TestHelpers.GAS.resetAll()`を呼び出す

3. **エントリーポイント関数が見えない:**
   - 関数がグローバルスコープにあることを確認
   - `// eslint-disable-next-line @typescript-eslint/no-unused-vars`コメントを追加

### ヘルプの取得

- メインテストフレームワークドキュメント: `test/README.md`
- 例として既存のフレームワークテストを確認
- `test_ListCategories()`で利用可能なカテゴリを確認
- `test_ShowModuleHelp()`でフレームワークエントリーポイントを確認

## 📚 例

### 完全な例：計算機モジュールのテスト

```typescript
// test/Calculator/@entrypoint.ts

// 計算機モジュールテストのエントリーポイント
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function test_RunCalculator() {
    const results = TRunner.runByCategory('Calculator');
    TGasReporter.printCategory(results, 'Calculator');
}

// test/Calculator/basic_operations_spec.ts

T.it('2つの数値を正しく加算する必要がある', () => {
    const result = Calculator.add(2, 3);
    TAssert.equals(result, 5, '加算が正しく動作する必要がある');
}, 'Calculator');

T.it('ゼロ除算を処理する必要がある', () => {
    TAssert.throws(() => Calculator.divide(10, 0), 'ゼロ除算で例外をスローする必要がある');
}, 'Calculator');

// test/Calculator/gas_integration_spec.ts

T.it('計算結果をスプレッドシートに保存する必要がある', () => {
    TestHelpers.GAS.installAll();
    
    try {
        const result = Calculator.add(2, 3);
        const saved = Calculator.saveToSpreadsheet(result);
        TAssert.isTrue(saved, 'スプレッドシートに正常に保存される必要がある');
    } finally {
        TestHelpers.GAS.resetAll();
    }
}, 'Calculator');
```

この包括的な設定により、以下が可能になります：
- 計算機機能を分離してテスト
- モックされたサービスでGAS統合をテスト
- 計算機モジュール用の対象テストを実行
- より広範なフレームワークテストスイートと統合

楽しいテストを! 🎉