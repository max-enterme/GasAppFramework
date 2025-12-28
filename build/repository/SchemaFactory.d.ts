/**
 * Repository Schema Factory
 * - Generates parameters and fromPartial from entity type
 */
import type * as RepositoryTypes from './Types';
/**
 * Generate parameters (field names) from an entity instance or prototype.
 * @param sample A sample entity (instance or prototype)
 * @returns string[]
 */
export declare function getParametersFromEntity<TEntity extends object>(sample: TEntity): (keyof TEntity)[];
/**
 * Create a fromPartial function for an entity type.
 * @param sample A sample entity (for default values)
 * @returns (partial: Partial<TEntity>) => TEntity
 */
export declare function createFromPartial<TEntity extends object>(sample: TEntity): (partial: Partial<TEntity>) => TEntity;
/**
 * Create a Schema from a sample entity and keyParameters
 * @param entityFactory A factory function to create new instances of the entity
 * @param keyParameters Keys used for primary key
 * @returns Repository.Ports.Schema<TEntity, Key>
 */
export declare function createSchema<TEntity extends object, Key extends keyof TEntity>(entityFactory: () => TEntity, keyParameters: Key[]): RepositoryTypes.Ports.Schema<TEntity, Key>;
//# sourceMappingURL=SchemaFactory.d.ts.map