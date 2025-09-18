/**
 * Repository Schema Factory
 * - Generates parameters and fromPartial from entity type
 */

namespace Repository.SchemaFactory {
    /**
     * Generate parameters (field names) from an entity instance or prototype.
     * @param sample A sample entity (instance or prototype)
     * @returns string[]
     */
    export function getParametersFromEntity<TEntity extends object>(sample: TEntity): (keyof TEntity)[] {
        return Object.keys(sample) as (keyof TEntity)[];
    }

    /**
     * Create a fromPartial function for an entity type.
     * @param sample A sample entity (for default values)
     * @returns (partial: Partial<TEntity>) => TEntity
     */
    export function createFromPartial<TEntity extends object>(sample: TEntity): (partial: Partial<TEntity>) => TEntity {
        return (partial: Partial<TEntity>): TEntity => {
            const out: any = { ...sample };
            for (const k of Object.keys(partial)) {
                out[k] = partial[k as keyof TEntity];
            }
            return out as TEntity;
        };
    }

    /**
     * Create a Schema from a sample entity and keyParameters
     * @param entityFactory A factory function to create new instances of the entity
     * @param keyParameters Keys used for primary key
     * @returns Repository.Ports.Schema<TEntity, Key>
     */
    export function createSchema<TEntity extends object, Key extends keyof TEntity>(
        entityFactory: () => TEntity,
        keyParameters: Key[]
    ): Repository.Ports.Schema<TEntity, Key> {
        const sample = entityFactory();
        return {
            parameters: getParametersFromEntity(sample),
            keyParameters,
            fromPartial: createFromPartial(sample),
            instantiate: entityFactory,
        };
    }
}
