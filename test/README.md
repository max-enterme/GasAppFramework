# テストコード構成

## ディレクトリ構造

```
test/
├── gas/              # GAS統合テスト（SpreadsheetApp等）
│   ├── di_spec.ts
│   ├── locking_spec.ts
│   ├── spreadsheet_spec.ts
│   └── gas_advanced_spec.ts
├── shared/           # 両環境共通テスト
│   ├── gasdi/
│   ├── locking/
│   ├── repository/
│   ├── routing/
│   └── stringhelper/
└── node/             # Node.js専用テスト
    ├── shared/       # Jestラッパー
    └── integration/  # 統合テスト
```

## テスト実行

### Node.js環境
```bash
npm test                      # 全テスト
npm run test:node:shared      # 共有テストのみ
npm run test:node:integration # 統合テストのみ
```

### GAS環境
```bash
npm run gas:test                    # HEAD deployment
npm run gas:test -- --target        # Target deployment
npm run gas:test -- --category=Repository
npm run gas:test -- --list          # カテゴリ一覧
```

## テスト構成の方針

### 1. 共有テスト (test/shared/)
両環境で実行可能な純粋ロジックテスト。GASでは`T.it()`、Node.jsではJestラッパーで実行。

### 2. GAS統合テスト (test/gas/)
SpreadsheetApp、PropertiesService、LockServiceなどGAS固有APIのテスト。GAS環境でのみ実行。

### 3. Node.js統合テスト (test/node/integration/)
複雑なワークフローと統合シナリオ。Jest環境でのみ実行。
