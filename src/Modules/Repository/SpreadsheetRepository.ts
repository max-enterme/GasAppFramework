/**
 * Base SpreadsheetRepository class for Google Sheets-based repositories
 */

/// <reference path="Core.Types.d.ts" />
/// <reference path="Engine.ts" />
/// <reference path="Codec.Simple.ts" />
/// <reference path="Adapters.GAS.Spreadsheet.ts" />

namespace YTamaLeagueManagement.Repositories {
    /**
     * Base class for repositories that use Google Sheets as storage
     */
    export abstract class SpreadsheetRepository<TEntity extends object, Key extends keyof TEntity> {
        protected repository: Repository.Repository<TEntity, Key>

        constructor(
            sheetId: string,
            sheetName: string,
            schema: Repository.Ports.Schema<TEntity, Key>,
            logger?: Shared.Types.Logger
        ) {
            const store = new Repository.Adapters.GAS.SpreadsheetStore(
                sheetId,
                sheetName,
                schema
            )
            
            this.repository = Repository.Engine.create({
                schema,
                store,
                keyCodec: Repository.Codec.simple(),
                logger
            })
        }

        /**
         * Load data from the spreadsheet
         */
        load(): void {
            this.repository.load()
        }

        /**
         * Find an entity by its key
         */
        find(key: Pick<TEntity, Key>): TEntity | null {
            return this.repository.find(key)
        }

        /**
         * Find multiple entities by their keys
         */
        findAll(keys: Pick<TEntity, Key>[]): TEntity[] {
            return this.repository.findAll(keys)
        }

        /**
         * Insert or update entities
         */
        upsert(input: Partial<TEntity> | Partial<TEntity>[]): { added: TEntity[]; updated: TEntity[] } {
            return this.repository.upsert(input)
        }

        /**
         * Delete entities by their keys
         */
        delete(keys: Pick<TEntity, Key> | Pick<TEntity, Key>[]): { deleted: number } {
            return this.repository.delete(keys)
        }

        /**
         * Get all entities
         */
        get entities(): TEntity[] {
            return this.repository.entities
        }
    }

    // Schema definitions
    export interface ExclusiveMember {
        channelId: string
        channelName: string
        joinedAt: Date
        isActive: boolean
    }

    export const ExclusiveMemberRepositorySchema: Repository.Ports.Schema<ExclusiveMember, 'channelId'> = {
        parameters: ['channelId', 'channelName', 'joinedAt', 'isActive'],
        keyParameters: ['channelId'],
        instantiate(): ExclusiveMember {
            return {
                channelId: '',
                channelName: '',
                joinedAt: new Date(),
                isActive: true
            }
        },
        fromPartial(p: Partial<ExclusiveMember>): ExclusiveMember {
            return {
                channelId: p.channelId || '',
                channelName: p.channelName || '',
                joinedAt: p.joinedAt || new Date(),
                isActive: p.isActive ?? true
            }
        }
    }

    export interface GameSession {
        sessionId: string
        gameType: string
        startTime: Date
        endTime?: Date
        playerCount: number
        isActive: boolean
    }

    export const GameSessionRepositorySchema: Repository.Ports.Schema<GameSession, 'sessionId'> = {
        parameters: ['sessionId', 'gameType', 'startTime', 'endTime', 'playerCount', 'isActive'],
        keyParameters: ['sessionId'],
        instantiate(): GameSession {
            return {
                sessionId: '',
                gameType: '',
                startTime: new Date(),
                endTime: undefined,
                playerCount: 0,
                isActive: true
            }
        },
        fromPartial(p: Partial<GameSession>): GameSession {
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

    export interface LeagueTeam {
        teamId: string
        teamName: string
        leagueId: string
        ownerId: string
        points: number
        isActive: boolean
    }

    export const LeagueTeamRepositorySchema: Repository.Ports.Schema<LeagueTeam, 'teamId'> = {
        parameters: ['teamId', 'teamName', 'leagueId', 'ownerId', 'points', 'isActive'],
        keyParameters: ['teamId'],
        instantiate(): LeagueTeam {
            return {
                teamId: '',
                teamName: '',
                leagueId: '',
                ownerId: '',
                points: 0,
                isActive: true
            }
        },
        fromPartial(p: Partial<LeagueTeam>): LeagueTeam {
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

    /**
     * Repository for managing exclusive members with channelId as key
     */
    export class ExclusiveMemberRepository extends SpreadsheetRepository<ExclusiveMember, 'channelId'> {
        constructor(sheetId: string, sheetName: string = 'ExclusiveMembers', logger?: Shared.Types.Logger) {
            super(sheetId, sheetName, ExclusiveMemberRepositorySchema, logger)
        }

        /**
         * Find member by channel ID
         */
        findByChannelId(channelId: string): ExclusiveMember | null {
            return this.find({ channelId })
        }

        /**
         * Get all active members
         */
        getActiveMembers(): ExclusiveMember[] {
            return this.entities.filter(member => member.isActive)
        }
    }

    /**
     * Repository for managing game sessions with sessionId as key
     */
    export class GameSessionRepository extends SpreadsheetRepository<GameSession, 'sessionId'> {
        constructor(sheetId: string, sheetName: string = 'GameSessions', logger?: Shared.Types.Logger) {
            super(sheetId, sheetName, GameSessionRepositorySchema, logger)
        }

        /**
         * Find session by session ID
         */
        findBySessionId(sessionId: string): GameSession | null {
            return this.find({ sessionId })
        }

        /**
         * Get all active game sessions
         */
        getActiveSessions(): GameSession[] {
            return this.entities.filter(session => session.isActive)
        }

        /**
         * Get sessions by game type
         */
        getSessionsByGameType(gameType: string): GameSession[] {
            return this.entities.filter(session => session.gameType === gameType)
        }

        /**
         * End a game session
         */
        endSession(sessionId: string): boolean {
            const session = this.findBySessionId(sessionId)
            if (session) {
                const updated = { ...session, isActive: false, endTime: new Date() }
                this.upsert(updated)
                return true
            }
            return false
        }
    }

    /**
     * Repository for managing league teams with teamId as key
     */
    export class LeagueTeamRepository extends SpreadsheetRepository<LeagueTeam, 'teamId'> {
        constructor(sheetId: string, sheetName: string = 'LeagueTeams', logger?: Shared.Types.Logger) {
            super(sheetId, sheetName, LeagueTeamRepositorySchema, logger)
        }

        /**
         * Find team by team ID
         */
        findByTeamId(teamId: string): LeagueTeam | null {
            return this.find({ teamId })
        }

        /**
         * Get teams by league ID
         */
        getTeamsByLeague(leagueId: string): LeagueTeam[] {
            return this.entities.filter(team => team.leagueId === leagueId && team.isActive)
        }

        /**
         * Get teams by owner ID
         */
        getTeamsByOwner(ownerId: string): LeagueTeam[] {
            return this.entities.filter(team => team.ownerId === ownerId && team.isActive)
        }

        /**
         * Update team points
         */
        updateTeamPoints(teamId: string, points: number): boolean {
            const team = this.findByTeamId(teamId)
            if (team) {
                const updated = { ...team, points }
                this.upsert(updated)
                return true
            }
            return false
        }

        /**
         * Get league leaderboard (sorted by points)
         */
        getLeaderboard(leagueId: string): LeagueTeam[] {
            return this.getTeamsByLeague(leagueId)
                .sort((a, b) => b.points - a.points)
        }
    }
}