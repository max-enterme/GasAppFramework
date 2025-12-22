# GasAppFramework テストコード構成

## ディレクトリ構造

### test/shared/ - 両環境で実行可能なテストロジック
GAS と Node.js 両方で実行可能な純粋なロジックテスト。
テストコードの重複を避け、1箇所で管理。

**主なテストファイル:**
- `stringhelper/core.test.ts` - StringHelper の共通テスト
- `routing/core.test.ts` - Routing の共通テスト
- `repository/core.test.ts` - Repository の共通テスト
- `locking/core.test.ts` - Locking の共通テスト
- `gasdi/core.test.ts` - GasDI の共通テスト

### test/gas/ - GAS固有機能のテスト
SpreadsheetApp, PropertiesService, ScriptApp など、
GAS固有のサービスを使用するテスト。

**実装予定:**
- `stringhelper/utilities-format.test.ts` - GAS Utilities.formatDate のテスト
- `repository/spreadsheet.test.ts` - SpreadsheetApp 統合テスト
- `locking/properties-store.test.ts` - PropertiesService を使ったストアのテスト
- `gasdi/decorators.test.ts` - デコレータ機能のテスト
- `gas-advanced/` - ScriptApp トリガー管理などの高度な機能のテスト

### test/node/ - Node.js用テスト
- **shared/**: 共有テストのNode.js実行ラッパー（Jest形式）
  - `stringhelper.test.ts` - StringHelper 共通テストの Node.js ラッパー
  - `routing.test.ts` - Routing 共通テストの Node.js ラッパー
- **integration/**: 複雑な統合テスト（旧 test_node/ の内容）
  - `repository.engine.test.ts` - Repository エンジンの統合テスト
  - `routing.engine.test.ts` - Routing エンジンの統合テスト
  - `stringhelper.test.ts` - StringHelper の統合テスト
  - `schedule.engine.test.ts` - スケジューリングの統合テスト
  - `restframework/` - REST フレームワークのテスト
- **unit/**: Node.js固有のユニットテスト（今後追加予定）

### test/Modules/ - 既存のGASテスト（段階的に移行中）
現在の GAS 環境で実行されるテスト。
段階的に `test/shared/` と `test/gas/` に移行予定。

## テストの実行方法

### GAS環境
1. `clasp push` でデプロイ
2. GAS IDE で以下を実行：
   - `test_RunAll()` - 全テスト
   - `test_RunByCategory('StringHelper')` - カテゴリ別テスト
   - `test_ListCategories()` - カテゴリ一覧を表示

### Node.js環境
```bash
npm run test:node              # 全テスト
npm run test:node:shared       # 共有テストのみ
npm run test:node:integration  # 統合テストのみ
npm run test:node:unit         # ユニットテストのみ
```

## テスト構成の方針

### 1. 共有テスト (test/shared/)
- **目的**: テストロジックの重複を排除
- **内容**: GAS環境とNode.js環境の両方で実行可能な純粋なロジックテスト
- **形式**: GAS環境では `T.it()` を使用、Node.js環境ではラッパーで `test()` に変換

### 2. GAS固有テスト (test/gas/)
- **目的**: GASの特殊な機能のテスト
- **内容**: SpreadsheetApp, PropertiesService, ScriptApp などGAS固有のAPIを使用するテスト
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
import { setupGASMocks } from '../../../src/testing/node/test-utils';
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

`test/gas/<module>/` に直接テストファイルを作成
```typescript
// test/gas/mymodule/gas-feature.test.ts
namespace Spec_MyModule_GAS {
  T.it('GAS固有の機能', () => {
    // SpreadsheetApp や PropertiesService を使用
    const sheet = SpreadsheetApp.getActiveSheet();
    // テストロジック
  }, 'MyModule:GAS');
}
```

## マイグレーション状況

### 完了
- [x] test_node/ → test/node/integration/ への移動
- [x] ディレクトリ構造の作成
- [x] 設定ファイルの更新 (.claspignore, jest.config.cjs, package.json)
- [x] StringHelper の共通テスト作成
- [x] Routing の共通テスト作成
- [x] Repository の共通テスト作成
- [x] Locking の共通テスト作成
- [x] GasDI の共通テスト作成

### 進行中
- [ ] GAS固有テストの作成 (test/gas/)
- [ ] 既存テスト (test/Modules/) の段階的移行

### 今後の予定
- [ ] test/@entrypoint.ts の更新
- [ ] GAS環境での共有テストの動作確認
- [ ] 全既存テストの移行完了

## 利点

1. **テストコードの重複排除**: 同じロジックのテストを1箇所で管理
2. **保守性の向上**: バグ修正やテスト追加が1箇所で完結
3. **明確な役割分離**: shared/gas/node の3層構造で責務が明確
4. **実行効率の向上**: 必要なテストのみを選択的に実行可能
5. **論理的一貫性**: すべてのテストコードが `test/` 配下に統一

## 注意事項

- 共有テスト (`test/shared/`) は GAS環境とNode.js環境の**両方**でテストを実行してください
- GAS固有テスト (`test/gas/`) はデプロイ時に含まれます
- Node.js専用テスト (`test/node/`) は `.claspignore` で除外されます
- テスト追加時は適切なカテゴリ (`'StringHelper'`, `'Routing'` など) を指定してください