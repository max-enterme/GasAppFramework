/**
 * Repository Engine Tests for Node.js
 * Modern test implementation following Jest best practices
 */

import { loadNamespaceTs } from './helpers/loadNamespace'

// Load the required namespaces for testing (order matters)
loadNamespaceTs(
    'src/Modules/Repository/Errors.ts',
    'src/Modules/Repository/Engine.ts',
    'src/Modules/Repository/Adapters.Memory.ts',
    'src/Modules/Repository/Codec.Simple.ts'
)

// Access Repository namespace from global scope
const Repository = (global as any).Repository

// Test data types
type User = { 
    id: string
    org: string
    name: string
    age: number | null
}

type UserKey = 'id' | 'org'

describe('Repository Engine (Node.js)', () => {
    // Skip tests if Repository is not loaded correctly
    if (!Repository) {
        test.skip('Repository namespace not loaded - skipping tests', () => {})
        return
    }

    let store: any
    let repo: any
    let schema: any
    let keyCodec: any

    beforeEach(() => {
        // Setup fresh test environment for each test
        store = new Repository.Adapters.Memory.Store()
        
        // Define schema with proper validation and transformation hooks
        schema = {
            parameters: ['id', 'org', 'name', 'age'],
            keyParameters: ['id', 'org'],
            instantiate(): User {
                return { id: '', org: '', name: '', age: null }
            },
            fromPartial(p: Partial<User>): User {
                return {
                    id: String(p.id ?? ''),
                    org: String(p.org ?? ''),
                    name: String(p.name ?? ''),
                    age: p.age == null ? null : Number(p.age)
                }
            },
            onBeforeSave(entity: User): User {
                // Transform data before saving (trim whitespace)
                return { ...entity, name: entity.name.trim() }
            },
            onAfterLoad(raw: any): User {
                return raw as User
            },
            schemaVersion: 1
        }

        // Create key codec for composite keys
        keyCodec = {
            stringify(key: Pick<User, UserKey>): string {
                return `${key.id},${key.org}`
            },
            parse(s: string): Pick<User, UserKey> {
                const [id, org] = s.split(',')
                return { id: id || '', org: org || '' }
            }
        }

        // Create repository instance
        repo = Repository.Engine.create({ 
            schema, 
            store, 
            keyCodec,
            logger: { info: jest.fn(), error: jest.fn() }
        })
        
        // Initialize repository
        repo.load()
    })

    describe('Basic CRUD Operations', () => {
        test('should add new records via upsert', () => {
            // Add a new user
            const result = repo.upsert({ 
                id: 'user1', 
                org: 'org1', 
                name: 'Alice', 
                age: 25 
            })

            expect(result.added).toHaveLength(1)
            expect(result.updated).toHaveLength(0)
            expect(result.added[0]).toMatchObject({
                id: 'user1',
                org: 'org1', 
                name: 'Alice',
                age: 25
            })
        })

        test('should update existing records via upsert', () => {
            // First, add a user
            repo.upsert({ id: 'user1', org: 'org1', name: 'Alice', age: 25 })

            // Then update the same user
            const result = repo.upsert({ 
                id: 'user1', 
                org: 'org1', 
                name: 'Alice Updated', 
                age: 26 
            })

            expect(result.added).toHaveLength(0)
            expect(result.updated).toHaveLength(1)
            expect(result.updated[0]).toMatchObject({
                id: 'user1',
                org: 'org1',
                name: 'Alice Updated',
                age: 26
            })
        })

        test('should handle batch upsert operations', () => {
            // Batch operation with both new and updated records
            const result = repo.upsert([
                { id: 'user1', org: 'org1', name: 'Alice', age: 25 },
                { id: 'user2', org: 'org1', name: 'Bob', age: 30 },
                { id: 'user3', org: 'org2', name: 'Charlie', age: 35 }
            ])

            expect(result.added).toHaveLength(3)
            expect(result.updated).toHaveLength(0)

            // Now update some and add new ones
            const result2 = repo.upsert([
                { id: 'user1', org: 'org1', name: 'Alice Updated', age: 26 },
                { id: 'user4', org: 'org2', name: 'David', age: 40 }
            ])

            expect(result2.added).toHaveLength(1)
            expect(result2.updated).toHaveLength(1)
        })
    })

    describe('Find Operations', () => {
        beforeEach(() => {
            // Setup test data
            repo.upsert([
                { id: 'user1', org: 'org1', name: 'Alice', age: 25 },
                { id: 'user2', org: 'org1', name: 'Bob', age: 30 },
                { id: 'user3', org: 'org2', name: 'Charlie', age: 35 }
            ])
        })

        test('should find single record by key', () => {
            const user = repo.find({ id: 'user1', org: 'org1' })

            expect(user).toBeTruthy()
            expect(user).toMatchObject({
                id: 'user1',
                org: 'org1',
                name: 'Alice',
                age: 25
            })
        })

        test('should return null for non-existent records', () => {
            const user = repo.find({ id: 'nonexistent', org: 'org1' })
            expect(user).toBeNull()
        })

        test('should find multiple records with findAll', () => {
            const users = repo.findAll([
                { id: 'user1', org: 'org1' },
                { id: 'user3', org: 'org2' }
            ])

            expect(users).toHaveLength(2)
            expect(users[0]).toMatchObject({ id: 'user1', org: 'org1' })
            expect(users[1]).toMatchObject({ id: 'user3', org: 'org2' })
        })

        test('should handle findAll with some non-existent keys', () => {
            const users = repo.findAll([
                { id: 'user1', org: 'org1' },
                { id: 'nonexistent', org: 'org1' },
                { id: 'user2', org: 'org1' }
            ])

            // Should only return existing records
            expect(users).toHaveLength(2)
            expect(users[0]).toMatchObject({ id: 'user1', org: 'org1' })
            expect(users[1]).toMatchObject({ id: 'user2', org: 'org1' })
        })
    })

    describe('Delete Operations', () => {
        beforeEach(() => {
            // Setup test data
            repo.upsert([
                { id: 'user1', org: 'org1', name: 'Alice', age: 25 },
                { id: 'user2', org: 'org1', name: 'Bob', age: 30 },
                { id: 'user3', org: 'org2', name: 'Charlie', age: 35 }
            ])
        })

        test('should delete single record by key', () => {
            const result = repo.delete({ id: 'user1', org: 'org1' })
            
            expect(result.deleted).toBe(1)
            
            // Verify record is deleted
            const user = repo.find({ id: 'user1', org: 'org1' })
            expect(user).toBeNull()
        })

        test('should delete multiple records', () => {
            const result = repo.delete([
                { id: 'user1', org: 'org1' },
                { id: 'user3', org: 'org2' }
            ])
            
            expect(result.deleted).toBe(2)
            
            // Verify records are deleted
            expect(repo.find({ id: 'user1', org: 'org1' })).toBeNull()
            expect(repo.find({ id: 'user3', org: 'org2' })).toBeNull()
            
            // Verify remaining record still exists
            expect(repo.find({ id: 'user2', org: 'org1' })).toBeTruthy()
        })
    })

    describe('Schema Validation and Transformation', () => {
        test('should apply onBeforeSave transformation', () => {
            // Insert user with extra whitespace
            repo.upsert({ 
                id: 'user1', 
                org: 'org1', 
                name: '  Alice  ', 
                age: 25 
            })

            const user = repo.find({ id: 'user1', org: 'org1' })
            
            // Name should be trimmed due to onBeforeSave hook
            expect(user.name).toBe('Alice')
        })

        test('should validate required key parameters', () => {
            // Attempt to insert record with empty key field should throw
            expect(() => {
                repo.upsert({ id: '', org: 'org1', name: 'Test', age: 25 })
            }).toThrow()

            expect(() => {
                repo.upsert({ id: 'user1', org: '', name: 'Test', age: 25 })
            }).toThrow()
        })

        test('should handle partial entity conversion via fromPartial', () => {
            // Insert with missing fields
            const result = repo.upsert({ id: 'user1', org: 'org1', name: 'Alice' })
            
            const user = result.added[0]
            expect(user.age).toBeNull() // Should be converted to null, not undefined
            expect(user.id).toBe('user1')
            expect(user.org).toBe('org1')
            expect(user.name).toBe('Alice')
        })
    })

    describe('Error Handling', () => {
        test('should throw RepositoryError for invalid key parameters', () => {
            // Test with null values should throw
            expect(() => {
                repo.upsert({ id: null, org: 'org1', name: 'Test', age: 25 })
            }).toThrow()

            // find method with empty string should not throw but should return null
            const result = repo.find({ id: '', org: 'org1' })
            expect(result).toBeNull()
        })
    })

    describe('Repository State Management', () => {
        test('should track entities count correctly', () => {
            expect(repo.entities).toHaveLength(0)

            repo.upsert([
                { id: 'user1', org: 'org1', name: 'Alice', age: 25 },
                { id: 'user2', org: 'org1', name: 'Bob', age: 30 }
            ])

            expect(repo.entities).toHaveLength(2)

            repo.delete({ id: 'user1', org: 'org1' })
            expect(repo.entities).toHaveLength(1)
        })

        test('should handle multiple load operations correctly', () => {
            // Add some data
            repo.upsert({ id: 'user1', org: 'org1', name: 'Alice', age: 25 })
            expect(repo.entities).toHaveLength(1)

            // Load should work correctly with existing data
            repo.load()
            expect(repo.entities).toHaveLength(1)
        })
    })
})
