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
}