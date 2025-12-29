# TestRunner ログキャプチャ機能

## 概要

TestRunnerが拡張され、テスト実行中のログ出力を自動的にキャプチャし、レスポンスに含められるようになりました。

## 重要な注意事項

**GAS環境の制約**: Google Apps Script環境では`console.log`が読み取り専用プロパティのため、上書きができません。そのため、GASテストでログをキャプチャするには**`testLog()`関数**を使用する必要があります。

### GASテストでのログ記録方法

```typescript
// ❌ GAS環境では自動キャプチャされません
T.register('Example Test', 'MyCategory', () => {
    console.log('This will NOT be captured in GAS');
});

// ✅ testLog()を使用してください
T.register('Example Test', 'MyCategory', () => {
    testLog('Starting test...');
    const result = someFunction();
    testLog('Result:', result);
    TAssert.assertEquals(result, expected);
    testLog('Test completed');
});
```

### Node.js環境（ローカルテスト）

Node.js環境では`console.log`の自動キャプチャが動作します：

```typescript
// ✅ Node.js環境では自動キャプチャされます
test('Example Test', () => {
    console.log('This will be captured in Node.js tests');
});
```

### 2. JSON出力でのログ表示

`format=json`で取得した場合、各テスト結果に`logs`配列が含まれます：

```json
{
  "timestamp": "2025-12-30T...",
  "summary": {
    "total": 10,
    "passed": 10,
    "failed": 0
  },
  "results": [
    {
      "name": "Example Test",
      "category": "MyCategory",
      "ok": true,
      "ms": 15,
      "error": null,
      "logs": [
        {
          "timestamp": 1735549123456,
          "message": "Starting test..."
        },
        {
          "timestamp": 1735549123458,
          "message": "Result: 42"
        },
        {
          "timestamp": 1735549123460,
          "message": "Test completed"
        }
      ]
    }
  ]
}
```

### 3. HTML出力でのログ表示

HTML出力でも、各テストの下にログが表示されます：

```
✅ Example Test (15ms)
  📝 Console Logs (3)
    Starting test...
    Result: 42
    Test completed
```

### 4. メタデータの追加（拡張機能）

テスト結果に任意のメタデータを追加できるよう、`TestResult`型が拡張されました：

```typescript
export interface TestResult {
    name: string;
    ok: boolean;
    error?: string;
    ms: number;
    category: string;
    logs?: LogEntry[];
    metadata?: Record<string, any>;  // 任意のメタデータ
}
```

現在、`metadata`フィールドは予約されていますが、将来的にテスト登録時やRunner拡張によってカスタム情報を追加できます。

## 使用例

### CLIからのテスト実行

```bash
# JSON形式でログ付きテスト結果を取得
npm run gas:test -- --format=json

# 特定カテゴリのテストをJSON形式で実行
npm run gas:test -- --category=Repository --format=json
```

### Node.jsスクリプトでの解析

```javascript
const https = require('https');

https.get('https://your-deployment-url?format=json', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        const result = JSON.parse(data);
        
        // ログを含むテストを抽出
        const testsWithLogs = result.results.filter(t => t.logs && t.logs.length > 0);
        
        console.log(`Tests with logs: ${testsWithLogs.length}`);
        testsWithLogs.forEach(test => {
            console.log(`\n${test.name}:`);
            test.logs.forEach(log => {
                console.log(`  - ${log.message}`);
            });
        });
    });
});
```

## 実装詳細

### LogCapture モジュール

新しい`modules/testing/LogCapture.ts`モジュールが追加されました：

- `LogCapture`: ログキャプチャクラス
- `getGlobalLogCapture()`: グローバルインスタンスの取得
- `captureLogs(fn)`: 関数実行中のログをキャプチャ（同期版）
- `captureLogsAsync(fn)`: 同上（非同期版）

### Runner の変更

`runAll()`と`runByCategory()`が更新され、各テスト実行前後でログキャプチャを自動的に行います：

```typescript
const logCapture = getGlobalLogCapture();
logCapture.clear();
logCapture.start();

try {
    c.fn();
    const logs = logCapture.getLogs();
    logCapture.stop();
    // logsをTestResultに含める
} catch (e) {
    // エラー時もlogsを含める
}
```

### HtmlReporter の変更

- `toJson()`: JSON出力にログとメタデータを含めるよう更新
- `formatTestItem()`: HTML出力にログセクションを追加
- CSS: ログ表示用のスタイルを追加

## 注意事項

1. **パフォーマンス**: ログキャプチャは各テストごとに個別に行われるため、大量のログ出力があるテストでは若干のオーバーヘッドがあります。

2. **ログの保持**: ログは元の`console.log`にも出力されます（完全な置き換えではなくラップ）。

3. **GAS環境**: Google Apps Script環境では`Logger.log`も使用可能ですが、このキャプチャは`console.log`のみ対象です。

## 今後の拡張案

1. **Logger.logのサポート**: GAS固有の`Logger.log`もキャプチャ
2. **メタデータAPI**: テスト登録時にメタデータを指定できるAPI
3. **ログレベル**: info/warn/errorなど、ログレベルの区別
4. **フィルタリング**: ログ量が多い場合のフィルタリング機能
