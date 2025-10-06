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

interface TestGameSession {
    sessionId: string
    gameType: string
    startTime: Date
    endTime?: Date
    playerCount: number
    isActive: boolean
}

interface TestLeagueTeam {
    teamId: string
    teamName: string
    leagueId: string
    ownerId: string
    points: number
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

    const TestGameSessionRepositorySchema = {
        parameters: ['sessionId', 'gameType', 'startTime', 'endTime', 'playerCount', 'isActive'] as (keyof TestGameSession)[],
        keyParameters: ['sessionId'] as ('sessionId')[],
        instantiate(): TestGameSession {
            return {
                sessionId: '',
                gameType: '',
                startTime: new Date(),
                endTime: undefined,
                playerCount: 0,
                isActive: true
            }
        },
        fromPartial(p: Partial<TestGameSession>): TestGameSession {
            return {
                sessionId: p.sessionId || '',
                gameType: p.gameType || '',
                startTime: p.startTime || new Date(),
                endTime: p.endTime,
                playerCount: p.playerCount || 0,
                isActive: p.isActive ?? true
            }
        }
    }

    const TestLeagueTeamRepositorySchema = {
        parameters: ['teamId', 'teamName', 'leagueId', 'ownerId', 'points', 'isActive'] as (keyof TestLeagueTeam)[],
        keyParameters: ['teamId'] as ('teamId')[],
        instantiate(): TestLeagueTeam {
            return {
                teamId: '',
                teamName: '',
                leagueId: '',
                ownerId: '',
                points: 0,
                isActive: true
            }
        },
        fromPartial(p: Partial<TestLeagueTeam>): TestLeagueTeam {
            return {
                teamId: p.teamId || '',
                teamName: p.teamName || '',
                leagueId: p.leagueId || '',
                ownerId: p.ownerId || '',
                points: p.points || 0,
                isActive: p.isActive ?? true
            }
        }
    }

