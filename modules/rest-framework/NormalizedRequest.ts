/**
 * RestFramework - Normalized Request Utilities
 */

import type { NormalizedRequest } from './Types';

export function coerceParamValue(v: any): any {
    if (typeof v !== 'string') return v;
    const s = v.trim();

    if (s === '') return v;

    // boolean
    if (s === 'true') return true;
    if (s === 'false') return false;

    // number (integer/float)
    if (/^-?\d+(\.\d+)?$/.test(s)) {
        const n = Number(s);
        if (!Number.isNaN(n)) return n;
    }

    return v;
}

export function tryCoerceNumber(v: any): number | undefined {
    if (typeof v === 'number' && !Number.isNaN(v)) return v;
    if (typeof v === 'string') {
        const s = v.trim();
        if (s !== '' && /^-?\d+(\.\d+)?$/.test(s)) {
            const n = Number(s);
            if (!Number.isNaN(n)) return n;
        }
    }
    return undefined;
}

export function normalizeDoGet(e: GoogleAppsScript.Events.DoGet): NormalizedRequest {
    // parameter only
    const params: NormalizedRequest = {};
    const p = e.parameter ?? {};
    for (const k of Object.keys(p)) params[k] = coerceParamValue((p as any)[k]);
    return params;
}

export function normalizeDoPost(e: GoogleAppsScript.Events.DoPost): NormalizedRequest {
    // parameter (coerce)
    const params: NormalizedRequest = {};
    const p = e.parameter ?? {};
    for (const k of Object.keys(p)) params[k] = coerceParamValue((p as any)[k]);

    // body (raw JSON)
    let body: NormalizedRequest = {};
    const contents = e.postData?.contents;
    if (contents) {
        try {
            const parsed = JSON.parse(contents);
            if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
                body = parsed;
            }
        } catch {
            // ignore invalid JSON
        }
    }

    // Shallow coerce top-level body values (keep nested objects intact)
    const coercedBody: NormalizedRequest = {};
    for (const k of Object.keys(body)) {
        coercedBody[k] = coerceParamValue((body as any)[k]);
    }

    return { ...params, ...coercedBody };
}
