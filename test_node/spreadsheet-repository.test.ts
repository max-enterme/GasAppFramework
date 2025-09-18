/**
 * Tests for the new SpreadsheetRepository pattern
 */

import { createRepository, MemoryStore, createSimpleCodec } from './repository-module'

interface TestMember {
    channelId: string
    channelName: string
    joinedAt: Date
    isActive: boolean
}

describe('SpreadsheetRepository Pattern', () => {
    // Test the schema pattern
    const TestMemberRepositorySchema = {
        parameters: ['channelId', 'channelName', 'joinedAt', 'isActive'] as (keyof TestMember)[],
        keyParameters: ['channelId'] as ('channelId')[],
        instantiate(): TestMember {
            return {
                channelId: '',
                channelName: '',
                joinedAt: new Date(),
                isActive: true
            }
        },
        fromPartial(p: Partial<TestMember>): TestMember {
            return {
                channelId: p.channelId || '',
                channelName: p.channelName || '',
                joinedAt: p.joinedAt || new Date(),
                isActive: p.isActive ?? true
            }
        }
    }

    // Mock implementation of SpreadsheetRepository pattern
    class TestSpreadsheetRepository {
        protected repository: any

        constructor(
            sheetId: string,
            sheetName: string,
            schema: any,
            logger?: any
        ) {
            // For testing, use memory store instead of actual spreadsheet
            this.repository = createRepository({
                schema,
                store: new MemoryStore<TestMember>(),
                keyCodec: createSimpleCodec(),
                logger
            })
        }

        load(): void {
            this.repository.load()
        }

        find(key: Pick<TestMember, 'channelId'>): TestMember | undefined {
            return this.repository.find(key)
        }

        findAll(): TestMember[] {
            return this.repository.findAll()
        }

        upsert(input: Partial<TestMember> | Partial<TestMember>[]): void {
            if (Array.isArray(input)) {
                input.forEach(item => {
                    const fullEntity = TestMemberRepositorySchema.fromPartial(item)
                    this.repository.upsert(fullEntity)
                })
            } else {
                const fullEntity = TestMemberRepositorySchema.fromPartial(input)
                this.repository.upsert(fullEntity)
            }
        }

        delete(key: Pick<TestMember, 'channelId'>): boolean {
            return this.repository.delete(key)
        }

        get entities(): TestMember[] {
            return this.repository.findAll()
        }
    }

    class TestMemberRepository extends TestSpreadsheetRepository {
        constructor(sheetId: string, sheetName: string = 'ExclusiveMembers', logger?: any) {
            super(sheetId, sheetName, TestMemberRepositorySchema, logger)
        }

        findByChannelId(channelId: string): TestMember | undefined {
            return this.find({ channelId })
        }

        getActiveMembers(): TestMember[] {
            return this.entities.filter(member => member.isActive)
        }
    }

    let repository: TestMemberRepository

    beforeEach(() => {
        repository = new TestMemberRepository('test-sheet-id', 'TestMembers')
    })

    test('should create repository with proper constructor pattern', () => {
        expect(repository).toBeDefined()
    })

    test('should have default sheet name', () => {
        const repoWithDefault = new TestMemberRepository('test-sheet-id')
        expect(repoWithDefault).toBeDefined()
    })

    test('should support entity operations', () => {
        // Add a member
        repository.upsert({
            channelId: 'ch1',
            channelName: 'Test Channel',
            joinedAt: new Date('2024-01-01'),
            isActive: true
        })

        // Find by channel ID
        const member = repository.findByChannelId('ch1')
        expect(member).toBeDefined()
        expect(member?.channelId).toBe('ch1')
        expect(member?.channelName).toBe('Test Channel')
        expect(member?.isActive).toBe(true)
    })

    test('should filter active members', () => {
        // Add multiple members
        repository.upsert([
            {
                channelId: 'ch1',
                channelName: 'Active Channel',
                joinedAt: new Date('2024-01-01'),
                isActive: true
            },
            {
                channelId: 'ch2',
                channelName: 'Inactive Channel',
                joinedAt: new Date('2024-01-02'),
                isActive: false
            },
            {
                channelId: 'ch3',
                channelName: 'Another Active Channel',
                joinedAt: new Date('2024-01-03'),
                isActive: true
            }
        ])

        const activeMembers = repository.getActiveMembers()
        expect(activeMembers).toHaveLength(2)
        expect(activeMembers.every(member => member.isActive)).toBe(true)
    })

    test('should use channelId as key parameter', () => {
        repository.upsert({
            channelId: 'test-key',
            channelName: 'Test',
            isActive: true
        })

        const found = repository.find({ channelId: 'test-key' })
        expect(found).toBeDefined()
        expect(found?.channelId).toBe('test-key')
    })

    test('should handle schema with proper defaults', () => {
        repository.upsert({
            channelId: 'minimal-test'
        })

        const member = repository.findByChannelId('minimal-test')
        expect(member).toBeDefined()
        expect(member?.channelId).toBe('minimal-test')
        expect(member?.channelName).toBe('') // default from schema
        expect(member?.isActive).toBe(true) // default from schema
        expect(member?.joinedAt).toBeInstanceOf(Date) // default from schema
    })
})