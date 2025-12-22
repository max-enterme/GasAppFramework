namespace RestFramework {
    /**
     * Field type enum for schema definitions
     */
    export enum FieldType {
        String = 'string',
        Number = 'number',
        Boolean = 'boolean',
        Any = 'any',
    }

    /**
     * Field specification for request mapping
     */
    export interface FieldSpec {
        /** Source key in NormalizedRequest */
        key: string;
        /** Target key in the output object (defaults to source key if not specified) */
        targetKey?: string;
        /** Field type */
        type: FieldType;
        /** Whether the field is required */
        required?: boolean;
        /** Default value if field is missing (only for optional fields) */
        defaultValue?: any;
        /** Custom transformation function */
        transform?: (value: any) => any;
    }

    /**
     * Request mapping schema
     */
    export interface RequestMappingSchema {
        /** Field specifications */
        fields?: FieldSpec[];
    }

    /**
     * Generic schema-based request mapper for DoGet/DoPost endpoints
     * Eliminates need for custom mapper classes in simple cases
     */
    export class SchemaRequestMapper<TRequest> extends RestFramework.NormalizedRequestMapper<TRequest> {
        constructor(private readonly schema: RequestMappingSchema) {
            super();
        }

        protected mapInternal(): TRequest {
            const result: any = {};

            // Process field specifications
            if (this.schema.fields) {
                for (const fieldSpec of this.schema.fields) {
                    const targetKey = fieldSpec.targetKey || fieldSpec.key;
                    let value: any;

                    // Get value based on type and required flag
                    switch (fieldSpec.type) {
                        case FieldType.String:
                            value = fieldSpec.required
                                ? this.requireString(fieldSpec.key)
                                : this.getString(fieldSpec.key, fieldSpec.defaultValue);
                            break;
                        case FieldType.Number:
                            value = fieldSpec.required
                                ? this.requireNumber(fieldSpec.key)
                                : this.getNumber(fieldSpec.key, fieldSpec.defaultValue);
                            break;
                        case FieldType.Boolean:
                            value = fieldSpec.required
                                ? this.requireBoolean(fieldSpec.key)
                                : this.getBoolean(fieldSpec.key, fieldSpec.defaultValue);
                            break;
                        case FieldType.Any:
                            value = this.request[fieldSpec.key];
                            if (value === undefined && fieldSpec.required) {
                                throw new Error(`Missing required parameter '${fieldSpec.key}'`);
                            }
                            if (value === undefined) {
                                value = fieldSpec.defaultValue;
                            }
                            break;
                    }

                    // Apply custom transformation if provided
                    if (fieldSpec.transform && value !== undefined) {
                        value = fieldSpec.transform(value);
                    }

                    // Only set if value is not undefined
                    if (value !== undefined) {
                        result[targetKey] = value;
                    }
                }
            }

            return result as TRequest;
        }
    }
}
