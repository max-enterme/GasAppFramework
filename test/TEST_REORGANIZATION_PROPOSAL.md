# テスト実行環境の再整理提案

## 現状の問題点

現在、GAS固有テストとして分類している多くのテストが、実際には**MockServicesを使用しているだけ**で、Node.js環境でも実行可能です。

## 正しい分類基準

### ❌ 誤った分類（現在）
- **GAS固有**: MockSession, MockSpreadsheetAppなどを使用するテスト
- **共通**: ビジネスロジックのみのテスト

### ✅ 正しい分類（提案）
1. **環境非依存テスト** → `test/shared/` → 両環境で実行
   - ビジネスロジック
   - **MockServicesを使用するテスト** ← これも含める！
   
2. **真のGAS専用テスト** → `test/Modules/` → GAS環境のみ
   - 実際のGASサービス（実PropertiesService、実SpreadsheetApp）に依存
   - GASランタイム固有の動作（トリガー、実行コンテキスト）
   - clasp pushが必要なテスト

## 具体例

### Node.jsでも実行可能（現在は誤ってGAS固有に分類）
```typescript
// test/Modules/Locking/locking_spec.ts
T.it('GAS PropertiesStore handles property operations correctly', () => {
    TestHelpers.GAS.installAll();  // ← これはMockのインストール！
    
    const mockProperties: { [key: string]: string } = {};
    (globalThis as any).PropertiesService = {  // ← Mock実装
        getScriptProperties: () => ({ ... })
    };
    // ... テスト
});
```
→ **これはNode.jsでも実行可能！** MockPropertiesServiceを使っているだけ

### 真にGAS専用（本当にGAS環境が必要）
```typescript
// 実際のSpreadsheetAppを使用
SpreadsheetApp.openById(REAL_SPREADSHEET_ID);

// 実際のトリガーを作成
ScriptApp.newTrigger('myFunction').timeBased().create();

// 実際のPropertiesServiceに永続化
PropertiesService.getScriptProperties().setProperty('key', 'value');
```

## 推奨される整理方針

### Phase 1: TestHelpersをNode.js環境に移植
```typescript
// modules/testing-utils/test-utils.ts に追加
export { MockLogger, MockClock } from '../testing/TestHelpers';
export { MockSession, MockSpreadsheetApp, MockPropertiesService } from '../testing/TestHelpers';
```

### Phase 2: Mockを使うテストをsharedに移行
```
test/shared/
├── gasdi/
│   ├── core.test.ts              # 既存（ビジネスロジック）
│   └── gas-services.test.ts      # NEW（MockSession等を使用）
├── locking/
│   ├── core.test.ts              # 既存（ビジネスロジック）
│   └── properties-store.test.ts  # NEW（MockPropertiesServiceを使用）
└── repository/
    ├── core.test.ts              # 既存（ビジネスロジック）
    └── spreadsheet-store.test.ts # NEW（MockSpreadsheetAppを使用）
```

### Phase 3: 真のGAS専用テストのみModulesに残す
```
test/Modules/
├── integration/                   # 実GASサービスを使用する統合テスト
│   ├── real-spreadsheet.spec.ts  # 実際のスプレッドシートを使用
│   └── real-triggers.spec.ts     # 実際のトリガーを使用
└── runtime/                      # GASランタイム固有のテスト
    └── execution-context.spec.ts # GAS実行コンテキスト依存
```

## メリット

1. **テスト実行速度向上**: Node.jsで実行できるテストが増える（GASへのデプロイ不要）
2. **CI/CD統合容易**: Node.js環境でほぼすべてのテストを実行可能
3. **開発体験向上**: ローカルでの高速フィードバックループ
4. **正確な分類**: 本当にGAS環境が必要なテストだけを明確化

## 実装優先度

### 高: すぐに実施可能
- MockLogger, MockClock → 既にNode.js環境で使用中
- MockPropertiesService → 簡単に移植可能
- Lockingのテスト → PropertiesStoreMockで実行可能

### 中: 調整が必要
- MockSpreadsheetApp → 依存関係の整理
- GasDIのテスト → デコレータ問題あり（既知）

### 低: GAS環境のまま
- 実SpreadsheetAppを使う統合テスト
- 実トリガー操作
- 実PropertiesService永続化テスト
