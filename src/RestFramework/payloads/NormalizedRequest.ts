namespace RestFramework {
    export type NormalizedRequest = Routing.NormalizedRequest;

    export function coerceParamValue(v: any): any {
        return Routing.coerceParamValue(v);
    }

    export function tryCoerceNumber(v: any): number | undefined {
        return Routing.tryCoerceNumber(v);
    }

    export function normalizeDoGet(e: GoogleAppsScript.Events.DoGet): NormalizedRequest {
        return Routing.normalizeDoGet(e);
    }

    export function normalizeDoPost(e: GoogleAppsScript.Events.DoPost): NormalizedRequest {
        return Routing.normalizeDoPost(e);
    }
}
