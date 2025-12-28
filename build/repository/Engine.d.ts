/**
 * Repository Engine - Core repository functionality
 */
import type * as RepositoryTypes from './Types';
import type { Logger } from '../shared/index';
/**
 * Creates a repository instance with the provided dependencies
 * @param deps Configuration object with schema, store, codec, and optional logger
 * @returns Repository instance with CRUD operations
 */
export declare function create<TEntity extends object, Key extends keyof TEntity>(deps: {
    schema: RepositoryTypes.Ports.Schema<TEntity, Key>;
    store: RepositoryTypes.Ports.Store<TEntity>;
    keyCodec: RepositoryTypes.Ports.KeyCodec<TEntity, Key>;
    logger?: Logger;
}): RepositoryTypes.Repository<TEntity, Key>;
//# sourceMappingURL=Engine.d.ts.map