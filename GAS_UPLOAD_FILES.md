# GASアップロードファイル構成

clasp pushでGASにアップロードされるファイル：

## 1. バンドルファイル（モジュール実装）

### `build/0_main.js` (58KB)
- フレームワーク本体（DI, Locking, Repository等）
- 全モジュールをバンドル
- GASエディタでは参照されない（内部ライブラリ）

### `build/1_tests.js` (55KB)  
- 全テストモジュールをバンドル
- テストフレームワーク含む
- GASエディタでは参照されない（内部ライブラリ）

## 2. エントリポイントファイル（実行用）

### `test-entry.ts` (3.1KB)
- **GASエディタで実行する関数のみ**
- バンドルされていないシンプルなTypeScriptファイル
- エディタ上で表示・編集可能

#### 利用可能な関数：
```javascript
test_RunAll()              // すべてのテストを実行
test_RunByCategory('GasDI') // カテゴリ別テスト実行
test_ListCategories()      // カテゴリ一覧表示
test_ShowVersion()         // バージョン情報表示
```

## ファイル依存関係

```
test-entry.ts (エントリポイント)
    ↓ 参照
1_tests.js (テストバンドル)
    ↓ 参照  
0_main.js (フレームワークバンドル)
```

## デプロイ方法

```bash
npm run build  # バンドル生成
clasp push     # GASにアップロード
```

GASエディタで`test-entry.ts`を開き、関数を実行。
