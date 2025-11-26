# EventSystem モジュール

Google Apps Script アプリケーション向けの包括的なイベントシステム。Cronジョブスケジューリング、トリガー管理、ワークフロー自動化をタイムゾーン正規化とともに提供します。

## 機能

- **Cronジョブ**: Cron式による定期タスクのスケジューリング
- **トリガー**: GASトリガーとイベントの処理
- **ワークフロー**: チェックポイント付きマルチステップワークフロー自動化
- **タイムゾーンサポート**: 適切なタイムゾーン処理と正規化
- **ロック管理**: 同時実行競合の防止

## 主要API

### Schedule Engine
```typescript
// Cronジョブスケジューラーの作成
const scheduler = EventSystem.Schedule.create({
    jobStore: new EventSystem.Adapters.GAS.SpreadsheetJobStore(sheetId, 'jobs'),
    checkpoint: new EventSystem.Adapters.GAS.ScriptPropertiesCheckpoint(),
    lock: new EventSystem.Adapters.GAS.ScriptLockFactory(),
    invoker: new EventSystem.Adapters.GAS.GlobalInvoker(),
    scheduler: myCronScheduler, // EventSystem.Ports.Schedulerを実装
    clock: new EventSystem.Adapters.GAS.SystemClock(),
    logger: new EventSystem.Adapters.GAS.GasLogger()
})

// スケジュールされたジョブの実行
scheduler.run()

// 特定のジョブを即座に実行
scheduler.runNow('job-id')
```

### Trigger Engine  
```typescript
// GASトリガーの処理
const triggerEngine = EventSystem.Trigger.create({
    jobStore: new EventSystem.Adapters.GAS.SpreadsheetJobStore(sheetId, 'triggers'),
    checkpoint: new EventSystem.Adapters.GAS.ScriptPropertiesCheckpoint(),
    lock: new EventSystem.Adapters.GAS.ScriptLockFactory(),
    invoker: new EventSystem.Adapters.GAS.GlobalInvoker(),
    scheduler: myCronScheduler, // EventSystem.Ports.Schedulerを実装
    clock: new EventSystem.Adapters.GAS.SystemClock(),
    logger: new EventSystem.Adapters.GAS.GasLogger()
})

// トリガーイベントの処理（GAS時間駆動トリガーから呼び出し）
triggerEngine.tick()
```

### Workflow Engine
```typescript
// ワークフローエンジンの作成
const workflowEngine = EventSystem.Workflow.create({
    defs: new EventSystem.Adapters.GAS.SpreadsheetDefinitionStore(sheetId, 'workflows', 'steps'),
    inst: new EventSystem.Adapters.GAS.ScriptPropertiesInstanceStore(),
    invoker: new EventSystem.Adapters.GAS.GlobalInvoker(),
    enq: new EventSystem.Adapters.GAS.OneTimeTriggerEnqueuer(),
    clock: new EventSystem.Adapters.GAS.SystemClock(),
    logger: new EventSystem.Adapters.GAS.GasLogger()
})

// ワークフローの開始
const instanceId = workflowEngine.start('workflow-id', '{"data":"payload"}')

// ワークフローの再開
workflowEngine.resume(instanceId)
```

## 使用例

### 基本的なCronジョブ
```typescript
// スプレッドシートでジョブを定義:
// id: daily-backup, handler: performBackup, cron: 0 2 * * *, enabled: true

function performBackup(ctx: any) {
    console.log('日次バックアップを実行中...')
    // バックアップロジック
}

// 時間駆動トリガーで:
function onSchedule() {
    scheduler.run()
}
```

### マルチステップワークフロー
```typescript
// スプレッドシートでワークフローを定義:
// ワークフロー: user-onboarding
// ステップ: [sendWelcome, setupAccount, sendGuidance]

function sendWelcome(ctx: any) {
    const { email } = JSON.parse(ctx.payloadJson)
    // ウェルカムメール送信
}

function setupAccount(ctx: any) {
    const { userId } = JSON.parse(ctx.payloadJson)
    // ユーザーアカウント設定
}

function sendGuidance(ctx: any) {
    const { userId } = JSON.parse(ctx.payloadJson)
    // ガイダンス資料送信
}
```

## テスト戦略

### 単体テスト (Node.js)
```typescript
// 分離テストのための依存関係モック
const mockJobStore = {
    load: jest.fn().mockReturnValue([
        { id: 'test-job', handler: 'testHandler', cron: '0 * * * *', enabled: true, multi: false }
    ])
}
const mockCheckpoint = {
    get: jest.fn().mockReturnValue(null),
    set: jest.fn()
}
const mockLock = {
    acquire: jest.fn().mockReturnValue({
        tryWait: jest.fn().mockReturnValue(true),
        release: jest.fn()
    })
}
const mockScheduler = {
    occurrences: jest.fn().mockReturnValue([new Date()]),
    isDue: jest.fn().mockReturnValue(true)
}
const mockInvoker = {
    invoke: jest.fn()
}
const mockClock = {
    now: jest.fn().mockReturnValue(new Date())
}

const engine = EventSystem.Schedule.create({
    jobStore: mockJobStore,
    checkpoint: mockCheckpoint,
    lock: mockLock,
    invoker: mockInvoker,
    scheduler: mockScheduler,
    clock: mockClock
})

engine.run()
expect(mockInvoker.invoke).toHaveBeenCalled()
```

### 統合テスト (GAS)
```typescript
// 実際のGASサービスでのテスト
function test_ScheduleEngine() {
    const engine = EventSystem.Schedule.create({
        jobStore: new EventSystem.Adapters.GAS.SpreadsheetJobStore(TEST_SHEET_ID, 'jobs'),
        checkpoint: new EventSystem.Adapters.GAS.ScriptPropertiesCheckpoint(),
        lock: new EventSystem.Adapters.GAS.ScriptLockFactory(),
        invoker: new EventSystem.Adapters.GAS.GlobalInvoker(),
        scheduler: myCronScheduler,
        clock: new EventSystem.Adapters.GAS.SystemClock()
    })
    
    engine.run()
    // ログでジョブ実行を検証
}
```

### テストデータ設定
サンプルデータを含むテスト用スプレッドシートを作成:
- Jobsシート: id, handler, cron, enabled, tz, paramsJson, multi
- Workflowsシート: id, name, enabled, defaultTz  
- Stepsシート: workflowId, index, handler, paramsJson, timeoutMs
- Instancesシート: instanceId, workflowId, cursor, done

## 設定

### 必要なGASサービス
- SpreadsheetApp (ジョブ/ワークフロー保存用)
- ScriptApp (トリガー管理用)
- PropertiesService (チェックポイント用)
- LockService (同時実行制御用)

### スプレッドシートスキーマ
必要な列レイアウトとサンプルデータについては、テスト用スプレッドシートを参照してください。