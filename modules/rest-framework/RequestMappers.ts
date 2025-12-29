/**
 * RestFramework Module - Request Mappers
 */

import type { RequestMapper, NormalizedRequest } from './Types';

/**
 * Base class for RequestMappers that use NormalizedRequest
 * Provides helper methods to access values with proper typing and defaults
 */
export abstract class NormalizedRequestMapper<TRequest>
    implements RequestMapper<NormalizedRequest, TRequest>
{
    protected request: NormalizedRequest | undefined;

    /**
     * Get a string value from normalized request
     * @param key The key to retrieve
     * @param defaultValue Optional default if key is missing or empty
     */
    protected getString(key: string, defaultValue?: string): string | undefined {
        const v = this.request?.[key];
        if (v === undefined || v === null || v === '') {
            return defaultValue;
        }
        return String(v);
    }

    /**
     * Get a number value from normalized request
     * @param key The key to retrieve
     * @param defaultValue Optional default if key is missing or not a valid number
     */
    protected getNumber(key: string, defaultValue?: number): number | undefined {
        const v = this.request?.[key];
        if (v === undefined || v === null) {
            return defaultValue;
        }
        if (typeof v === 'number' && !Number.isNaN(v)) {
            return v;
        }
        const n = Number(v);
        return Number.isNaN(n) ? defaultValue : n;
    }

    /**
     * Get a boolean value from normalized request
     * @param key The key to retrieve
     * @param defaultValue Optional default if key is missing
     */
    protected getBoolean(key: string, defaultValue?: boolean): boolean | undefined {
        const v = this.request?.[key];
        if (v === undefined || v === null) {
            return defaultValue;
        }
        if (typeof v === 'boolean') {
            return v;
        }
        // Handle string coercion
        if (v === 'true' || v === '1' || v === 1) return true;
        if (v === 'false' || v === '0' || v === 0) return false;
        return defaultValue;
    }

    /**
     * Require a string value - throws if missing or empty
     * @param key The key to retrieve
     */
    protected requireString(key: string): string {
        const v = this.getString(key);
        if (v === undefined) {
            throw new Error(`Missing required parameter '${key}'`);
        }
        return v;
    }

    /**
     * Require a number value - throws if missing or not a valid number
     * @param key The key to retrieve
     */
    protected requireNumber(key: string): number {
        const v = this.getNumber(key);
        if (v === undefined) {
            throw new Error(`Missing required parameter '${key}'`);
        }
        return v;
    }

    /**
     * Require a boolean value - throws if missing
     * @param key The key to retrieve
     */
    protected requireBoolean(key: string): boolean {
        const v = this.getBoolean(key);
        if (v === undefined) {
            throw new Error(`Missing required parameter '${key}'`);
        }
        return v;
    }

    /**
     * Map method to be implemented by concrete mappers
     */
    map(request: NormalizedRequest): TRequest {
        this.request = request;
        return this.mapInternal();
    }

    protected abstract mapInternal(): TRequest;
}

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
export class SchemaRequestMapper<TRequest> extends NormalizedRequestMapper<TRequest> {
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
                        value = this.request![fieldSpec.key];
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
