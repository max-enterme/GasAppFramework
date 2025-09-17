# Locking Module

Distributed locking mechanisms for Google Apps Script applications, providing concurrency control and resource synchronization across multiple execution contexts.

## Features

- **Read/Write Locks**: Support for shared read locks and exclusive write locks
- **Token-based Locking**: Unique tokens for lock identification and release
- **TTL Expiration**: Automatic lock expiration to prevent deadlocks
- **Conflict Detection**: Proper handling of lock conflicts and retries
- **Storage Abstraction**: Pluggable storage backends (PropertiesService, etc.)
- **Garbage Collection**: Automatic cleanup of expired locks

## Main APIs

### Lock Engine Creation
```typescript
// Create lock engine with dependencies
const lockEngine = Locking.Engine.create({
    store: new Locking.Adapters.GAS.PropertiesStore(),
    clock: { now: () => new Date() },
    logger: console,
    namespace: 'myapp:'
})
```

### Acquiring Locks
```typescript
// Acquire exclusive write lock
const writeResult = lockEngine.acquire('resource-id', 'write', {
    owner: 'user123',
    ttlMs: 30000 // 30 seconds
})

if (writeResult.success) {
    try {
        // Perform exclusive operations
        console.log('Lock token:', writeResult.token)
        performCriticalOperation()
    } finally {
        // Always release the lock
        lockEngine.release(writeResult.token!)
    }
}

// Acquire shared read lock
const readResult = lockEngine.acquire('resource-id', 'read', {
    owner: 'user456',
    ttlMs: 10000 // 10 seconds
})

if (readResult.success) {
    try {
        // Perform read operations (multiple readers allowed)
        const data = readResource()
        console.log('Read data:', data)
    } finally {
        lockEngine.release(readResult.token!)
    }
}
```

### Lock Status and Management
```typescript
// Check lock status
const status = lockEngine.status('resource-id')
console.log('Locked:', status.locked)
console.log('Mode:', status.mode) // 'r' or 'w'
console.log('Owners:', status.owners)

// List all active locks
const allLocks = lockEngine.listAll()
for (const [resourceId, info] of Object.entries(allLocks)) {
    console.log(`Resource: ${resourceId}, Mode: ${info.mode}, Owners: ${info.owners}`)
}

// Force release all locks (admin operation)
lockEngine.releaseAll()
```

## Usage Examples

### Critical Section Protection
```typescript
async function updateSpreadsheetSafely(sheetId: string, data: any[]) {
    const lockEngine = Locking.Engine.create({
        store: new Locking.Adapters.GAS.PropertiesStore(),
        clock: { now: () => new Date() }
    })
    
    const lockResult = lockEngine.acquire(`sheet:${sheetId}`, 'write', {
        owner: Session.getActiveUser().getEmail(),
        ttlMs: 60000 // 1 minute
    })
    
    if (!lockResult.success) {
        throw new Error('Could not acquire write lock for spreadsheet')
    }
    
    try {
        // Perform atomic spreadsheet update
        const sheet = SpreadsheetApp.openById(sheetId)
        const range = sheet.getDataRange()
        range.setValues(data)
        
        console.log('Spreadsheet updated successfully')
    } finally {
        lockEngine.release(lockResult.token!)
    }
}
```

### Reader-Writer Pattern
```typescript
class DataCache {
    private lockEngine: any
    private cacheKey: string
    
    constructor(cacheKey: string) {
        this.cacheKey = cacheKey
        this.lockEngine = Locking.Engine.create({
            store: new Locking.Adapters.GAS.PropertiesStore(),
            clock: { now: () => new Date() }
        })
    }
    
    // Multiple readers can access data simultaneously
    read(): any {
        const lockResult = this.lockEngine.acquire(this.cacheKey, 'read', {
            owner: 'reader',
            ttlMs: 30000
        })
        
        if (!lockResult.success) {
            throw new Error('Could not acquire read lock')
        }
        
        try {
            const data = PropertiesService.getScriptProperties().getProperty(this.cacheKey)
            return data ? JSON.parse(data) : null
        } finally {
            this.lockEngine.release(lockResult.token!)
        }
    }
    
    // Exclusive writer access
    write(data: any): void {
        const lockResult = this.lockEngine.acquire(this.cacheKey, 'write', {
            owner: 'writer',
            ttlMs: 60000
        })
        
        if (!lockResult.success) {
            throw new Error('Could not acquire write lock')
        }
        
        try {
            PropertiesService.getScriptProperties().setProperty(
                this.cacheKey,
                JSON.stringify(data)
            )
        } finally {
            this.lockEngine.release(lockResult.token!)
        }
    }
}

// Usage
const cache = new DataCache('user-data')

// Multiple readers can run concurrently
const userData1 = cache.read()
const userData2 = cache.read()

// Writer gets exclusive access
cache.write({ users: [...] })
```

### Retry with Exponential Backoff
```typescript
function acquireLockWithRetry(resourceId: string, mode: 'read' | 'write', maxRetries = 5) {
    const lockEngine = Locking.Engine.create({
        store: new Locking.Adapters.GAS.PropertiesStore(),
        clock: { now: () => new Date() }
    })
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
        const result = lockEngine.acquire(resourceId, mode, {
            owner: 'service',
            ttlMs: 30000
        })
        
        if (result.success) {
            return result.token!
        }
        
        // Exponential backoff
        const delayMs = Math.min(1000 * Math.pow(2, attempt), 10000)
        console.log(`Lock acquisition failed, retrying in ${delayMs}ms...`)
        Utilities.sleep(delayMs)
    }
    
    throw new Error(`Failed to acquire ${mode} lock after ${maxRetries} attempts`)
}

// Usage
try {
    const token = acquireLockWithRetry('critical-resource', 'write')
    try {
        // Perform critical operation
    } finally {
        lockEngine.release(token)
    }
} catch (error) {
    console.error('Could not acquire lock:', error.message)
}
```

