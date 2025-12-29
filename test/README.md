# GasAppFramework テストコード構成

## ディレクトリ構造

### test/Modules/ - GAS環境での統合テスト
Google Apps Script環境で実行されるテストファイル。
SpreadsheetApp、PropertiesService、LockServiceなどGAS固有のサービスを使用します。

**テストカテゴリ:**
- `StringHelper/` - 文字列操作とテンプレート機能のテスト
- `Routing/` - URLルーティングとリクエスト処理のテスト
- `Repository/` - SpreadsheetAppを使ったデータ永続化のテスト
- `Locking/` - LockService/PropertiesServiceによる分散ロックのテスト
- `GasDI/` - 依存性注入コンテナのテスト
- `GAS/` - ScriptAppなど高度なGAS機能のテスト

### test/node/ - Node.js用テスト
- **shared/**: 共有テストのNode.js実行ラッパー（Jest形式）
  - `stringhelper.test.ts` - StringHelper 共通テストの Node.js ラッパー
  - `routing.test.ts` - Routing 共通テストの Node.js ラッパー
- **integration/**: 複雑な統合テスト
  - `repository.engine.test.ts` - Repository エンジンの統合テスト
  - `routing.engine.test.ts` - Routing エンジンの統合テスト
  - `stringhelper.test.ts` - StringHelper の統合テスト
  - `restframework/` - REST フレームワークのテスト

### test/shared/ - 両環境で実行可能なテストロジック
GAS と Node.js 両方で実行可能な純粋なロジックテスト。
テストコードの重複を避け、1箇所で管理。

**主なテストファイル:**
- `stringhelper/core.test.ts` - StringHelper の共通テスト
- `routing/core.test.ts` - Routing の共通テスト
- `repository/core.test.ts` - Repository の共通テスト
- `locking/core.test.ts` - Locking の共通テスト
- `gasdi/core.test.ts` - GasDI の共通テスト

## テストの実行方法

### GAS環境（Webテストランナー経由）

1. ビルドとデプロイ：
```bash
npm run build
npm run gas:push
npm run gas:deploy
```

2. CLIからテスト実行：
```bash
# すべてのテストを実行
npm run gas:test

# カテゴリ別に実行
npm run gas:test -- --category=Repository
```

3. または、デプロイされたWebアプリに直接アクセス：
```
https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec?all=true
https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec?category=StringHelper
https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec?list=true
```

### Node.js環境
```bash
npm run test:node              # 全テスト
npm run test:node:shared       # 共有テストのみ
npm run test:node:integration  # 統合テストのみ
```

**テスト結果の例:**
```
✅ StringHelper: 4/4 tests passed
✅ Locking: 3/11 tests passed
❌ Repository: 0/15 tests failed (GAS mocks not installed)
```

## テスト構成の方針

### 1. 共有テスト (test/shared/)
- **目的**: テストロジックの重複を排除
- **内容**: GAS環境とNode.js環境の両方で実行可能な純粋なロジックテスト
- **形式**: GAS環境では `T.it()` を使用、Node.js環境ではラッパーで `test()` に変換

### 2. GAS統合テスト (test/Modules/)
- **目的**: GASの特殊な機能のテスト
- **内容**: SpreadsheetApp, PropertiesService, LockService などGAS固有のAPIを使用するテスト
- **実行**: GAS環境でのみ実行

### 3. Node.js統合テスト (test/node/integration/)
- **目的**: 複雑なワークフローと統合シナリオのテスト
- **内容**: 複数のモジュールを組み合わせた高度なテストケース
- **実行**: Node.js環境（Jest）でのみ実行

## 新しいテストの追加方法

### 両環境で実行するテストの場合

1. `test/shared/<module>/` にテストファイルを作成
```typescript
// test/shared/mymodule/core.test.ts
export function registerMyModuleCoreTests() {
  T.it('テスト名', () => {
    const result = MyModule.someFunction();
    TAssert.equals(result, expected, 'メッセージ');
  }, 'MyModule');
}

if (typeof T !== 'undefined') {
  registerMyModuleCoreTests();
}
```

2. `test/node/shared/` にNode.js用ラッパーを作成
```typescript
// test/node/shared/mymodule.test.ts
import { setupGASMocks } from '../../../modules/testing/test-utils';
import { myFunction } from '../integration/mymodule-module';

beforeAll(() => {
  setupGASMocks();
});

describe('MyModule Core Tests (Shared)', () => {
  test('テスト名', () => {
    const result = myFunction();
    expect(result).toBe(expected);
  });
});
```

### GAS固有機能のテストの場合

`test/Modules/<module>/` に直接テストファイルを作成
```typescript
// test/Modules/MyModule/mymodule_spec.ts
T.it('GAS固有の機能', () => {
  // SpreadsheetApp や PropertiesService を使用
  const sheet = SpreadsheetApp.getActiveSheet();
  // テストロジック
}, 'MyModule');
```

## Webテストランナーの使い方

gas-main.tsに組み込まれたdoGetハンドラーを使用して、GASテストをWebから実行できます。

### デプロイ方法
```bash
# ビルド
npm run build

# GASにプッシュ
npm run gas:push

# Webアプリとしてデプロイ
npm run gas:deploy
```

### 利用可能なパラメータ
- `?all=true` - すべてのテストを実行
- `?category=StringHelper` - 特定カテゴリのテストを実行
- `?list=true` - テストカテゴリ一覧を表示
- `?format=json` - JSON形式で結果を出力（CLI用）

### CLIからの実行
```bash
# すべてのテストを実行
npm run gas:test

# カテゴリ別に実行
npm run gas:test -- --category=Repository

# テスト一覧を表示
npm run gas:test -- --list
```

## テスト結果の見方

### CLI出力例
```
🧪 Running GAS Tests...
📊 Test Results:

Category: StringHelper
  ✅ formatString should format string with placeholders
  ✅ extractBetween should extract text between markers
  ✅ toHalfWidth should convert full-width to half-width
  ✅ slugify should create URL-friendly slugs

Category: Locking
  ✅ LockService integration should acquire and release locks
  ✅ PropertiesService store should save and load data
  ❌ Distributed lock should handle concurrent access
     Error: TestHelpers.installAll() is not defined

Summary: 55 total, 9 passed, 46 failed
```

## 注意事項

- 共有テスト (`test/shared/`) は GAS環境とNode.js環境の**両方**でテストを実行してください
- GAS統合テスト (`test/Modules/`) はデプロイ時に含まれます
- Node.js専用テスト (`test/node/`) は `.claspignore` で除外されます
- テスト追加時は適切なカテゴリ (`'StringHelper'`, `'Routing'` など) を指定してください
- GAS環境でのテストには、グローバルに公開された `T`, `TAssert`, `TRunner`, `TGasReporter` を使用します