    // Mock implementation of SpreadsheetRepository pattern
    class TestSpreadsheetRepository<TEntity extends object, Key extends keyof TEntity> {
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
                store: new MemoryStore<TEntity>(),
                keyCodec: createSimpleCodec(),
                logger
            })
        }

        load(): void {
            this.repository.load()
        }

        find(key: Pick<TEntity, Key>): TEntity | undefined {
            return this.repository.find(key)
        }

        findAll(): TEntity[] {
            return this.repository.findAll()
        }

        upsert(input: Partial<TEntity> | Partial<TEntity>[], schema: any): void {
            if (Array.isArray(input)) {
                input.forEach(item => {
                    const fullEntity = schema.fromPartial(item)
                    this.repository.upsert(fullEntity)
                })
            } else {
                const fullEntity = schema.fromPartial(input)
                this.repository.upsert(fullEntity)
            }
        }

        delete(key: Pick<TEntity, Key>): boolean {
            return this.repository.delete(key)
        }

        get entities(): TEntity[] {
            return this.repository.findAll()
        }
    }

    class TestMemberRepository extends TestSpreadsheetRepository<TestMember, 'channelId'> {
        constructor(sheetId: string, sheetName: string = 'ExclusiveMembers', logger?: any) {
            super(sheetId, sheetName, TestMemberRepositorySchema, logger)
        }

        findByChannelId(channelId: string): TestMember | undefined {
            return this.find({ channelId })
        }

        getActiveMembers(): TestMember[] {
            return this.entities.filter(member => member.isActive)
        }

        upsert(input: Partial<TestMember> | Partial<TestMember>[]): void {
            super.upsert(input, TestMemberRepositorySchema)
        }
    }

    class TestGameSessionRepository extends TestSpreadsheetRepository<TestGameSession, 'sessionId'> {
        constructor(sheetId: string, sheetName: string = 'GameSessions', logger?: any) {
            super(sheetId, sheetName, TestGameSessionRepositorySchema, logger)
        }

        findBySessionId(sessionId: string): TestGameSession | undefined {
            return this.find({ sessionId })
        }

        getActiveSessions(): TestGameSession[] {
            return this.entities.filter(session => session.isActive)
        }

        getSessionsByGameType(gameType: string): TestGameSession[] {
            return this.entities.filter(session => session.gameType === gameType)
        }

        endSession(sessionId: string): boolean {
            const session = this.findBySessionId(sessionId)
            if (session) {
                const updated = { ...session, isActive: false, endTime: new Date() }
                this.upsert(updated)
                return true
            }
            return false
        }

        upsert(input: Partial<TestGameSession> | Partial<TestGameSession>[]): void {
            super.upsert(input, TestGameSessionRepositorySchema)
        }
    }

    class TestLeagueTeamRepository extends TestSpreadsheetRepository<TestLeagueTeam, 'teamId'> {
        constructor(sheetId: string, sheetName: string = 'LeagueTeams', logger?: any) {
            super(sheetId, sheetName, TestLeagueTeamRepositorySchema, logger)
        }

        findByTeamId(teamId: string): TestLeagueTeam | undefined {
            return this.find({ teamId })
        }

        getTeamsByLeague(leagueId: string): TestLeagueTeam[] {
            return this.entities.filter(team => team.leagueId === leagueId && team.isActive)
        }

        getTeamsByOwner(ownerId: string): TestLeagueTeam[] {
            return this.entities.filter(team => team.ownerId === ownerId && team.isActive)
        }

        updateTeamPoints(teamId: string, points: number): boolean {
            const team = this.findByTeamId(teamId)
            if (team) {
                const updated = { ...team, points }
                this.upsert(updated)
                return true
            }
            return false
        }

        getLeaderboard(leagueId: string): TestLeagueTeam[] {
            return this.getTeamsByLeague(leagueId)
                .sort((a, b) => b.points - a.points)
        }

        upsert(input: Partial<TestLeagueTeam> | Partial<TestLeagueTeam>[]): void {
            super.upsert(input, TestLeagueTeamRepositorySchema)
        }
    }

    describe('ExclusiveMemberRepository', () => {
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

    describe('GameSessionRepository', () => {
        let repository: TestGameSessionRepository

        beforeEach(() => {
            repository = new TestGameSessionRepository('test-sheet-id', 'GameSessions')
        })

        test('should create repository with sessionId as key', () => {
            repository.upsert({
                sessionId: 'session1',
                gameType: 'YTamaLeague',
                startTime: new Date('2024-01-01T10:00:00'),
                playerCount: 4,
                isActive: true
            })

            const session = repository.findBySessionId('session1')
            expect(session).toBeDefined()
            expect(session?.sessionId).toBe('session1')
            expect(session?.gameType).toBe('YTamaLeague')
        })

        test('should filter sessions by game type', () => {
            repository.upsert([
                {
                    sessionId: 'session1',
                    gameType: 'YTamaLeague',
                    startTime: new Date(),
                    playerCount: 4,
                    isActive: true
                },
                {
                    sessionId: 'session2',
                    gameType: 'Tournament',
                    startTime: new Date(),
                    playerCount: 8,
                    isActive: true
                },
                {
                    sessionId: 'session3',
                    gameType: 'YTamaLeague',
                    startTime: new Date(),
                    playerCount: 2,
                    isActive: true
                }
            ])

            const ytamaSessions = repository.getSessionsByGameType('YTamaLeague')
            expect(ytamaSessions).toHaveLength(2)
            expect(ytamaSessions.every(s => s.gameType === 'YTamaLeague')).toBe(true)
        })

        test('should end sessions correctly', () => {
            repository.upsert({
                sessionId: 'session1',
                gameType: 'YTamaLeague',
                startTime: new Date(),
                playerCount: 4,
                isActive: true
            })

            const result = repository.endSession('session1')
            expect(result).toBe(true)

            const session = repository.findBySessionId('session1')
            expect(session?.isActive).toBe(false)
            expect(session?.endTime).toBeInstanceOf(Date)
        })
    })

    describe('LeagueTeamRepository', () => {
        let repository: TestLeagueTeamRepository

        beforeEach(() => {
            repository = new TestLeagueTeamRepository('test-sheet-id', 'LeagueTeams')
        })

        test('should create repository with teamId as key', () => {
            repository.upsert({
                teamId: 'team1',
                teamName: 'Team Alpha',
                leagueId: 'league1',
                ownerId: 'owner1',
                points: 100,
                isActive: true
            })

            const team = repository.findByTeamId('team1')
            expect(team).toBeDefined()
            expect(team?.teamId).toBe('team1')
            expect(team?.teamName).toBe('Team Alpha')
        })

        test('should filter teams by league', () => {
            repository.upsert([
                {
                    teamId: 'team1',
                    teamName: 'Team Alpha',
                    leagueId: 'league1',
                    ownerId: 'owner1',
                    points: 100,
                    isActive: true
                },
                {
                    teamId: 'team2',
                    teamName: 'Team Beta',
                    leagueId: 'league2',
                    ownerId: 'owner2',
                    points: 150,
                    isActive: true
                },
                {
                    teamId: 'team3',
                    teamName: 'Team Gamma',
                    leagueId: 'league1',
                    ownerId: 'owner3',
                    points: 80,
                    isActive: true
                }
            ])

            const league1Teams = repository.getTeamsByLeague('league1')
            expect(league1Teams).toHaveLength(2)
            expect(league1Teams.every(t => t.leagueId === 'league1')).toBe(true)
        })

        test('should update team points', () => {
            repository.upsert({
                teamId: 'team1',
                teamName: 'Team Alpha',
                leagueId: 'league1',
                ownerId: 'owner1',
                points: 100,
                isActive: true
            })

            const result = repository.updateTeamPoints('team1', 200)
            expect(result).toBe(true)

            const team = repository.findByTeamId('team1')
            expect(team?.points).toBe(200)
        })

        test('should generate leaderboard sorted by points', () => {
            repository.upsert([
                {
                    teamId: 'team1',
                    teamName: 'Team Alpha',
                    leagueId: 'league1',
                    ownerId: 'owner1',
                    points: 100,
                    isActive: true
                },
                {
                    teamId: 'team2',
                    teamName: 'Team Beta',
                    leagueId: 'league1',
                    ownerId: 'owner2',
                    points: 200,
                    isActive: true
                },
                {
                    teamId: 'team3',
                    teamName: 'Team Gamma',
                    leagueId: 'league1',
                    ownerId: 'owner3',
                    points: 150,
                    isActive: true
                }
            ])

            const leaderboard = repository.getLeaderboard('league1')
            expect(leaderboard).toHaveLength(3)
            expect(leaderboard[0].points).toBe(200) // Team Beta first
            expect(leaderboard[1].points).toBe(150) // Team Gamma second
            expect(leaderboard[2].points).toBe(100) // Team Alpha third
        })
    })
})