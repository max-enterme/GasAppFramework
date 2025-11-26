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
const scheduler = EventSystem.Schedule.create({
    jobStore: new EventSystem.Adapters.GAS.SpreadsheetJobStore(sheetId, 'jobs'),
    checkpoint: new EventSystem.Adapters.GAS.ScriptPropertiesCheckpoint(),
    lock: new EventSystem.Adapters.GAS.ScriptLockFactory(),
    invoker: new EventSystem.Adapters.GAS.GlobalInvoker(),
    scheduler: myCronScheduler, // implements EventSystem.Ports.Scheduler
    clock: new EventSystem.Adapters.GAS.SystemClock(),
    logger: new EventSystem.Adapters.GAS.GasLogger()
})

// Run scheduled jobs
scheduler.run()

// Run a specific job immediately
scheduler.runNow('job-id')
```

### Trigger Engine  
```typescript
// Handle GAS triggers
const triggerEngine = EventSystem.Trigger.create({
    jobStore: new EventSystem.Adapters.GAS.SpreadsheetJobStore(sheetId, 'triggers'),
    checkpoint: new EventSystem.Adapters.GAS.ScriptPropertiesCheckpoint(),
    lock: new EventSystem.Adapters.GAS.ScriptLockFactory(),
    invoker: new EventSystem.Adapters.GAS.GlobalInvoker(),
    scheduler: myCronScheduler, // implements EventSystem.Ports.Scheduler
    clock: new EventSystem.Adapters.GAS.SystemClock(),
    logger: new EventSystem.Adapters.GAS.GasLogger()
})

// Process trigger event (called from GAS time-driven trigger)
triggerEngine.tick()
```

### Workflow Engine
```typescript
// Create workflow engine
const workflowEngine = EventSystem.Workflow.create({
    defs: new EventSystem.Adapters.GAS.SpreadsheetDefinitionStore(sheetId, 'workflows', 'steps'),
    inst: new EventSystem.Adapters.GAS.ScriptPropertiesInstanceStore(),
    invoker: new EventSystem.Adapters.GAS.GlobalInvoker(),
    enq: new EventSystem.Adapters.GAS.OneTimeTriggerEnqueuer(),
    clock: new EventSystem.Adapters.GAS.SystemClock(),
    logger: new EventSystem.Adapters.GAS.GasLogger()
})

// Start workflow
const instanceId = workflowEngine.start('workflow-id', '{"data":"payload"}')

// Resume workflow  
workflowEngine.resume(instanceId)
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

### Integration Tests (GAS)
```typescript
// Test with real GAS services
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
    // Verify job execution in logs
}
```

### Test Data Setup
Create test spreadsheets with sample data:
- Jobs sheet: id, handler, cron, enabled, tz, paramsJson, multi
- Workflows sheet: id, name, enabled, defaultTz  
- Steps sheet: workflowId, index, handler, paramsJson, timeoutMs
- Instances sheet: instanceId, workflowId, cursor, done

## Configuration

### Required GAS Services
- SpreadsheetApp (for job/workflow storage)
- ScriptApp (for trigger management)
- PropertiesService (for checkpoints)
- LockService (for concurrency control)

### Spreadsheet Schema
See test spreadsheets for required column layouts and sample data.
