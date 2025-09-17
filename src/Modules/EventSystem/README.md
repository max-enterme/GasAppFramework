# EventSystem Module

A comprehensive event system for Google Apps Script applications, providing cron job scheduling, trigger management, and workflow automation with timezone normalization.

## Features

- **Cron Jobs**: Schedule recurring tasks with cron expressions
- **Triggers**: Handle GAS triggers and events  
- **Workflows**: Multi-step workflow automation with checkpoints
- **Timezone Support**: Proper timezone handling and normalization
- **Lock Management**: Prevent concurrent execution conflicts

## Main APIs

### Schedule Engine
```typescript
// Create cron job scheduler
const scheduler = Schedule.Engine.create({
    jobStore: new EventSystem.Adapters.GAS.SpreadsheetJobStore(sheetId, 'jobs'),
    checkpointStore: new EventSystem.Adapters.GAS.PropertiesCheckpointStore(),
    lockFactory: new Locking.Adapters.GAS.LockServiceFactory(),
    invoker: new EventSystem.Adapters.GAS.GlobalInvoker(),
    scheduler: new EventSystem.Adapters.GAS.CronScheduler(),
    clock: { now: () => new Date() },
    logger: console
})

// Run scheduled jobs
scheduler.run()
```

### Trigger Engine  
```typescript
// Handle GAS triggers
const triggerEngine = Trigger.Engine.create({
    jobStore: new EventSystem.Adapters.GAS.SpreadsheetJobStore(sheetId, 'triggers'),
    invoker: new EventSystem.Adapters.GAS.GlobalInvoker(),
    clock: { now: () => new Date() },
    logger: console
})

// Process trigger event
triggerEngine.onTrigger(e)
```

### Workflow Engine
```typescript
// Create workflow engine
const workflowEngine = Workflow.Engine.create({
    definitionStore: new EventSystem.Adapters.GAS.SpreadsheetDefinitionStore(sheetId, 'workflows', 'steps'),
    instanceStore: new EventSystem.Adapters.GAS.SpreadsheetInstanceStore(sheetId, 'instances'),
    invoker: new EventSystem.Adapters.GAS.GlobalInvoker(),
    enqueuer: new EventSystem.Adapters.GAS.ScriptTriggerEnqueuer(),
    clock: { now: () => new Date() },
    logger: console
})

// Start workflow
workflowEngine.start('workflow-id', { data: 'payload' })

// Resume workflow  
workflowEngine.resume('instance-id')
```

## Usage Examples

### Basic Cron Job
```typescript
// Define job in spreadsheet:
// id: daily-backup, handler: performBackup, cron: 0 2 * * *, enabled: true

function performBackup(ctx: any) {
    console.log('Running daily backup...')
    // Backup logic here
}

// In time-driven trigger:
function onSchedule() {
    scheduler.run()
}
```

### Workflow with Multiple Steps
```typescript
// Define workflow in spreadsheet:
// Workflow: user-onboarding
// Steps: [sendWelcome, setupAccount, sendGuidance]

function sendWelcome(ctx: any) {
    const { email } = JSON.parse(ctx.payloadJson)
    // Send welcome email
}

function setupAccount(ctx: any) {
    const { userId } = JSON.parse(ctx.payloadJson)
    // Setup user account
}

function sendGuidance(ctx: any) {
    const { userId } = JSON.parse(ctx.payloadJson)
    // Send guidance materials
}
```

## Testing Strategy

### Unit Tests (Node.js)
```typescript
// Mock dependencies for isolated testing
const mockJobStore = {
    load: jest.fn().mockReturnValue([
        { id: 'test-job', handler: 'testHandler', cron: '0 * * * *', enabled: true }
    ])
}

const engine = Schedule.Engine.create({
    jobStore: mockJobStore,
    // ... other mocked dependencies
})
```

### Integration Tests (GAS)
```typescript
// Test with real GAS services
function test_ScheduleEngine() {
    const engine = Schedule.Engine.create({
        jobStore: new EventSystem.Adapters.GAS.SpreadsheetJobStore(TEST_SHEET_ID, 'jobs'),
        // ... real GAS adapters
    })
    
    engine.run()
    // Verify job execution
}
```

### Test Data Setup
Create test spreadsheets with sample data:
- Jobs sheet: id, handler, cron, enabled, tz
- Workflows sheet: id, name, enabled, defaultTz  
- Steps sheet: workflowId, index, handler, paramsJson
- Instances sheet: instanceId, workflowId, cursor, done

## Configuration

### Required GAS Services
- SpreadsheetApp (for job/workflow storage)
- ScriptApp (for trigger management)
- PropertiesService (for checkpoints)
- LockService (for concurrency control)

### Spreadsheet Schema
See test spreadsheets for required column layouts and sample data.
