namespace Routing.Adapters.GAS {
    export type WebContext = {
        method: string
        path: string
        query?: { [k: string]: string }
        body?: string
        headers?: { [k: string]: string }
        params?: any
    }

    export function fromDoGet(e: GoogleAppsScript.Events.DoGet): WebContext {
        const path = String((e as any).pathInfo || '/');
        const q: any = {};
        if (e.parameter) for (const k in e.parameter) q[k] = e.parameter[k];
        return { method: 'GET', path, query: q };
    }

    export function fromDoPost(e: GoogleAppsScript.Events.DoPost): WebContext {
        const path = String((e as any).pathInfo || '/');
        const q: any = {};
        if ((e as any).parameter) for (const k in (e as any).parameter) q[k] = (e as any).parameter[k];
        return { method: 'POST', path, query: q, body: e.postData?.contents ?? '' };
    }
}
