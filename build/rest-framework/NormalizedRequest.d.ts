/**
 * RestFramework - Normalized Request Utilities
 */
import type { NormalizedRequest } from './Types';
export declare function coerceParamValue(v: any): any;
export declare function tryCoerceNumber(v: any): number | undefined;
export declare function normalizeDoGet(e: GoogleAppsScript.Events.DoGet): NormalizedRequest;
export declare function normalizeDoPost(e: GoogleAppsScript.Events.DoPost): NormalizedRequest;
//# sourceMappingURL=NormalizedRequest.d.ts.map