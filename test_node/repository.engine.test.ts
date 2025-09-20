/**
 * Repository Engine Tests
 * Comprehensive Node.js tests for the Repository module functionality
 */

import { setupGASMocks, createMockLogger, createTestUser, createTestUsers } from './test-utils';
import { MemoryStore, createSimpleCodec, createRepository } from './repository-module';

// Set up GAS environment mocks before tests
beforeAll(() => {
    setupGASMocks();
});

// Define test entity type
interface User {
    id: string
    org: string
    name: string
    email?: string
}

describe('Repository Engine Tests', () => {
    let store: MemoryStore<User>;
    let codec: ReturnType<typeof createSimpleCodec<User, 'id' | 'org'>>;
    let logger: ReturnType<typeof createMockLogger>;

    // Schema definition for User entity
    const userSchema = {
        parameters: ['id', 'org', 'name', 'email'] as (keyof User)[],
        keyParameters: ['id', 'org'] as ('id' | 'org')[],
        instantiate(): User {
            return { id: '', org: '', name: '', email: '' };
        },
        fromPartial(p: Partial<User>): User {
            return {
                id: String(p.id ?? ''),
                org: String(p.org ?? ''),
                name: String(p.name ?? ''),
                email: String(p.email ?? '')
            };
        },
        onBeforeSave(e: User): User {
            // Trim whitespace from name before saving
            return { ...e, name: e.name.trim() };
        }
    };

    beforeEach(() => {
        store = new MemoryStore<User>();
        codec = createSimpleCodec<User, 'id' | 'org'>('|');
        logger = createMockLogger();
    });

    describe('Repository Creation and Loading', () => {
        test('should create repository instance successfully', () => {
            const repo = createRepository({
                schema: userSchema,
                store,
                keyCodec: codec,
                logger
            });

            expect(repo).toBeDefined();
            expect(typeof repo.load).toBe('function');
            expect(typeof repo.upsert).toBe('function');
            expect(typeof repo.find).toBe('function');
        });

        test('should load empty repository successfully', () => {
            const repo = createRepository({
                schema: userSchema,
                store,
                keyCodec: codec,
                logger
            });

            repo.load();

            expect(logger.info).toHaveBeenCalledWith('[Repository] loaded 0 rows');
            expect(repo.findAll()).toEqual([]);
        });

        test('should load pre-existing data from store', () => {
            // Pre-populate store with test data
            const testUsers = createTestUsers(2);
            store.saveAdded(testUsers);

            const repo = createRepository({
                schema: userSchema,
                store,
                keyCodec: codec,
                logger
            });

            repo.load();

            expect(logger.info).toHaveBeenCalledWith('[Repository] loaded 2 rows');
            expect(repo.findAll()).toHaveLength(2);
        });
    });

    describe('Entity Operations', () => {
        let repo: ReturnType<typeof createRepository<User, 'id' | 'org'>>;

        beforeEach(() => {
            repo = createRepository({
                schema: userSchema,
                store,
                keyCodec: codec,
                logger
            });
            repo.load();
        });

        test('should upsert new entity successfully', () => {
            const user: User = {
                id: 'user1',
                org: 'acme',
                name: 'John Doe',
                email: 'john@acme.com'
            };

            repo.upsert(user);

            expect(logger.info).toHaveBeenCalledWith('[Repository] added entity with key: user1|acme');
            expect(repo.findAll()).toHaveLength(1);
            
            const found = repo.find({ id: 'user1', org: 'acme' });
            expect(found).toEqual(user);
        });

        test('should update existing entity', () => {
            const originalUser: User = {
                id: 'user1',
                org: 'acme',
                name: 'John Doe',
                email: 'john@acme.com'
            };

            const updatedUser: User = {
                id: 'user1',
                org: 'acme',
                name: 'John Smith',
                email: 'johnsmith@acme.com'
            };

            // Insert original
            repo.upsert(originalUser);
            expect(repo.findAll()).toHaveLength(1);

            // Update
            repo.upsert(updatedUser);
            expect(repo.findAll()).toHaveLength(1); // Should still be 1 entity

            const found = repo.find({ id: 'user1', org: 'acme' });
            expect(found?.name).toBe('John Smith');
            expect(found?.email).toBe('johnsmith@acme.com');
            expect(logger.info).toHaveBeenCalledWith('[Repository] updated entity with key: user1|acme');
        });

        test('should find entity by key', () => {
            const user = createTestUser({ id: 'findme', org: 'testorg' });
            repo.upsert(user);

            const found = repo.find({ id: 'findme', org: 'testorg' });
            expect(found).toEqual(user);

            const notFound = repo.find({ id: 'notexist', org: 'testorg' });
            expect(notFound).toBeUndefined();
        });

        test('should delete entity by key', () => {
            const user = createTestUser({ id: 'deleteme', org: 'testorg' });
            repo.upsert(user);

            expect(repo.findAll()).toHaveLength(1);

            const deleted = repo.delete({ id: 'deleteme', org: 'testorg' });
            expect(deleted).toBe(true);
            expect(repo.findAll()).toHaveLength(0);
            expect(logger.info).toHaveBeenCalledWith('[Repository] deleted entity with key: deleteme|testorg');

            // Try to delete non-existent entity
            const notDeleted = repo.delete({ id: 'notexist', org: 'testorg' });
            expect(notDeleted).toBe(false);
        });
    });

    describe('Schema Processing', () => {
        let repo: ReturnType<typeof createRepository<User, 'id' | 'org'>>;

        beforeEach(() => {
            repo = createRepository({
                schema: userSchema,
                store,
                keyCodec: codec,
                logger
            });
            repo.load();
        });

        test('should apply onBeforeSave transformations', () => {
            const userWithWhitespace: User = {
                id: 'user1',
                org: 'acme',
                name: '  John Doe  ', // Whitespace that should be trimmed
                email: 'john@acme.com'
            };

            repo.upsert(userWithWhitespace);

            const saved = repo.find({ id: 'user1', org: 'acme' });
            expect(saved?.name).toBe('John Doe'); // Whitespace should be trimmed
        });

        test('should handle partial data with fromPartial', () => {
            const partialUser: Partial<User> = {
                id: 'partial1',
                org: 'acme',
                name: 'Partial User'
                // email is missing
            };

            // This tests the schema's fromPartial method
            const fullUser = userSchema.fromPartial(partialUser);
            expect(fullUser.email).toBe(''); // Should be empty string, not undefined
            expect(fullUser.id).toBe('partial1');
            expect(fullUser.name).toBe('Partial User');
        });
    });

    describe('Key Codec Functionality', () => {
        test('should stringify keys correctly', () => {
            const key = { id: 'user123', org: 'acme-corp' };
            const stringified = codec.stringify(key);
            expect(stringified).toBe('user123|acme-corp');
        });

        test('should parse keys correctly', () => {
            const keyString = 'user123|acme-corp';
            const parsed = codec.parse(keyString);
            expect(parsed.id).toBe('user123');
            expect(parsed.org).toBe('acme-corp');
        });

        test('should handle special characters in keys', () => {
            const specialKey = { id: 'user|with|pipes', org: 'org\\with\\backslashes' };
            const stringified = codec.stringify(specialKey);
            const parsed = codec.parse(stringified);
            
            // The codec should handle escaping and unescaping
            expect(typeof stringified).toBe('string');
            expect(parsed.id).toBeDefined();
            expect(parsed.org).toBeDefined();
        });
    });

    describe('Memory Store Functionality', () => {
        test('should store and retrieve data correctly', () => {
            const testData = createTestUsers(3);
            
            store.saveAdded(testData);
            const loaded = store.load();
            
            expect(loaded.rows).toHaveLength(3);
            expect(loaded.rows).toEqual(testData);
        });

        test('should update existing rows by index', () => {
            const initialData = createTestUsers(2);
            store.saveAdded(initialData);

            const updatedUser = { ...initialData[0], name: 'Updated Name' };
            store.saveUpdated([{ index: 0, row: updatedUser }]);

            const loaded = store.load();
            expect(loaded.rows[0].name).toBe('Updated Name');
            expect(loaded.rows[1].name).toBe(initialData[1].name); // Unchanged
        });

        test('should delete rows by indexes', () => {
            const initialData = createTestUsers(4);
            store.saveAdded(initialData);

            // Delete indexes 1 and 3 (second and fourth items)
            store.deleteByIndexes([1, 3]);

            const loaded = store.load();
            expect(loaded.rows).toHaveLength(2);
            expect(loaded.rows[0]).toEqual(initialData[0]);
            expect(loaded.rows[1]).toEqual(initialData[2]);
        });
    });

    describe('Complex Scenarios', () => {
        let repo: ReturnType<typeof createRepository<User, 'id' | 'org'>>;

        beforeEach(() => {
            repo = createRepository({
                schema: userSchema,
                store,
                keyCodec: codec,
                logger
            });
            repo.load();
        });

        test('should handle multiple organizations correctly', () => {
            const users: User[] = [
                { id: 'user1', org: 'acme', name: 'John Doe', email: 'john@acme.com' },
                { id: 'user1', org: 'corp', name: 'John Doe', email: 'john@corp.com' }, // Same ID, different org
                { id: 'user2', org: 'acme', name: 'Jane Doe', email: 'jane@acme.com' }
            ];

            users.forEach(user => repo.upsert(user));

            expect(repo.findAll()).toHaveLength(3);
            
            // Should be able to find each user by their composite key
            expect(repo.find({ id: 'user1', org: 'acme' })?.email).toBe('john@acme.com');
            expect(repo.find({ id: 'user1', org: 'corp' })?.email).toBe('john@corp.com');
            expect(repo.find({ id: 'user2', org: 'acme' })?.email).toBe('jane@acme.com');
        });

        test('should maintain data integrity through multiple operations', () => {
            // Add several users
            const users = createTestUsers(5);
            users.forEach(user => repo.upsert(user));
            expect(repo.findAll()).toHaveLength(5);

            // Update some users
            const updatedUser = { ...users[2], name: 'Updated Name' };
            repo.upsert(updatedUser);
            expect(repo.findAll()).toHaveLength(5); // Still 5 users

            // Delete some users
            repo.delete({ id: users[0].id, org: users[0].org });
            repo.delete({ id: users[4].id, org: users[4].org });
            expect(repo.findAll()).toHaveLength(3);

            // Verify remaining data
            const remaining = repo.findAll();
            expect(remaining.some(u => u.name === 'Updated Name')).toBe(true);
            expect(remaining.some(u => u.id === users[0].id)).toBe(false);
            expect(remaining.some(u => u.id === users[4].id)).toBe(false);
        });
    });
});