### Lock Monitoring and Diagnostics
```typescript
class LockMonitor {
    private lockEngine: any
    
    constructor() {
        this.lockEngine = Locking.Engine.create({
            store: new Locking.Adapters.GAS.PropertiesStore(),
            clock: { now: () => new Date() },
            logger: console
        })
    }
    
    // Monitor lock usage across application
    reportLockStatus(): void {
        const allLocks = this.lockEngine.listAll()
        const lockCount = Object.keys(allLocks).length
        
        console.log(`Total active locks: ${lockCount}`)
        
        for (const [resourceId, info] of Object.entries(allLocks)) {
            console.log(`Resource: ${resourceId}`)
            console.log(`  Mode: ${info.mode}`)
            console.log(`  Owners: ${info.owners.join(', ')}`)
            console.log(`  Entries: ${info.count}`)
        }
    }
    
    // Clean up stuck locks (admin function)
    cleanupStaleLocks(): void {
        console.log('Cleaning up stale locks...')
        this.lockEngine.releaseAll()
        console.log('All locks released')
    }
    
    // Check if resource is available
    isResourceAvailable(resourceId: string, mode: 'read' | 'write'): boolean {
        const status = this.lockEngine.status(resourceId)
        
        if (!status.locked) {
            return true // No locks, available
        }
        
        if (mode === 'read' && status.mode === 'r') {
            return true // Read lock requested, read locks exist (shared)
        }
        
        return false // Write lock exists or write lock requested with any locks
    }
}
```

## Testing Strategy

### Unit Tests (Node.js)
```typescript
describe('Locking Engine', () => {
    let lockEngine: any
    let mockStore: any
    let mockClock: any
    
    beforeEach(() => {
        mockStore = {
            get: jest.fn(),
            set: jest.fn()
        }
        
        mockClock = {
            now: jest.fn().mockReturnValue(new Date('2023-01-01T00:00:00Z'))
        }
        
        lockEngine = Locking.Engine.create({
            store: mockStore,
            clock: mockClock
        })
    })
    
    test('should acquire write lock successfully', () => {
        mockStore.get.mockReturnValue(null) // No existing locks
        
        const result = lockEngine.acquire('resource1', 'write', {
            owner: 'user1',
            ttlMs: 30000
        })
        
        expect(result.success).toBe(true)
        expect(result.token).toBeDefined()
        expect(mockStore.set).toHaveBeenCalled()
    })
    
    test('should allow multiple read locks', () => {
        // First read lock
        mockStore.get.mockReturnValue(null)
        const result1 = lockEngine.acquire('resource1', 'read', { owner: 'user1' })
        expect(result1.success).toBe(true)
        
        // Second read lock on same resource
        mockStore.get.mockReturnValue(JSON.stringify({
            version: 1,
            entries: [{
                token: result1.token,
                owner: 'user1',
                mode: 'r',
                expireMs: Date.now() + 30000
            }]
        }))
        
        const result2 = lockEngine.acquire('resource1', 'read', { owner: 'user2' })
        expect(result2.success).toBe(true)
    })
    
    test('should reject write lock when read locks exist', () => {
        mockStore.get.mockReturnValue(JSON.stringify({
            version: 1,
            entries: [{
                token: 'existing-read-token',
                owner: 'user1',
                mode: 'r',
                expireMs: Date.now() + 30000
            }]
        }))
        
        const result = lockEngine.acquire('resource1', 'write', { owner: 'user2' })
        expect(result.success).toBe(false)
    })
})
```

### Integration Tests (GAS)
```typescript
function test_LockingWithPropertiesService() {
    const lockEngine = Locking.Engine.create({
        store: new Locking.Adapters.GAS.PropertiesStore(),
        clock: { now: () => new Date() }
    })
    
    // Test acquiring and releasing locks
    const token = lockEngine.acquire('test-resource', 'write', {
        owner: 'test-user',
        ttlMs: 30000
    })
    
    if (token.success) {
        console.log('Write lock acquired:', token.token)
        
        // Verify lock status
        const status = lockEngine.status('test-resource')
        console.log('Lock status:', status)
        
        // Release lock
        const released = lockEngine.release(token.token!)
        console.log('Lock released:', released)
    } else {
        console.log('Failed to acquire lock')
    }
}
```

### Concurrency Tests
```typescript
test('should handle concurrent lock acquisition', async () => {
    const lockEngine = Locking.Engine.create({
        store: new MockConcurrentStore(),
        clock: { now: () => new Date() }
    })
    
    const promises = []
    
    // Try to acquire same lock concurrently
    for (let i = 0; i < 10; i++) {
        promises.push(
            lockEngine.acquire('resource1', 'write', { owner: `user${i}` })
        )
    }
    
    const results = await Promise.all(promises)
    const successful = results.filter(r => r.success)
    
    // Only one should succeed
    expect(successful).toHaveLength(1)
})
```

## Configuration

### Lock Modes
- **Read ('r')**: Shared locks, multiple readers allowed
- **Write ('w')**: Exclusive locks, single writer only

### TTL and Expiration
- Default TTL: 30 seconds
- Automatic garbage collection of expired locks
- Prevents deadlocks from crashed processes

### Storage Backends
- **PropertiesService**: Default GAS storage
- **Memory**: For testing and development
- **Custom**: Implement `Locking.Ports.Store` interface

### Best Practices
- Always use try/finally blocks to ensure lock release
- Set appropriate TTL values for your use case
- Use read locks for read-only operations
- Implement retry logic with exponential backoff
- Monitor lock usage in production environments