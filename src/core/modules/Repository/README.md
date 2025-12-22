# Repository Module

Type-safe data persistence abstraction for Google Apps Script applications, providing schema-based entity validation, key encoding/decoding, and upsert operations with change tracking.

## Features

- **Schema-based Validation**: Define entity schemas with type safety
- **Key Encoding/Decoding**: Handle complex composite keys
- **Multiple Storage Backends**: Google Sheets and in-memory adapters
- **Change Tracking**: Track entity changes and optimize updates
- **Upsert Operations**: Intelligent insert/update operations
- **Type Safety**: Full TypeScript support with branded types

## Main APIs

### Repository Creation
```typescript
// Define entity schema
const userSchema: Repository.Ports.Schema<User, 'id'> = {
    parameters: ['id', 'name', 'email', 'createdAt'],
    keyParameters: ['id'],
    instantiate: () => ({ id: '', name: '', email: '', createdAt: new Date() }),
    fromPartial: (p) => ({
        id: p.id || '',
        name: p.name || '',
        email: p.email || '',
        createdAt: p.createdAt || new Date()
    })
}

// Create repository with Google Sheets backend
const userRepo = Repository.Engine.create({
    schema: userSchema,
    store: new Repository.Adapters.GAS.Spreadsheet.Store(SHEET_ID),
    keyCodec: Repository.Codec.simple()
})
```

### CRUD Operations
```typescript
// Load all entities
userRepo.load()

// Find entity by key
const user = userRepo.find({ id: 'user123' })

// Upsert (insert or update)
userRepo.upsert({ 
    id: 'user123', 
    name: 'John Doe', 
    email: 'john@example.com',
    createdAt: new Date()
})

// Delete entity
userRepo.delete({ id: 'user123' })

// Get all entities
const allUsers = userRepo.getAll()

// Check if entity exists
const exists = userRepo.has({ id: 'user123' })
```

### Change Tracking
```typescript
// Get tracked changes
const changes = userRepo.getChanges()
console.log('Added:', changes.added.length)
console.log('Updated:', changes.updated.length) 
console.log('Deleted:', changes.deleted.length)

// Commit changes to storage
userRepo.commit()

// Rollback uncommitted changes
userRepo.rollback()
```

## Usage Examples

### Basic Entity Management
```typescript
interface Product {
    id: string
    name: string
    price: number
    category: string
}

const productSchema: Repository.Ports.Schema<Product, 'id'> = {
    parameters: ['id', 'name', 'price', 'category'],
    keyParameters: ['id'],
    instantiate: () => ({ id: '', name: '', price: 0, category: '' }),
    fromPartial: (p) => ({
        id: p.id || '',
        name: p.name || '',
        price: p.price || 0,
        category: p.category || ''
    })
}

const productRepo = Repository.Engine.create({
    schema: productSchema,
    store: new Repository.Adapters.GAS.Spreadsheet.Store(PRODUCTS_SHEET_ID),
    keyCodec: Repository.Codec.simple()
})

// Add products
productRepo.upsert({ id: 'p1', name: 'Laptop', price: 999, category: 'Electronics' })
productRepo.upsert({ id: 'p2', name: 'Mouse', price: 25, category: 'Electronics' })

// Find products
const laptop = productRepo.find({ id: 'p1' })
const allProducts = productRepo.getAll()
```

### Composite Keys
```typescript
interface OrderItem {
    orderId: string
    productId: string
    quantity: number
    price: number
}

const orderItemSchema: Repository.Ports.Schema<OrderItem, 'orderId' | 'productId'> = {
    parameters: ['orderId', 'productId', 'quantity', 'price'],
    keyParameters: ['orderId', 'productId'],
    instantiate: () => ({ orderId: '', productId: '', quantity: 0, price: 0 }),
    fromPartial: (p) => ({
        orderId: p.orderId || '',
        productId: p.productId || '',
        quantity: p.quantity || 0,
        price: p.price || 0
    })
}

const orderItemRepo = Repository.Engine.create({
    schema: orderItemSchema,
    store: new Repository.Adapters.GAS.Spreadsheet.Store(ORDER_ITEMS_SHEET_ID),
    keyCodec: Repository.Codec.simple('|') // Custom delimiter
})

// Add order items with composite keys
orderItemRepo.upsert({ orderId: 'ord1', productId: 'p1', quantity: 2, price: 999 })

// Find by composite key
const item = orderItemRepo.find({ orderId: 'ord1', productId: 'p1' })
```

### Memory Adapter for Testing
```typescript
// Use in-memory adapter for unit tests
const testRepo = Repository.Engine.create({
    schema: userSchema,
    store: new Repository.Adapters.Memory.Store(),
    keyCodec: Repository.Codec.simple()
})

// Test operations without Google Sheets
testRepo.upsert({ id: 'test1', name: 'Test User', email: 'test@example.com' })
expect(testRepo.has({ id: 'test1' })).toBe(true)
```

## Testing Strategy

### Unit Tests (Node.js)
```typescript
import { Repository } from '../src/Modules/Repository'

describe('Repository Engine', () => {
    let repo: any
    
    beforeEach(() => {
        repo = Repository.Engine.create({
            schema: userSchema,
            store: new Repository.Adapters.Memory.Store(),
            keyCodec: Repository.Codec.simple()
        })
    })
    
    test('should upsert and find entities', () => {
        const user = { id: 'u1', name: 'John', email: 'john@test.com' }
        repo.upsert(user)
        
        const found = repo.find({ id: 'u1' })
        expect(found).toEqual(user)
    })
    
    test('should track changes', () => {
        repo.upsert({ id: 'u1', name: 'John', email: 'john@test.com' })
        
        const changes = repo.getChanges()
        expect(changes.added).toHaveLength(1)
        expect(changes.updated).toHaveLength(0)
    })
})
```

### Integration Tests (GAS)
```typescript
function test_RepositoryWithSheets() {
    const repo = Repository.Engine.create({
        schema: userSchema,
        store: new Repository.Adapters.GAS.Spreadsheet.Store(TEST_SHEET_ID),
        keyCodec: Repository.Codec.simple()
    })
    
    // Test CRUD operations with real Google Sheets
    repo.load()
    repo.upsert({ id: 'test1', name: 'Test User', email: 'test@example.com' })
    repo.commit()
    
    const user = repo.find({ id: 'test1' })
    console.log('Found user:', user)
}
```

### Error Handling Tests
```typescript
test('should handle missing entities gracefully', () => {
    const user = repo.find({ id: 'nonexistent' })
    expect(user).toBeNull()
})

test('should validate schema parameters', () => {
    expect(() => {
        repo.upsert({ id: 'u1' }) // Missing required fields
    }).toThrow()
})
```

## Configuration

### Google Sheets Setup
Create spreadsheets with columns matching your schema parameters:
- First row: Header with parameter names
- Subsequent rows: Entity data
- Sheet ID required for Spreadsheet.Store constructor

### Schema Best Practices
- Always define `instantiate()` and `fromPartial()` methods
- Use branded types for entity IDs
- Include validation in `onBeforeSave()` if needed
- Consider schema versioning for migrations

### Performance Optimization
- Use `load()` once at startup to cache data
- Batch operations before calling `commit()`
- Use composite keys sparingly for better performance
- Consider memory limits for large datasets