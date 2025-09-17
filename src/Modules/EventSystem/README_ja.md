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
const scheduler = Schedule.Engine.create({
    jobStore: new EventSystem.Adapters.GAS.SpreadsheetJobStore(sheetId, 'jobs'),
    checkpointStore: new EventSystem.Adapters.GAS.PropertiesCheckpointStore(),
    lockFactory: new Locking.Adapters.GAS.LockServiceFactory(),
    invoker: new EventSystem.Adapters.GAS.GlobalInvoker(),
    scheduler: new EventSystem.Adapters.GAS.CronScheduler(),
    clock: { now: () => new Date() },
    logger: console
})

// スケジュールされたジョブの実行
scheduler.run()
```

### Trigger Engine  
```typescript
// GASトリガーの処理
const triggerEngine = Trigger.Engine.create({
    jobStore: new EventSystem.Adapters.GAS.SpreadsheetJobStore(sheetId, 'triggers'),
    invoker: new EventSystem.Adapters.GAS.GlobalInvoker(),
    clock: { now: () => new Date() },
    logger: console
})

// トリガーイベントの処理
triggerEngine.onTrigger(e)
```

### Workflow Engine
```typescript
// ワークフローエンジンの作成
const workflowEngine = Workflow.Engine.create({
    definitionStore: new EventSystem.Adapters.GAS.SpreadsheetDefinitionStore(sheetId, 'workflows', 'steps'),
    instanceStore: new EventSystem.Adapters.GAS.SpreadsheetInstanceStore(sheetId, 'instances'),
    invoker: new EventSystem.Adapters.GAS.GlobalInvoker(),
    enqueuer: new EventSystem.Adapters.GAS.ScriptTriggerEnqueuer(),
    clock: { now: () => new Date() },
    logger: console
})

// ワークフローの開始
workflowEngine.start('workflow-id', { data: 'payload' })

// ワークフローの再開
workflowEngine.resume('instance-id')
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
        { id: 'test-job', handler: 'testHandler', cron: '0 * * * *', enabled: true }
    ])
}

const engine = Schedule.Engine.create({
    jobStore: mockJobStore,
    // ... その他のモック依存関係
})
```

### 統合テスト (GAS)
```typescript
// 実際のGASサービスでのテスト
function test_ScheduleEngine() {
    const engine = Schedule.Engine.create({
        jobStore: new EventSystem.Adapters.GAS.SpreadsheetJobStore(TEST_SHEET_ID, 'jobs'),
        // ... 実際のGASアダプター
    })
    
    engine.run()
    // ジョブ実行の検証
}
```

### テストデータ設定
サンプルデータを含むテスト用スプレッドシートを作成:
- Jobsシート: id, handler, cron, enabled, tz
- Workflowsシート: id, name, enabled, defaultTz  
- Stepsシート: workflowId, index, handler, paramsJson
- Instancesシート: instanceId, workflowId, cursor, done

## 設定

### 必要なGASサービス
- SpreadsheetApp (ジョブ/ワークフロー保存用)
- ScriptApp (トリガー管理用)
- PropertiesService (チェックポイント用)
- LockService (同時実行制御用)

### スプレッドシートスキーマ
必要な列レイアウトとサンプルデータについては、テスト用スプレッドシートを参照してください。